// src/components/detection/DetectionJobStatus.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDetectionJob } from '../../store/detection/detectionSlice';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  SkipNext as NextIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { formatDate } from '../../utils/date.utils';

interface DetectionJobStatusProps {
  jobId: number;
  onViewResults?: () => void;
}

const DetectionJobStatus: React.FC<DetectionJobStatusProps> = ({
  jobId,
  onViewResults,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentJob, isLoading } = useSelector((state: RootState) => state.detection);
  
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Initial fetch
    dispatch(fetchDetectionJob(jobId));
    
    // Start polling if job is pending or processing
    if (currentJob?.status === 'pending' || currentJob?.status === 'processing') {
      const interval = setInterval(() => {
        dispatch(fetchDetectionJob(jobId));
      }, 5000); // Poll every 5 seconds
      
      setPollingInterval(interval);
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [dispatch, jobId]);
  
  // Update polling when job status changes
  useEffect(() => {
    if (currentJob) {
      if (currentJob.status === 'pending' || currentJob.status === 'processing') {
        if (!pollingInterval) {
          const interval = setInterval(() => {
            dispatch(fetchDetectionJob(jobId));
          }, 5000);
          
          setPollingInterval(interval);
        }
      } else {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    }
  }, [currentJob, pollingInterval, dispatch, jobId]);
  
  const handleRefresh = () => {
    dispatch(fetchDetectionJob(jobId));
  };
  
  if (isLoading && !currentJob) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Loading Job Status...
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }
  
  if (!currentJob) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Job Not Found
        </Typography>
        <Alert severity="error">
          The detection job could not be found.
        </Alert>
      </Paper>
    );
  }
  
  // Determine job progress
  const getJobProgress = () => {
    if (currentJob.status === 'completed') return 100;
    if (currentJob.status === 'pending') return 0;
    if (currentJob.status === 'error') return 100;
    
    // For processing, calculate progress based on time (just an estimate)
    if (currentJob.started_at) {
      const startTime = new Date(currentJob.started_at).getTime();
      const currentTime = new Date().getTime();
      const elapsedMinutes = (currentTime - startTime) / (1000 * 60);
      
      // Assume a job takes about 10 minutes to complete (adjust based on your actual workload)
      const estimatedProgress = Math.min(90, (elapsedMinutes / 10) * 100);
      return estimatedProgress;
    }
    
    return 0;
  };
  
  // Get status color and icon
  const getStatusInfo = () => {
    switch (currentJob.status) {
      case 'completed':
        return { color: 'success', icon: <SuccessIcon /> };
      case 'processing':
        return { color: 'info', icon: <PlayIcon /> };
      case 'pending':
        return { color: 'warning', icon: <PendingIcon /> };
      case 'error':
        return { color: 'error', icon: <ErrorIcon /> };
      default:
        return { color: 'default', icon: <PendingIcon /> };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Detection Job Status
        </Typography>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Chip
          label={currentJob.status.toUpperCase()}
          color={statusInfo.color as any}
          icon={statusInfo.icon}
          sx={{ mr: 1 }}
        />
        <Chip
          label={`Model: ${currentJob.model_name}`}
          variant="outlined"
        />
      </Box>
      
      {currentJob.status === 'processing' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Processing video...
          </Typography>
          <LinearProgress variant="determinate" value={getJobProgress()} sx={{ height: 8, borderRadius: 1 }} />
        </Box>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Created: {formatDate(currentJob.created_at)}
        </Typography>
        {currentJob.started_at && (
          <Typography variant="body2" color="text.secondary">
            Started: {formatDate(currentJob.started_at)}
          </Typography>
        )}
        {currentJob.completed_at && (
          <Typography variant="body2" color="text.secondary">
            Completed: {formatDate(currentJob.completed_at)}
          </Typography>
        )}
      </Box>
      
      {currentJob.error_message && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {currentJob.error_message}
        </Alert>
      )}
      
      {currentJob.status === 'completed' && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<NextIcon />}
          onClick={onViewResults}
          fullWidth
        >
          View Results
        </Button>
      )}
    </Paper>
  );
};

export default DetectionJobStatus;