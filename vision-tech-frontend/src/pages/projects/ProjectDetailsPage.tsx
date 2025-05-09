import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Breadcrumbs,
  Link,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProjectDetails from '../../components/projects/ProjectDetails';
import ProjectCreation from '../../components/projects/ProjectCreation';
import { useProjects } from '../../hooks/useProjects';
import { ProjectUpdate } from '../../types/project.types';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = parseInt(id || '0');
  
  const { 
    getProject, 
    currentProject, 
    editProject, 
    removeProject, 
    isLoading, 
    error 
  } = useProjects();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      getProject(projectId);
    }
  }, [getProject, projectId]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (projectData: ProjectUpdate) => {
    try {
      if (projectId) {
        await editProject(projectId, projectData);
        setIsEditDialogOpen(false);
        // Refresh the project data
        getProject(projectId);
      }
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  const handleDelete = async () => {
    try {
      if (projectId) {
        await removeProject(projectId);
        navigate('/projects');
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  if (isLoading && !currentProject) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!currentProject) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 4 }}>
          Project not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/projects" underline="hover" color="inherit">
            Projects
          </Link>
          <Typography color="text.primary">{currentProject.name}</Typography>
        </Breadcrumbs>

        <ProjectDetails
          project={currentProject}
          onEditProject={handleEdit}
          onDeleteProject={handleDelete}
        />
      </Box>

      {/* Edit Project Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <ProjectCreation
            isEdit
            initialData={currentProject}
            onSubmit={handleEditSubmit}
            isLoading={isLoading}
            error={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetailsPage;