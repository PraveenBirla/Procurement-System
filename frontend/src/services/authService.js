import api from './api';

 
const authService = {
  
  async register(data) {
    const response = await api.post('/auth/register', data);
    console.log(response)
    return response.data?.data;
  },

  
  async login(data) {
    const response = await api.post('/auth/login', data);
    console.log(response.data?.data);
    return response.data?.data;
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
