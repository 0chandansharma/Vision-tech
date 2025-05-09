import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  uploadVideo, 
  deleteVideo 
} from '../store/videos/videosSlice';
import { 
  createDetectionJob, 
  fetchDetectionJobs,
  cancelDetectionJob
} from '../store/detection/detectionSlice';
import { DetectionJobCreate } from '../types/detection.types';

interface UseVideoProcessingReturn {
  videos: any[];
  isLoadingVideos: boolean;
  detectionJobs: any[];
  isLoadingJobs: boolean;
  error: string | null;
  uploadVideo: (videoFile: File, projectId: number) => Promise<any>;
  deleteVideo: (id: number) => Promise<void>;
  createDetectionJob: (jobData: DetectionJobCreate) => Promise<any>;
  getDetectionJobs: (videoId: number) => Promise<void>;
  cancelDetectionJob: (jobId: number) => Promise<void>;
}

export const useVideoProcessing = (): UseVideoProcessingReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const { videos, isLoading: isLoadingVideos } = useSelector((state: RootState) => state.videos);
  const { jobs: detectionJobs, isLoading: isLoadingJobs, error } = useSelector(
    (state: RootState) => state.detection
  );

  const handleUploadVideo = async (videoFile: File, projectId: number): Promise<any> => {
    const result = await dispatch(uploadVideo({ file: videoFile, projectId }));
    if (uploadVideo.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    return result.payload;
  };

  const handleDeleteVideo = async (id: number): Promise<void> => {
    const result = await dispatch(deleteVideo(id));
    if (deleteVideo.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  };

  const handleCreateDetectionJob = async (jobData: DetectionJobCreate): Promise<any> => {
    const result = await dispatch(createDetectionJob({
      videoId: jobData.video_id,
      modelName: jobData.model_name,
      parameters: jobData.parameters
    }));
    if (createDetectionJob.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    return result.payload;
  };

  const handleGetDetectionJobs = async (videoId: number): Promise<void> => {
    await dispatch(fetchDetectionJobs(videoId));
  };

  const handleCancelDetectionJob = async (jobId: number): Promise<void> => {
    await dispatch(cancelDetectionJob(jobId));
  };

  return {
    videos,
    isLoadingVideos,
    detectionJobs,
    isLoadingJobs,
    error,
    uploadVideo: handleUploadVideo,
    deleteVideo: handleDeleteVideo,
    createDetectionJob: handleCreateDetectionJob,
    getDetectionJobs: handleGetDetectionJobs,
    cancelDetectionJob: handleCancelDetectionJob,
  };
};

export default useVideoProcessing;