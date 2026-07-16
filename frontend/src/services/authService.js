import api from './api';

/**
 * Authentication API service.
 * Matches the Spring Boot AuthController endpoints.
 */
const authService = {
  /**
   * Register a new user.
   * POST /auth/register
   * @param {{ fullName: string, email: string, password: string, role: string, departmentId: number }} data
   * @returns {Promise<{ accesToken: string, message: string }>}
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data?.data;
  },

  /**
   * Log in an existing user.
   * POST /auth/login
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{ accessToken: string, message: string }>}
   */
  async login(data) {
    const response = await api.post('/auth/login', data);
    return response.data?.data;
  },

  /**
   * Store the access token in localStorage.
   */
  setToken(token) {
    localStorage.setItem('accessToken', token);
  },

  /**
   * Retrieve the stored access token.
   */
  getToken() {
    return localStorage.getItem('accessToken');
  },

  /**
   * Remove the access token (logout).
   */
  removeToken() {
    localStorage.removeItem('accessToken');
  },

  /**
   * Store user data in localStorage.
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Retrieve stored user data.
   */
  getUser() {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  },

  /**
   * Clear all auth data.
   */
  clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
};

export default authService;
