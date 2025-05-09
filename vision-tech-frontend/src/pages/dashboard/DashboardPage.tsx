// src/pages/dashboard/DashboardPage.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProjects } from '../../store/projects/projectsSlice';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
} from '@mui/material';
import { 
  VideoLibrary as VideoIcon,
  FindInPage as DetectionIcon,
  Add as AddIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, isLoading } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.first_name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is your central dashboard for video analysis and computer vision operations.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Recent Projects</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/projects/new"
        >
          New Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12}>
            <Typography>Loading projects...</Typography>
          </Grid>
        ) : projects.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ textAlign: 'center', p: 4 }}>
              <CardContent>
                <FolderIcon sx={{ fontSize: 60, color: 'action.active', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Projects Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create your first project to start analyzing videos
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to="/projects/new"
                >
                  Create Project
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          projects.slice(0, 6).map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea 
                  component={RouterLink} 
                  to={`/projects/${project.id}`}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Case: {project.case_number}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <VideoIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {project.video_count} Videos
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {projects.length > 6 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            component={RouterLink} 
            to="/projects"
            variant="outlined"
          >
            View All Projects
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 6, mb: 3 }}>
        <Typography variant="h5">Quick Actions</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea 
              component={RouterLink} 
              to="/projects/new"
              sx={{ height: '100%', p: 2 }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <FolderIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="div" gutterBottom>
                  Create New Project
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a new investigation with a dedicated project space
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea 
              component={RouterLink} 
              to="/projects"
              sx={{ height: '100%', p: 2 }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <VideoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="div" gutterBottom>
                  Manage Videos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload and organize your video evidence
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea 
              sx={{ height: '100%', p: 2 }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <DetectionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="div" gutterBottom>
                  Run Detection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analyze videos with object and motion detection
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;