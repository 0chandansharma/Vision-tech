// src/api/rolesApi.ts
import axiosInstance from './axiosConfig';
import { Role, RoleCreate, RoleUpdate } from '../types/role.types';

const rolesApi = {
  getRoles: async (): Promise<Role[]> => {
    const response = await axiosInstance.get('/roles');
    return response.data;
  },
  
  getRoleById: async (id: number): Promise<Role> => {
    const response = await axiosInstance.get(`/roles/${id}`);
    return response.data;
  },
  
  createRole: async (roleData: RoleCreate): Promise<Role> => {
    const response = await axiosInstance.post('/roles', roleData);
    return response.data;
  },
  
  updateRole: async (id: number, roleData: RoleUpdate): Promise<Role> => {
    const response = await axiosInstance.put(`/roles/${id}`, roleData);
    return response.data;
  },
  
  deleteRole: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/roles/${id}`);
  }
};

export default rolesApi;