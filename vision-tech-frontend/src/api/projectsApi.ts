import axiosInstance from './axiosConfig';
import { Project, ProjectCreate } from '../types/project.types';

const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    const response = await axiosInstance.get('/projects');
    return response.data;
  },
  
  getProjectById: async (id: number): Promise<Project> => {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  },
  
  createProject: async (project: ProjectCreate): Promise<Project> => {
    const response = await axiosInstance.post('/projects', project);
    return response.data;
  },
  
  updateProject: async (id: number, project: Partial<Project>): Promise<Project> => {
    const response = await axiosInstance.put(`/projects/${id}`, project);
    return response.data;
  },
  
  deleteProject: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/projects/${id}`);
  },
};

export default projectsApi;