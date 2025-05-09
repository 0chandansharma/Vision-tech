import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchDetectionJob,
  fetchDetectionTimeline,
  fetchDetectedObjects
} from '../../store/detection/detectionSlice';
import { fetchVideoById } from '../../store/videos/videosSlice';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import VideoPlayer from '../videos/VideoPlayer';
import DetectionTimeline from './DetectionTimeline';
import DetectionFilters from './DetectionFilters';
import ObjectThumbnails from './ObjectThumbnails';
import { getVideoUrl } from '../../utils/video.utils';
import { Download as DownloadIcon } from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';

const DetectionResultsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentJob, timeline, objects, isLoading, error } = useSelector((state: RootState) => state.detection);
  const { video } = useSelector((state: RootState) => state.videos);

  const [activeTab, setActiveTab] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (jobId) {
      dispatch(fetchDetectionJob(parseInt(jobId)));
      dispatch(fetchDetectionTimeline(parseInt(jobId)));
      dispatch(fetchDetectedObjects({ jobId: parseInt(jobId) }));
    }
  }, [dispatch, jobId]);

  useEffect(() => {
    if (currentJob?.video_id) {
      dispatch(fetchVideoById(currentJob.video_id));
    }
  }, [dispatch, currentJob]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleTimelineSelect = (time: number) => {
    setCurrentTime(time);
    // Set video time through ref
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.currentTime = time;
    }
  };

  const handleClassToggle = (className: string) => {
    if (className === 'all') {
      setSelectedClasses([]);
      // Refetch all objects
      if (jobId) {
        dispatch(fetchDetectedObjects({ jobId: parseInt(jobId) }));
      }
      return;
    }

    setSelectedClasses(prev => {
      const newSelected = prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className];

      // Fetch objects with selected class filter
      if (jobId) {
        dispatch(fetchDetectedObjects({
          jobId: parseInt(jobId),
          options: {
            className: newSelected.length > 0 ? newSelected[0] : undefined
          }
        }));
      }

      return newSelected;
    });
  };

  const handleExport = async (format: 'json' | 'csv' | 'video') => {
    if (!jobId) return;

    setIsExporting(true);
    try {
      const response = await axiosInstance.get(
        `/detection/jobs/${jobId}/download`,
        {
          params: { format },
          responseType: 'blob'
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `detection_${jobId}_results.${format}`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Loading state
  if (isLoading && !currentJob) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading detection results...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ mt: 2 }}
        action={
          <Button color="inherit" size="small" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        }
      >
        Failed to load detection results: {error}
      </Alert>
    );
  }

  // Not found state
  if (!currentJob || !video) {
    return (
      <Alert
        severity="warning"
        sx={{ mt: 2 }}
        action={
          <Button color="inherit" size="small" onClick={() => navigate('/projects')}>
            View Projects
          </Button>
        }
      >
        Detection job or video not found
      </Alert>
    );
  }

  // Extract unique class names from objects
  const availableClasses = Array.from(
    new Set(objects.map(obj => obj.class_name))
  );

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/projects" underline="hover" color="inherit">
          Projects
        </Link>
        {video.project_id && (
          <Link
            component={RouterLink}
            to={`/projects/${video.project_id}`}
            underline="hover"
            color="inherit"
          >
            {video.project?.name || 'Project'}
          </Link>
        )}
        <Typography color="text.primary">Detection Results</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Detection Results
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Video: {video.original_filename || 'Unnamed video'}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Model: {currentJob.model_name || 'Unknown model'}
          </Typography>
        </Box>

        <Box>
          <Button
            variant="outlined"
            startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={() => handleExport('json')}
            sx={{ mr: 1 }}
            disabled={isExporting}
          >
            JSON
          </Button>
          <Button
            variant="outlined"
            startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            CSV
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Results Viewer" />
        <Tab label="Objects" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <VideoPlayer
            src={getVideoUrl(video.id)}
            title={video.original_filename || 'Video'}
            timeline={timeline?.events?.map(e => ({ time: e.start_time, type: e.class_name })) || []}
            onTimeUpdate={handleTimeUpdate}
          />

          {timeline && timeline.events && (
            <DetectionTimeline
              events={timeline.events}
              videoDuration={video.duration || 0}
              currentTime={currentTime}
              onSelectTime={handleTimelineSelect}
            />
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <DetectionFilters
            availableClasses={availableClasses}
            selectedClasses={selectedClasses}
            onClassToggle={handleClassToggle}
          />

          <ObjectThumbnails
            objects={objects}
            selectedClasses={selectedClasses}
          />
        </Box>
      )}
    </Box>
  );
};

export default DetectionResultsPage;