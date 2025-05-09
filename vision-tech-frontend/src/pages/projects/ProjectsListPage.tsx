import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ProjectList from '../../components/projects/ProjectList';
import { useProjects } from '../../hooks/useProjects';

const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, getProjects, isLoading, error } = useProjects();

  useEffect(() => {
    getProjects();
  }, [getProjects]);

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Projects
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
          >
            New Project
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your video analysis projects. Create a new project for each case or group of related videos.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isLoading && projects.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ProjectList />
        )}
      </Box>
    </Container>
  );
};

export default ProjectsListPage;