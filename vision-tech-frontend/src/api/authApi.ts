import axiosInstance from './axiosConfig';
import { LoginCredentials, User } from '../types/user.types';

const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
  
  testToken: async (): Promise<User> => {
    const response = await axiosInstance.post('/auth/test-token');
    return response.data;
  },
};

export default authApi;