// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('sah_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (e) {
      localStorage.removeItem('sah_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const register = async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const existingProviders = JSON.parse(localStorage.getItem('sah_providers') || '[]');
          const userEmail = userData?.email || '';
          const emailExists = existingProviders.some(p =>
            p?.email && p.email.toLowerCase() === userEmail.toLowerCase()
          );

          if (emailExists) {
            resolve({ success: false, error: 'Email already registered' });
            return;
          }

          const newProvider = {
            id: 'client-' + Date.now(),
            email: userData?.email || '',
            name: userData?.fullName || userData?.businessName || '',
            fullName: userData?.fullName || '',
            businessName: userData?.businessName || '',
            accountType: userData?.accountType || 'individual',
            phone: userData?.phone || '',
            whatsapp: userData?.whatsapp || '',
            inquiryEmail: userData?.inquiryEmail || '',
            website: userData?.website || '',
            facebook: userData?.facebook || '',
            instagram: userData?.instagram || '',
            linkedin: userData?.linkedin || '',
            tiktok: userData?.tiktok || '',
            twitter: userData?.twitter || '',
            youtube: userData?.youtube || '',
            bio: userData?.bio || '',
            experience: userData?.experience || '',
            languages: userData?.languages || [],
            primaryCategory: userData?.primaryCat || '',
            secondaryCategories: userData?.secondaryCats || [],
            serviceTitle: userData?.serviceTitle || '',
            serviceDescription: userData?.serviceDesc || '',
            subjects: userData?.subjects || '',
            ageGroups: userData?.ageGroups || [],
            deliveryMode: userData?.deliveryMode || '',
            city: userData?.city || '',
            province: userData?.province || '',
            serviceArea: userData?.serviceArea || 'local',
            localRadius: userData?.localRadius || '',
            pricingModel: userData?.pricingModel || '',
            startingPrice: userData?.startingPrice || '',
            daysAvailable: userData?.daysAvailable || [],
            timeSlots: userData?.timeSlots || '',
            listingPlan: userData?.listingPlan || 'Free Listing',
            tier: userData?.listingPlan?.includes('Deluxe') || userData?.listingPlan?.includes('R399')
              ? 'featured'
              : userData?.listingPlan?.includes('Professional') || userData?.listingPlan?.includes('R149')
              ? 'pro'
              : 'free',
            plan: userData?.listingPlan?.includes('Deluxe') || userData?.listingPlan?.includes('R399')
              ? 'featured'
              : userData?.listingPlan?.includes('Professional') || userData?.listingPlan?.includes('R149')
              ? 'pro'
              : 'free',
            password: userData?.password || '',
            status: 'pending',
            registered: new Date().toISOString(),
            rating: 0,
            reviewCount: 0,
          };

          existingProviders.push(newProvider);
          localStorage.setItem('sah_providers', JSON.stringify(existingProviders));

          const userSession = {
            email: userData?.email || '',
            role: 'client',
            name: userData?.fullName || userData?.businessName || (userData?.email || '').split('@')[0] || 'User',
            id: newProvider.id,
            plan: newProvider.tier,
            status: 'pending',
          };

          setUser(userSession);
          localStorage.setItem('sah_user', JSON.stringify(userSession));
          localStorage.setItem('sah_current_user', JSON.stringify(userSession));

          resolve({ success: true, user: userSession });
        } catch (error) {
          console.error('Registration error:', error);
          resolve({ success: false, error: 'Registration failed' });
        }
      }, 300);
    });
  };

  // login accepts EITHER:
  //   login(userObject)          — called from Registration after API success
  //   login(email, password)     — called from Login page
  const login = (emailOrUserObj, password) => {
    // If first arg is an object, treat it as a pre-built user session
    if (emailOrUserObj && typeof emailOrUserObj === 'object') {
      const userData = emailOrUserObj;
      setUser(userData);
      localStorage.setItem('sah_user', JSON.stringify(userData));
      localStorage.setItem('sah_current_user', JSON.stringify(userData));
      return;
    }

    // Otherwise treat as (email, password) call from Login page
    const email = emailOrUserObj;
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const loginEmail = (email || '').toLowerCase();

          // Admin shortcut
          if (loginEmail === 'admin@sahomeschooling.co.za' && password === 'admin123') {
            const userData = { email: loginEmail, role: 'admin', name: 'Admin User', id: 'admin1' };
            setUser(userData);
            localStorage.setItem('sah_user', JSON.stringify(userData));
            localStorage.setItem('sah_current_user', JSON.stringify(userData));
            resolve({ success: true, user: userData, message: 'Admin login successful!' });
            return;
          }

          // Check providers list
          const existingProviders = JSON.parse(localStorage.getItem('sah_providers') || '[]');
          const providerMatch = existingProviders.find(p =>
            p?.email && p.email.toLowerCase() === loginEmail
          );

          if (providerMatch) {
            const savedPw = (providerMatch.password || '').trim();
            if (savedPw && savedPw !== password) {
              resolve({ success: false, error: 'Invalid email or password.' });
              return;
            }
            const userData = {
              email: loginEmail,
              role: 'client',
              name: providerMatch.name || providerMatch.fullName || loginEmail.split('@')[0],
              id: providerMatch.id,
              plan: providerMatch.plan || providerMatch.tier || 'free',
              status: providerMatch.status || 'pending',
            };
            setUser(userData);
            localStorage.setItem('sah_user', JSON.stringify(userData));
            localStorage.setItem('sah_current_user', JSON.stringify(userData));
            resolve({ success: true, user: userData, message: `Welcome back, ${userData.name}!` });
            return;
          }

          // Check sah_users
          const storedUsers = JSON.parse(localStorage.getItem('sah_users') || '[]');
          const userMatch = storedUsers.find(u =>
            (u?.email || '').toLowerCase() === loginEmail
          );

          if (userMatch) {
            const savedPw = (userMatch.password || '').trim();
            if (savedPw && savedPw !== password) {
              resolve({ success: false, error: 'Invalid email or password.' });
              return;
            }
            const userData = {
              email: loginEmail,
              role: userMatch.role || 'client',
              name: userMatch.name || loginEmail.split('@')[0],
              id: userMatch.id,
              plan: userMatch.plan || 'free',
              status: 'pending',
            };
            setUser(userData);
            localStorage.setItem('sah_user', JSON.stringify(userData));
            localStorage.setItem('sah_current_user', JSON.stringify(userData));
            resolve({ success: true, user: userData });
            return;
          }

          // Demo provider
          if (loginEmail === 'contact@khanacademy.org.za') {
            const userData = { email: loginEmail, role: 'client', name: 'Khan Academy SA', id: 'khan', plan: 'free', status: 'pending' };
            setUser(userData);
            localStorage.setItem('sah_user', JSON.stringify(userData));
            localStorage.setItem('sah_current_user', JSON.stringify(userData));
            resolve({ success: true, user: userData, message: 'Welcome back!' });
            return;
          }

          resolve({ success: false, error: 'No account found for that email. Please register first.' });
        } catch (error) {
          console.error('Login error:', error);
          resolve({ success: false, error: 'Login failed. Please try again.' });
        }
      }, 400);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sah_user');
    localStorage.removeItem('sah_current_user');
  };

  const updateUserPlan = (plan) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      localStorage.setItem('sah_user', JSON.stringify(updatedUser));
      localStorage.setItem('sah_current_user', JSON.stringify(updatedUser));

      const existingProviders = JSON.parse(localStorage.getItem('sah_providers') || '[]');
      const providerIndex = existingProviders.findIndex(p => p.id === user.id);
      if (providerIndex !== -1) {
        existingProviders[providerIndex].tier = plan;
        existingProviders[providerIndex].plan = plan;
        localStorage.setItem('sah_providers', JSON.stringify(existingProviders));
      }
    } catch (error) {
      console.error('Error updating user plan:', error);
    }
  };

  const value = { user, loading, register, login, logout, updateUserPlan };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};