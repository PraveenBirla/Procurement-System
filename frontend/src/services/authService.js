import api from './api';

 
const authService = {
  async register(data) {
    try {
      const response = await api.post('/auth/register', data);
      console.log(response);
      return response.data?.data;
    } catch (error) {
      console.warn("Backend unavailable, using mock registration");
      return {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        role: data.role || "ADMIN"
      };
    }
  },

  async login(data) {
    try {
      const response = await api.post('/auth/login', data);
      console.log(response.data?.data);
      return response.data?.data;
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        throw error;
      }
      console.warn("Backend unavailable, using mock login");
      let role = "ADMIN";
      const email = data.email.toLowerCase();
      if (email.includes("manager")) role = "MANAGER";
      else if (email.includes("finance")) role = "FINANCE";
      else if (email.includes("procurement")) role = "PROCUREMENT";
      else if (email.includes("employee")) role = "EMPLOYEE";
      else if (email.includes("supplier")) role = "SUPPLIER";
      
      return {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        role: role
      };
    }
  },

  
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

   
  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  
  removeTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

   
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

   
  getUser() {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  },

   
  clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

export default authService;
