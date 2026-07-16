import { createContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';

/**
 * AuthContext provides authentication state and helpers
 * to all components in the tree.
 */
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!authService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    const token = authService.getToken();
    const storedUser = authService.getUser();
    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  /**
   * Store user + token after successful login.
   */
  const login = useCallback((userData, token) => {
    authService.setToken(token);
    authService.setUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  /**
   * Clear auth state on logout.
   */
  const logout = useCallback(() => {
    authService.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
