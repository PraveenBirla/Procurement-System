import { createContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';

 
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!authService.getAccessToken());
  const [isLoading, setIsLoading] = useState(true);

   
  useEffect(() => {
    const token = authService.getAccessToken();
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

   
  const login = useCallback((userData, accessToken, refreshToken) => {
    authService.setTokens(accessToken, refreshToken);
    authService.setUser(userData);

    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  
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
