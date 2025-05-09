import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../store/projects/projectsSlice';
import { Project, ProjectCreate, ProjectUpdate } from '../types/project.types';

interface UseProjectsReturn {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  getProjects: () => Promise<void>;
  getProject: (id: number) => Promise<void>;
  addProject: (project: ProjectCreate) => Promise<Project>;
  editProject: (id: number, project: ProjectUpdate) => Promise<Project>;
  removeProject: (id: number) => Promise<void>;
}

export const useProjects = (): UseProjectsReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, project: currentProject, isLoading, error } = useSelector(
    (state: RootState) => state.projects
  );

  const getProjects = async (): Promise<void> => {
    await dispatch(fetchProjects());
  };

  const getProject = async (id: number): Promise<void> => {
    await dispatch(fetchProjectById(id));
  };

  const addProject = async (project: ProjectCreate): Promise<Project> => {
    const result = await dispatch(createProject(project));
    if (createProject.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    return result.payload as Project;
  };

  const editProject = async (id: number, project: ProjectUpdate): Promise<Project> => {
    const result = await dispatch(updateProject({ id, data: project }));
    if (updateProject.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    return result.payload as Project;
  };

  const removeProject = async (id: number): Promise<void> => {
    const result = await dispatch(deleteProject(id));
    if (deleteProject.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  };

  return {
    projects,
    currentProject,
    isLoading,
    error,
    getProjects,
    getProject,
    addProject,
    editProject,
    removeProject,
  };
};

export default useProjects;