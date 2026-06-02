// backend/src/controllers/paymentController.js
const crypto = require('crypto');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

// ── Helpers ───────────────────────────────────────────────────────────────────
function paystackRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('Invalid Paystack response')); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const PLAN_AMOUNTS = {
  free: 0,
  pro: 14900, // ZAR 149.00 in kobo/cents
};

// ── POST /api/payments/initialize ────────────────────────────────────────────
exports.initializePayment = async (req, res) => {
  try {
    const { plan } = req.body;
    const email = req.user?.email;

    if (!email) return res.status(401).json({ error: 'Not authenticated' });

    const amount = PLAN_AMOUNTS[plan];
    if (amount === undefined) return res.status(400).json({ error: 'Invalid plan' });
    if (amount === 0) return res.json({ free: true, message: 'Free plan — no payment required' });

    const reference = `SAH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await paystackRequest('POST', '/transaction/initialize', {
      email,
      amount,
      currency: 'ZAR',
      reference,
      metadata: {
        plan,
        userId: req.user?.id,
        custom_fields: [{ display_name: 'Plan', variable_name: 'plan', value: plan }],
      },
    });

    if (!result.status) {
      return res.status(502).json({ error: result.message || 'Paystack initialization failed' });
    }

    res.json({
      reference: result.data.reference,
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
    });
  } catch (err) {
    console.error('Payment initialize error:', err);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
};

// ── GET /api/payments/verify/:reference ──────────────────────────────────────
exports.verifyTransaction = async (req, res) => {
  try {
    const { reference } = req.params;
    const result = await paystackRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`);

    if (!result.status || result.data.status !== 'success') {
      return res.status(402).json({ verified: false, message: result.data?.gateway_response || 'Payment not successful' });
    }

    // Update the provider's listing plan in the DB
    const plan = result.data.metadata?.plan;
    const userId = req.user?.id;

    if (userId && plan && plan !== 'free') {
      await prisma.providerProfile.updateMany({
        where: { userId },
        data: { listingPlan: plan },
      });
    }

    res.json({
      verified: true,
      reference: result.data.reference,
      plan,
      amount: result.data.amount,
      currency: result.data.currency,
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

// ── POST /api/payments/webhook ────────────────────────────────────────────────
// Paystack signs every webhook with HMAC-SHA512 of the raw body
exports.verifyPaystackWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(req.body) // raw Buffer — must use express.raw() on this route
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === 'charge.success') {
      const { reference, metadata, amount, currency } = event.data;
      const plan = metadata?.plan;
      const userId = metadata?.userId;

      console.log(`✅ Paystack charge.success: ref=${reference} plan=${plan} user=${userId} amount=${amount} ${currency}`);

      if (userId && plan && plan !== 'free') {
        await prisma.providerProfile.updateMany({
          where: { userId },
          data: { listingPlan: plan },
        });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
};
