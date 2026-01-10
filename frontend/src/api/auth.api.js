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
};

export default authApi;
