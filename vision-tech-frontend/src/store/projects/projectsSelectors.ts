// Selectors for projects state
import { RootState } from '../index';

export const selectAllProjects = (state: RootState) => state.projects.projects;
export const selectProjectById = (id: number) => (state: RootState) => 
  state.projects.projects.find(project => project.id === id);
export const selectProjectsLoading = (state: RootState) => state.projects.isLoading;
export const selectProjectsError = (state: RootState) => state.projects.error;