import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Check for existing session
    const savedUser = localStorage.getItem('healthcareUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      // Mock authentication - in real app, this would call your backend
      const mockUser = {
        id: Date.now().toString(),
        email,
        role: email.includes('doctor') ? 'doctor' : email.includes('nurse') ? 'nurse' : 'patient',
        name: email.split('@')[0],
        profilePicture: `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face`,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('healthcareUser', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email, password, role, name) => {
    try {
      const mockUser = {
        id: Date.now().toString(),
        email,
        role,
        name,
        profilePicture: `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face`,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('healthcareUser', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = () => {
    localStorage.removeItem('healthcareUser');
    setUser(null);
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};