// src/api/detectionApi.ts
import axiosInstance from './axiosConfig';
import { 
  DetectionJob, 
  DetectionModel, 
  FrameDetection, 
  Timeline,
  ObjectThumbnail
} from '../types/detection.types';

const detectionApi = {
  getAvailableModels: async (): Promise<DetectionModel[]> => {
    const response = await axiosInstance.get('/detection/models');
    return response.data;
  },
  
  createDetectionJob: async (
    videoId: number, 
    modelName: string, 
    parameters?: Record<string, any>
  ): Promise<DetectionJob> => {
    const response = await axiosInstance.post(`/detection/videos/${videoId}/jobs`, {
      model_name: modelName,
      parameters
    });
    return response.data;
  },
  
  getDetectionJob: async (jobId: number): Promise<DetectionJob> => {
    const response = await axiosInstance.get(`/detection/jobs/${jobId}`);
    return response.data;
  },
  
  getDetectionJobsForVideo: async (videoId: number): Promise<DetectionJob[]> => {
    const response = await axiosInstance.get(`/detection/videos/${videoId}/jobs`);
    return response.data;
  },
  
  getDetectionFrames: async (
    jobId: number,
    options?: {
      skip?: number;
      limit?: number;
      startTime?: number;
      endTime?: number;
    }
  ): Promise<FrameDetection[]> => {
    const params = new URLSearchParams();
    
    if (options?.skip) params.append('skip', options.skip.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.startTime) params.append('start_time', options.startTime.toString());
    if (options?.endTime) params.append('end_time', options.endTime.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosInstance.get(`/detection/jobs/${jobId}/frames${query}`);
    return response.data;
  },
  
  getDetectionTimeline: async (jobId: number): Promise<Timeline> => {
    const response = await axiosInstance.get(`/detection/jobs/${jobId}/timeline`);
    return response.data;
  },
  
  getDetectedObjects: async (
    jobId: number,
    options?: {
      className?: string;
      minConfidence?: number;
      limit?: number;
    }
  ): Promise<ObjectThumbnail[]> => {
    const params = new URLSearchParams();
    
    if (options?.className) params.append('class_name', options.className);
    if (options?.minConfidence) params.append('min_confidence', options.minConfidence.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosInstance.get(`/detection/jobs/${jobId}/objects${query}`);
    return response.data;
  },
  
  exportDetectionResults: async (
    jobId: number,
    format: 'json' | 'csv' | 'video'
  ): Promise<{ status: string; message: string; download_url: string }> => {
    const response = await axiosInstance.post(`/detection/jobs/${jobId}/export?format=${format}`);
    return response.data;
  },
  
  cancelDetectionJob: async (jobId: number): Promise<DetectionJob> => {
    const response = await axiosInstance.post(`/detection/jobs/${jobId}/cancel`);
    return response.data;
  },

  testYolo: async (
    file: File,
    model: string = 'yolov8n',
    conf: number = 0.25
  ): Promise<{ status: string; model: string; detections: any[]; count: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      `/detection/test-yolo?model=${model}&conf=${conf}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }
};

export default detectionApi;