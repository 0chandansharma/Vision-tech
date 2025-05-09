import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import detectionApi from '../../api/detectionApi';
import { 
  DetectionJob, 
  DetectionModel, 
  FrameDetection, 
  Timeline,
  ObjectThumbnail
} from '../../types/detection.types';

interface DetectionState {
  availableModels: DetectionModel[];
  jobs: DetectionJob[];
  currentJob: DetectionJob | null;
  frames: FrameDetection[];
  timeline: Timeline | null;
  objects: ObjectThumbnail[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DetectionState = {
  availableModels: [],
  jobs: [],
  currentJob: null,
  frames: [],
  timeline: null,
  objects: [],
  isLoading: false,
  error: null,
};

export const fetchAvailableModels = createAsyncThunk(
  'detection/fetchAvailableModels',
  async (_, { rejectWithValue }) => {
    try {
      return await detectionApi.getAvailableModels();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch detection models');
    }
  }
);

export const createDetectionJob = createAsyncThunk(
  'detection/createDetectionJob',
  async (
    { videoId, modelName, parameters }: { videoId: number; modelName: string; parameters?: Record<string, any> },
    { rejectWithValue }
  ) => {
    try {
      return await detectionApi.createDetectionJob(videoId, modelName, parameters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create detection job');
    }
  }
);

export const fetchDetectionJobs = createAsyncThunk(
  'detection/fetchDetectionJobs',
  async (videoId: number, { rejectWithValue }) => {
    try {
      return await detectionApi.getDetectionJobsForVideo(videoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch detection jobs');
    }
  }
);

export const fetchDetectionJobsForVideo = createAsyncThunk(
  'detection/fetchDetectionJobsForVideo',
  async (videoId: number, { rejectWithValue }) => {
    try {
      return await detectionApi.getDetectionJobsForVideo(videoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch detection jobs');
    }
  }
);

export const fetchDetectionJob = createAsyncThunk(
  'detection/fetchDetectionJob',
  async (jobId: number, { rejectWithValue }) => {
    try {
      return await detectionApi.getDetectionJob(jobId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch detection job');
    }
  }
);

export const fetchDetectionFrames = createAsyncThunk(
  'detection/fetchDetectionFrames',
  async (
    { jobId, options }: { 
      jobId: number; 
      options?: { 
        skip?: number; 
        limit?: number; 
        startTime?: number; 
        endTime?: number; 
      } 
    },
    { rejectWithValue }
  ) => {
    try {
      return await detectionApi.getDetectionFrames(jobId, options);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch detection frames');
    }
  }
);

export const fetchDetectionTimeline = createAsyncThunk(
  'detection/fetchDetectionTimeline',
  async (jobId: number, { rejectWithValue }) => {
    try {
      return await detectionApi.getDetectionTimeline(jobId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch detection timeline');
    }
  }
);

export const fetchDetectedObjects = createAsyncThunk(
  'detection/fetchDetectedObjects',
  async (
    { jobId, options }: { 
      jobId: number; 
      options?: { 
        className?: string; 
        minConfidence?: number; 
        limit?: number; 
      } 
    },
    { rejectWithValue }
  ) => {
    try {
      return await detectionApi.getDetectedObjects(jobId, options);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch detected objects');
    }
  }
);

export const exportDetectionResults = createAsyncThunk(
  'detection/exportDetectionResults',
  async (
    { jobId, format }: { jobId: number; format: 'json' | 'csv' | 'video' },
    { rejectWithValue }
  ) => {
    try {
      return await detectionApi.exportDetectionResults(jobId, format);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to export detection results');
    }
  }
);

export const cancelDetectionJob = createAsyncThunk(
  'detection/cancelDetectionJob',
  async (jobId: number, { rejectWithValue }) => {
    try {
      return await detectionApi.cancelDetectionJob(jobId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to cancel detection job');
    }
  }
);

const detectionSlice = createSlice({
  name: 'detection',
  initialState,
  reducers: {
    clearDetectionError: (state) => {
      state.error = null;
    },
    resetDetectionState: (state) => {
      state.currentJob = null;
      state.frames = [];
      state.timeline = null;
      state.objects = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Available Models
      .addCase(fetchAvailableModels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableModels.fulfilled, (state, action: PayloadAction<DetectionModel[]>) => {
        state.isLoading = false;
        state.availableModels = action.payload;
      })
      .addCase(fetchAvailableModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Detection Job
      .addCase(createDetectionJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDetectionJob.fulfilled, (state, action: PayloadAction<DetectionJob>) => {
        state.isLoading = false;
        state.jobs.unshift(action.payload);
        state.currentJob = action.payload;
      })
      .addCase(createDetectionJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Detection Jobs for Video
      .addCase(fetchDetectionJobsForVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDetectionJobsForVideo.fulfilled, (state, action: PayloadAction<DetectionJob[]>) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchDetectionJobsForVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Detection Job
      .addCase(fetchDetectionJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDetectionJob.fulfilled, (state, action: PayloadAction<DetectionJob>) => {
        state.isLoading = false;
        state.currentJob = action.payload;
        // Update in the jobs array if it exists
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(fetchDetectionJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Detection Frames
      .addCase(fetchDetectionFrames.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDetectionFrames.fulfilled, (state, action: PayloadAction<FrameDetection[]>) => {
        state.isLoading = false;
        state.frames = action.payload;
      })
      .addCase(fetchDetectionFrames.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Detection Timeline
      .addCase(fetchDetectionTimeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDetectionTimeline.fulfilled, (state, action: PayloadAction<Timeline>) => {
        state.isLoading = false;
        state.timeline = action.payload;
      })
      .addCase(fetchDetectionTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Detected Objects
      .addCase(fetchDetectedObjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDetectedObjects.fulfilled, (state, action: PayloadAction<ObjectThumbnail[]>) => {
        state.isLoading = false;
        state.objects = action.payload;
      })
      .addCase(fetchDetectedObjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Export Detection Results
      .addCase(exportDetectionResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportDetectionResults.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportDetectionResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDetectionError, resetDetectionState } = detectionSlice.actions;
export default detectionSlice.reducer;