const { PrismaClient } = require('@prisma/client');
const { sendError } = require('../utils');

const prisma = new PrismaClient();

const getProviders = async (req, res) => {
  try {
    const providers = await prisma.providerProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
    });
    res.json({ success: true, data: providers });
  } catch (err) {
    sendError(res, 500, 'Failed to fetch providers');
  }
};

const getProviderById = async (req, res) => {
  const { id } = req.params;
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } }, reviews: true },
    });
    if (!provider) return sendError(res, 404, 'Provider not found');
    res.json({ success: true, data: provider });
  } catch (err) {
    sendError(res, 500, 'Failed to fetch provider');
  }
};

const updateProvider = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const provider = await prisma.providerProfile.update({
      where: { id },
      data,
    });
    res.json({ success: true, data: provider });
  } catch (err) {
    sendError(res, 500, 'Failed to update provider');
  }
};

const approveProvider = async (req, res) => {
  const { id } = req.params;
  try {
    const provider = await prisma.providerProfile.update({
      where: { id },
      data: { status: 'APPROVED', publicDisplay: true },
    });
    res.json({ success: true, data: provider });
  } catch (err) {
    sendError(res, 500, 'Failed to approve provider');
  }
};

const rejectProvider = async (req, res) => {
  const { id } = req.params;
  try {
    const provider = await prisma.providerProfile.update({
      where: { id },
      data: { status: 'REJECTED', publicDisplay: false },
    });
    res.json({ success: true, data: provider });
  } catch (err) {
    sendError(res, 500, 'Failed to reject provider');
  }
};

module.exports = { getProviders, getProviderById, updateProvider, approveProvider, rejectProvider };
