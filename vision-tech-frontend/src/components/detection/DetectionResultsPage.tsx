// src/pages/detection/DetectionResultsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Paper,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Divider,
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import VideoPlayer from '../../components/videos/VideoPlayer';
import DetectionTimeline from '../../components/detection/DetectionTimeline';
import DetectionFilters from '../../components/detection/DetectionFilters';
import ObjectThumbnails from '../../components/detection/ObjectThumbnails';
import { getVideoUrl } from '../../utils/video.utils';
import { Download as DownloadIcon } from '@mui/icons-material';

const DetectionResultsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentJob, timeline, objects, isLoading } = useSelector((state: RootState) => state.detection);
  const { video } = useSelector((state: RootState) => state.videos);
  
  const [activeTab, setActiveTab] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  
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
  
  const handleExport = (format: 'json' | 'csv' | 'video') => {
    if (jobId) {
      window.open(`/api/v1/detection/jobs/${jobId}/download?format=${format}`, '_blank');
    }
  };
  
  if (isLoading && !currentJob) {
    return <Typography>Loading detection results...</Typography>;
  }
  
  if (!currentJob || !video) {
    return <Typography>Detection job or video not found</Typography>;
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
        <Link 
          component={RouterLink} 
          to={`/projects/${video.project_id}`} 
          underline="hover" 
          color="inherit"
        >
          {video.project?.name || 'Project'}
        </Link>
        <Typography color="text.primary">Detection Results</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Detection Results
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Video: {video.original_filename}
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('json')}
            sx={{ mr: 1 }}
          >
            JSON
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('csv')}
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
            title={video.original_filename}
            timeline={timeline?.events.map(e => ({ time: e.start_time, type: e.class_name })) || []}
            onTimeUpdate={handleTimeUpdate}
          />
          
          {timeline && (
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