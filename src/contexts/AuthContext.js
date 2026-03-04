import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = authService.getAuthToken();
    const savedUser = authService.getUserData();
    
    if (token && savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { user, token } = response;
      
      if (!user || !token) {
        return { success: false, error: 'Invalid response from server. Missing user or token.' };
      }
      
      authService.setAuthToken(token);
      authService.setUserData(user);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.removeAuthToken();
      authService.removeUserData();
      setUser(null);
      navigate('/login');
    }
  };

  // Helper function to check if user has a specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  // Helper function to check if user can access users management
  const canManageUsers = () => {
    return user?.role === 'ADMIN';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    isAdmin,
    canManageUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
