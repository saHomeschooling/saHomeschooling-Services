// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'https://sah-backend.onrender.com';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ── Helper: normalise the two possible API response shapes ───────────────────
// authRoutes.js  → { message, token, user: { id, email, role, name, accountType } }
// authController → { success, data: { token, user }, user, message }
// This function handles both and always returns { token, user }.
const parseAuthResponse = (data) => {
  const token   = data.token   || data.data?.token;
  const rawUser = data.user    || data.data?.user || {};
  return { token, user: rawUser };
};

// ── Hardcoded demo / admin accounts (always available, no API needed) ────────
const DEMO_ACCOUNTS = [
  {
    id: 'admin1',
    email: 'admin@parentals.co.za',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    accountType: 'admin',
  },
  {
    id: 'admin2',
    email: 'admin@sahomeschooling.co.za',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    accountType: 'admin',
  },
  {
    id: 'provider-demo',
    email: 'provider@parentals.co.za',
    password: 'provider123',
    name: 'Demo Provider',
    role: 'provider',
    accountType: 'provider',
    plan: 'free',
    status: 'approved',
  },
  {
    id: 'user-demo',
    email: 'user@parentals.co.za',
    password: 'user123',
    name: 'Demo User',
    role: 'user',
    accountType: 'user',
    plan: 'free',
    status: 'active',
  },
];

// ── Helper: try to find a matching user in localStorage (offline fallback) ───
const findLocalUser = (email, password) => {
  try {
    // Check hardcoded demo/admin accounts first
    const demoMatch = DEMO_ACCOUNTS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (demoMatch) return demoMatch;

    const users     = JSON.parse(localStorage.getItem('sah_users')     || '[]');
    const providers = JSON.parse(localStorage.getItem('sah_providers') || '[]');
    const all       = [...users, ...providers];
    const match     = all.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (!match) return null;
    // Passwords stored locally are plain-text (Registration.js saves them that way)
    if (match.password && match.password !== password) return null;
    return match;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Rehydrate session on mount ──────────────────────────────────────────
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('sah_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('sah_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Persist helper ───────────────────────────────────────────────────────
  const persistUser = (userData) => {
    setUser(userData);
    localStorage.setItem('sah_user',         JSON.stringify(userData));
    localStorage.setItem('sah_current_user', JSON.stringify(userData));
  };

  // ── REGISTER ─────────────────────────────────────────────────────────────
  const register = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:       (userData?.email || '').toLowerCase(),
          password:    userData?.password || '',
          role:        'PROVIDER',
          name:        userData?.fullName || userData?.businessName || '',
          accountType: userData?.accountType || 'Individual Provider',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || 'Registration failed.' };
      }

      const { token, user: rawUser } = parseAuthResponse(data);

      const userSession = {
        ...rawUser,
        token,
        plan:   'free',
        status: 'pending',
      };

      persistUser(userSession);
      return { success: true, user: userSession, message: data.message };

    } catch (err) {
      console.error('[AuthContext] Register error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  // Overloaded:
  //   login(userObject)       — called after registration with a pre-built session
  //   login(email, password)  — called from the Login page
  const login = async (emailOrUserObj, password) => {

    // ── Pre-built session object (post-registration shortcut) ──────────────
    if (emailOrUserObj && typeof emailOrUserObj === 'object') {
      persistUser(emailOrUserObj);
      return { success: true, user: emailOrUserObj };
    }

    const email = (emailOrUserObj || '').trim().toLowerCase();

    // ── Check hardcoded demo/admin accounts first (always work offline) ──────
    const demoUser = DEMO_ACCOUNTS.find(
      u => u.email.toLowerCase() === email && u.password === password
    );
    if (demoUser) {
      const { password: _pw, ...safeUser } = demoUser;
      const token = safeUser.role + '_' + safeUser.id;
      const userData = { ...safeUser, token };
      persistUser(userData);
      if (safeUser.role === 'admin') {
        localStorage.setItem('sah_token', 'admin_' + safeUser.id);
      }
      return { success: true, user: userData, message: 'Welcome back, ' + safeUser.name + '!' };
    }

    // ── Try the real API ─────────────────────────────────────────────────────────── ─────────────────────────────────────────────
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If it's a 401, the user may only exist locally (registered offline/localStorage-only).
        // Fall through to localStorage check so previously-registered profiles can log in.
        if (res.status === 401 || res.status === 404) {
          const localUser = findLocalUser(email, password);
          if (localUser) {
            const userData = {
              id:          localUser.id,
              email:       localUser.email,
              role:        localUser.role        || localUser.accountType || 'PROVIDER',
              name:        localUser.name        || localUser.fullName    || '',
              accountType: localUser.accountType || 'provider',
              plan:        localUser.plan        || localUser.tier        || 'free',
              status:      localUser.status      || 'pending',
              token:       localStorage.getItem('sah_token') || 'local_' + (localUser.id || 'session'),
            };
            persistUser(userData);
            return { success: true, user: userData, message: 'Welcome back!' };
          }
        }
        return {
          success: false,
          error: data.message || 'Invalid email or password.',
        };
      }

      const { token, user: rawUser } = parseAuthResponse(data);
      const userData = { ...rawUser, token };

      persistUser(userData);
      return { success: true, user: userData, message: data.message };

    } catch (err) {
      // Network error — API unreachable (e.g. Render cold-start, offline dev)
      console.warn('[AuthContext] API unreachable, trying localStorage fallback:', err.message);

      const localUser = findLocalUser(email, password);
      if (localUser) {
        const userData = {
          id:          localUser.id,
          email:       localUser.email,
          role:        localUser.role        || localUser.accountType || 'PROVIDER',
          name:        localUser.name        || localUser.fullName    || '',
          accountType: localUser.accountType || 'provider',
          plan:        localUser.plan        || localUser.tier        || 'free',
          token:       localStorage.getItem('sah_token') || 'local_session',
        };
        persistUser(userData);
        return {
          success: true,
          user:    userData,
          message: 'Signed in (offline mode).',
        };
      }

      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem('sah_user');
    localStorage.removeItem('sah_current_user');
    localStorage.removeItem('sah_token');
  };

  // ── UPDATE PLAN ───────────────────────────────────────────────────────────
  const updateUserPlan = (plan) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, plan };
      persistUser(updatedUser);
    } catch (error) {
      console.error('[AuthContext] Error updating user plan:', error);
    }
  };

  const value = { user, loading, register, login, logout, updateUserPlan };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};