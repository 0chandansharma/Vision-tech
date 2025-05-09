// src/pages/admin/SystemMonitoringPage.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Videocam as VideoIcon,
  BarChart as StatsIcon,
  Pending as PendingIcon,
  CheckCircle as CompletedIcon,
  Error as ErrorIcon,
  PlayArrow as RunningIcon
} from '@mui/icons-material';
import { fetchDetectionJobsForVideo } from '../../store/detection/detectionSlice';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate } from '../../utils/date.utils';

// Simulated system stats
const getSystemStats = () => {
  return {
    cpuUsage: Math.floor(Math.random() * 40) + 10, // 10% to 50%
    memoryUsage: Math.floor(Math.random() * 30) + 20, // 20% to 50%
    diskUsage: Math.floor(Math.random() * 20) + 30, // 30% to 50%
    activeJobs: Math.floor(Math.random() * 3), // 0 to 2
    queuedJobs: Math.floor(Math.random() * 5), // 0 to 4
    completedJobs: Math.floor(Math.random() * 100) + 50, // 50 to 149
    failedJobs: Math.floor(Math.random() * 10), // 0 to 9
    uptime: Math.floor(Math.random() * 800) + 200, // 200 to 999 hours
  };
};

const SystemMonitoringPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, isLoading } = useSelector((state: RootState) => state.detection);
  
  const [systemStats, setSystemStats] = useState(getSystemStats());
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Fetch all recent jobs
    dispatch(fetchDetectionJobsForVideo(0)); // 0 will be handled by the backend to return recent jobs
  }, [dispatch]);
  
  const handleRefresh = () => {
    setLoading(true);
    setSystemStats(getSystemStats());
    
    // Fetch updated jobs
    dispatch(fetchDetectionJobsForVideo(0)).then(() => {
      setLoading(false);
    });
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'in_progress':
      case 'processing':
        return <RunningIcon color="info" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'failed':
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          System Monitoring
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="outlined" 
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* System Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              System Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      CPU Usage
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={systemStats.cpuUsage} 
                        size={40} 
                        sx={{ mr: 2 }} 
                      />
                      <Typography variant="h6">
                        {systemStats.cpuUsage}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Memory Usage
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={systemStats.memoryUsage} 
                        size={40} 
                        sx={{ mr: 2 }} 
                      />
                      <Typography variant="h6">
                        {systemStats.memoryUsage}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Disk Usage
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={systemStats.diskUsage} 
                        size={40} 
                        sx={{ mr: 2 }} 
                      />
                      <Typography variant="h6">
                        {systemStats.diskUsage}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      System Uptime
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MemoryIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6">
                        {systemStats.uptime} hours
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Detection Jobs Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Detection Job Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Active Jobs
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <RunningIcon sx={{ mr: 2, color: 'info.main' }} />
                      <Typography variant="h6">
                        {systemStats.activeJobs}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Queued Jobs
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PendingIcon sx={{ mr: 2, color: 'warning.main' }} />
                      <Typography variant="h6">
                        {systemStats.queuedJobs}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Completed Jobs
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CompletedIcon sx={{ mr: 2, color: 'success.main' }} />
                      <Typography variant="h6">
                        {systemStats.completedJobs}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Failed Jobs
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ErrorIcon sx={{ mr: 2, color: 'error.main' }} />
                      <Typography variant="h6">
                        {systemStats.failedJobs}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Recent Detection Jobs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Detection Jobs
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : jobs.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No recent detection jobs found
              </Typography>
            ) : (
              <List>
                {jobs.slice(0, 10).map((job, index) => (
                  <React.Fragment key={job.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      button
                      component={RouterLink}
                      to={`/detection/jobs/${job.id}`}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getStatusIcon(job.status)}
                              <Typography sx={{ ml: 1 }}>
                                Job #{job.id} - {job.model_name}
                              </Typography>
                            </Box>
                            <Chip 
                              label={job.status.toUpperCase()} 
                              size="small"
                              color={
                                job.status === 'completed' ? 'success' :
                                job.status === 'in_progress' || job.status === 'processing' ? 'info' :
                                job.status === 'pending' ? 'warning' : 'error'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="body2">
                              Video ID: {job.video_id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(job.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemMonitoringPage;