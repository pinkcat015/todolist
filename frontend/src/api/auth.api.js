import axiosClient from './axiosClient';

const authApi = {
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },
  
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  },
  
  getCurrentUser: () => {
    return axiosClient.get('/auth/me');
  },

  forgotPassword: (email) => {
    return axiosClient.post('/auth/forgot-password', { email });
  },
  
  resetPassword: (token, newPassword) => {
    return axiosClient.post('/auth/reset-password', { token, newPassword });
  }
};

export default authApi;
