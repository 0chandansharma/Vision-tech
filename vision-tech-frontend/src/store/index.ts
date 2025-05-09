import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import projectsReducer from './projects/projectsSlice';
import videosReducer from './videos/videosSlice';
import detectionReducer from './detection/detectionSlice';
import uiReducer from './ui/uiSlice';
import adminReducer from './admin/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    videos: videosReducer,
    detection: detectionReducer,
    ui: uiReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;