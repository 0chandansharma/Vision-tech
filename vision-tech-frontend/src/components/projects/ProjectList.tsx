import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProjects } from '../../store/projects/projectsSlice';
import { Grid, Card, CardContent, CardActions, Typography, Button, Box, Chip } from '@mui/material';
import { Add as AddIcon, Folder as FolderIcon } from '@mui/icons-material';
import { formatDate } from '../../utils/date.utils';

const ProjectList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, isLoading } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  if (isLoading && projects.length === 0) {
    return <Typography>Loading projects...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/projects/new"
        >
          New Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Typography>No projects found. Create your first project.</Typography>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h3">
                      {project.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Case Number: {project.case_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created: {formatDate(project.created_at)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created by: {project.creator.first_name} {project.creator.last_name}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={`${project.video_count} Videos`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to={`/projects/${project.id}`}
                  >
                    View Project
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProjectList;