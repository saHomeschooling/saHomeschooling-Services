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

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // Mock login - in real app would call API
      setTimeout(() => {
        if (email === 'admin@sahomeschooling.co.za' && password === 'admin123') {
          const userData = {
            email,
            role: 'admin',
            name: 'Admin User',
            id: 'admin1'
          };
          setUser(userData);
          localStorage.setItem('sah_user', JSON.stringify(userData));
          resolve(userData);
        } else if (email === 'contact@khanacademy.org.za' && password.length >= 8) {
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
          resolve(userData);
        } else if (password.length >= 8) {
          // Allow any email with 8+ char password for demo
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
          resolve(userData);
        } else {
          reject(new Error('Invalid credentials'));
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
    }
  };

  const value = {
    user,
    loading,
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