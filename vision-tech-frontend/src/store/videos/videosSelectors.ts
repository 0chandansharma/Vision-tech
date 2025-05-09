// Selectors for videos state
import { RootState } from '../index';

export const selectAllVideos = (state: RootState) => state.videos.videos;
export const selectVideoById = (id: number) => (state: RootState) => 
  state.videos.videos.find(video => video.id === id);
export const selectCurrentVideo = (state: RootState) => state.videos.video;
export const selectVideosLoading = (state: RootState) => state.videos.isLoading;
export const selectVideosError = (state: RootState) => state.videos.error;