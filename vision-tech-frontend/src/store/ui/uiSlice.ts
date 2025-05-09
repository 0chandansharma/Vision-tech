import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  currentTab: number;
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
  }>;
}

const initialState: UIState = {
  sidebarOpen: true,
  currentTab: 0,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setCurrentTab: (state, action: PayloadAction<number>) => {
      state.currentTab = action.payload;
    },
    addNotification: (state, action: PayloadAction<{
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
    }>) => {
      const { message, type } = action.payload;
      state.notifications.push({
        id: Date.now().toString(),
        message,
        type,
        timestamp: Date.now(),
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setCurrentTab,
  addNotification,
  removeNotification,
  clearAllNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;