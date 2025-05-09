import axiosInstance from './axiosConfig';
import { Video, VideoWithDetails } from '../types/video.types';

const videosApi = {
  getVideosByProject: async (projectId: number): Promise<VideoWithDetails[]> => {
    const response = await axiosInstance.get(`/videos/project/${projectId}`);
    return response.data;
  },
  
  getVideoById: async (id: number): Promise<VideoWithDetails> => {
    const response = await axiosInstance.get(`/videos/${id}`);
    return response.data;
  },
  
  uploadVideo: async (projectId: number, file: File, onUploadProgress?: (progressEvent: any) => void): Promise<Video> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(
      `/videos/project/${projectId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    
    return response.data;
  },
  
  deleteVideo: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/videos/${id}`);
  },
};

export default videosApi;