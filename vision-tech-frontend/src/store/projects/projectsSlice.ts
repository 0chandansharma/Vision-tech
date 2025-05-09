import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import projectsApi from '../../api/projectsApi';
import { Project, ProjectCreate } from '../../types/project.types';

interface ProjectsState {
  projects: Project[];
  project: Project | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  project: null,
  isLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      return await projectsApi.getProjects();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch projects');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await projectsApi.getProjectById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (project: ProjectCreate, { rejectWithValue }) => {
    try {
      return await projectsApi.createProject(project);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: number; data: Partial<Project> }, { rejectWithValue }) => {
    try {
      return await projectsApi.updateProject(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: number, { rejectWithValue }) => {
    try {
      await projectsApi.deleteProject(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete project');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    resetProject: (state) => {
      state.project = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.project = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.projects.unshift(action.payload);
        state.project = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.projects = state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project
        );
        state.project = action.payload;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.projects = state.projects.filter((project) => project.id !== action.payload);
        if (state.project && state.project.id === action.payload) {
          state.project = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProjectError, resetProject } = projectsSlice.actions;
export default projectsSlice.reducer;