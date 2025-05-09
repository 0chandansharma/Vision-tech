import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProjectCreation from '../../components/projects/ProjectCreation';
import { useProjects } from '../../hooks/useProjects';
import { ProjectCreate, ProjectUpdate } from '../../types/project.types';

const ProjectCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { addProject, isLoading, error } = useProjects();

  const handleCreateProject = async (projectData: ProjectCreate | ProjectUpdate) => {
    try {
      // We know this can only be ProjectCreate on the creation page
      const newProject = await addProject(projectData as ProjectCreate);
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/projects" underline="hover" color="inherit">
            Projects
          </Link>
          <Typography color="text.primary">New Project</Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create a new project to organize and analyze your videos. 
          Projects help you group related videos and their analysis results.
        </Typography>

        <Paper elevation={2} sx={{ p: 4, mt: 3 }}>
          <ProjectCreation
            onSubmit={handleCreateProject}
            isLoading={isLoading}
            error={error}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default ProjectCreationPage;