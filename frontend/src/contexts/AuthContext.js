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
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('sah_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('sah_user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Get existing providers from localStorage
          const existingProviders = JSON.parse(localStorage.getItem('sah_providers') || '[]');
          
          // Check if email already exists
          const emailExists = existingProviders.some(p => 
            p.email?.toLowerCase() === userData.email?.toLowerCase()
          );
          
          if (emailExists) {
            resolve({ success: false, error: 'Email already registered' });
            return;
          }

          // Create new provider object
          const newProvider = {
            id: 'client-' + Date.now(),
            email: userData.email,
            name: userData.fullName || userData.businessName,
            fullName: userData.fullName,
            businessName: userData.businessName,
            accountType: userData.accountType,
            phone: userData.phone,
            whatsapp: userData.whatsapp,
            inquiryEmail: userData.inquiryEmail,
            website: userData.website,
            socialLinks: {
              facebook: userData.facebook,
              twitter: userData.twitter,
              instagram: userData.instagram,
              linkedin: userData.linkedin,
              pinterest: userData.pinterest,
              tiktok: userData.tiktok
            },
            bio: userData.bio,
            experience: userData.experience,
            languages: userData.languages,
            otherLanguage: userData.otherLanguage,
            primaryCategory: userData.primaryCat,
            secondaryCategories: userData.secondaryCats,
            serviceTitle: userData.serviceTitle,
            serviceDescription: userData.serviceDesc,
            subjects: userData.subjects,
            ageGroups: userData.ageGroups,
            deliveryMode: userData.deliveryMode,
            city: userData.city,
            province: userData.province,
            serviceArea: userData.serviceArea,
            localRadius: userData.localRadius,
            pricingModel: userData.pricingModel,
            startingPrice: userData.startingPrice,
            daysAvailable: userData.daysAvailable,
            timeSlots: userData.timeSlots,
            listingPlan: userData.listingPlan,
            tier: userData.listingPlan?.includes('Featured') ? 'featured' : 
                  userData.listingPlan?.includes('Professional') ? 'pro' : 'free',
            status: 'pending',
            registered: new Date().toISOString(),
            rating: 0,
            reviewCount: 0
          };

          // Save to localStorage
          existingProviders.push(newProvider);
          localStorage.setItem('sah_providers', JSON.stringify(existingProviders));
          
          // Create user session
          const userSession = {
            email: userData.email,
            role: 'client',
            name: userData.fullName || userData.businessName || userData.email.split('@')[0],
            id: newProvider.id,
            plan: newProvider.tier,
            status: 'pending'
          };
          
          setUser(userSession);
          localStorage.setItem('sah_user', JSON.stringify(userSession));
          
          resolve({ success: true, user: userSession });
        } catch (error) {
          resolve({ success: false, error: 'Registration failed' });
        }
      }, 500);
    });
  };

  const login = (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check in providers list first
        const existingProviders = JSON.parse(localStorage.getItem('sah_providers') || '[]');
        const providerMatch = existingProviders.find(p => 
          p.email?.toLowerCase() === email.toLowerCase()
        );

        // Admin login
        if (email === 'admin@sahomeschooling.co.za' && password === 'admin123') {
          const userData = {
            email,
            role: 'admin',
            name: 'Admin User',
            id: 'admin1'
          };
          setUser(userData);
          localStorage.setItem('sah_user', JSON.stringify(userData));
          resolve({ 
            success: true, 
            user: userData,
            message: 'Admin login successful!'
          });
        } 
        // Provider found in registered list
        else if (providerMatch && password.length >= 6) {
          const userData = {
            email,
            role: 'client',
            name: providerMatch.fullName || providerMatch.businessName || email.split('@')[0],
            id: providerMatch.id,
            plan: providerMatch.tier || 'free',
            status: providerMatch.status || 'active'
          };
          setUser(userData);
          localStorage.setItem('sah_user', JSON.stringify(userData));
          resolve({ 
            success: true, 
            user: userData,
            message: `Welcome back, ${userData.name}!`
          });
        }
        // Demo user
        else if (email === 'contact@khanacademy.org.za' && password.length >= 6) {
          const userData = {
            email,
            role: 'client',
            name: 'Khan Academy SA',
            id: 'khan',
            plan: 'free',
            status: 'pending'
          };
          setUser(userData);
          localStorage.setItem('sah_user', JSON.stringify(userData));
          resolve({ 
            success: true, 
            user: userData,
            message: 'Welcome back!'
          });
        } 
        // Allow any email with 6+ char password for demo
        else if (password.length >= 6) {
          const userData = {
            email,
            role: 'client',
            name: email.split('@')[0],
            id: 'client-' + Date.now(),
            plan: 'free',
            status: 'pending'
          };
          setUser(userData);
          localStorage.setItem('sah_user', JSON.stringify(userData));
          resolve({ 
            success: true, 
            user: userData,
            message: 'Login successful!'
          });
        } 
        // Invalid credentials
        else {
          resolve({ 
            success: false, 
            error: 'Invalid credentials. Try admin@sahomeschooling.co.za / admin123'
          });
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sah_user');
  };

  const updateUserPlan = (plan) => {
    if (user) {
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      localStorage.setItem('sah_user', JSON.stringify(updatedUser));
      
      // Also update in providers list if exists
      const existingProviders = JSON.parse(localStorage.getItem('sah_providers') || '[]');
      const providerIndex = existingProviders.findIndex(p => p.id === user.id);
      if (providerIndex !== -1) {
        existingProviders[providerIndex].tier = plan;
        localStorage.setItem('sah_providers', JSON.stringify(existingProviders));
      }
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUserPlan
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};