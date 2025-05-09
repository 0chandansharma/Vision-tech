import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import videosApi from '../../api/videosApi';
import { Video, VideoWithDetails, VideoUploadParams } from '../../types/video.types';

interface VideosState {
  videos: VideoWithDetails[];
  video: VideoWithDetails | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
}

const initialState: VideosState = {
  videos: [],
  video: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,
};

export const fetchVideosByProject = createAsyncThunk(
  'videos/fetchVideosByProject',
  async (projectId: number, { rejectWithValue }) => {
    try {
      return await videosApi.getVideosByProject(projectId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch videos');
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  'videos/fetchVideoById',
  async (videoId: number, { rejectWithValue }) => {
    try {
      return await videosApi.getVideoById(videoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch video');
    }
  }
);

export const uploadVideo = createAsyncThunk(
  'videos/uploadVideo',
  async ({ projectId, file, onProgress }: VideoUploadParams, { dispatch, rejectWithValue }) => {
    try {
      return await videosApi.uploadVideo(
        projectId,
        file,
        (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          dispatch(setUploadProgress(percentCompleted));
          if (onProgress) {
            onProgress(percentCompleted);
          }
        }
      );
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to upload video');
    }
  }
);

export const deleteVideo = createAsyncThunk(
  'videos/deleteVideo',
  async (videoId: number, { rejectWithValue }) => {
    try {
      await videosApi.deleteVideo(videoId);
      return videoId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete video');
    }
  }
);

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearVideoError: (state) => {
      state.error = null;
    },
    resetVideo: (state) => {
      state.video = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Videos by Project
      .addCase(fetchVideosByProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideosByProject.fulfilled, (state, action: PayloadAction<VideoWithDetails[]>) => {
        state.isLoading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideosByProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Video by ID
      .addCase(fetchVideoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action: PayloadAction<VideoWithDetails>) => {
        state.isLoading = false;
        state.video = action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Upload Video
      .addCase(uploadVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadVideo.fulfilled, (state, action: PayloadAction<Video>) => {
        state.isLoading = false;
        state.uploadProgress = 100;
        // Note: The video object returned from upload might not have all the details
        // You might need to fetch the full video details after upload
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.uploadProgress = 0;
      })
      
      // Delete Video
      .addCase(deleteVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVideo.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.videos = state.videos.filter((video) => video.id !== action.payload);
        if (state.video && state.video.id === action.payload) {
          state.video = null;
        }
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearVideoError, resetVideo, setUploadProgress, resetUploadProgress } = videosSlice.actions;
export default videosSlice.reducer;