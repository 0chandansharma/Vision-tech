// src/api/usersApi.ts
import axiosInstance from './axiosConfig';
import { User, UserCreate, UserUpdate } from '../types/user.types';

const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },
  
  getUserById: async (id: number): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },
  
  createUser: async (userData: UserCreate): Promise<User> => {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  },
  
  updateUser: async (id: number, userData: UserUpdate): Promise<User> => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  }
};

export default usersApi;