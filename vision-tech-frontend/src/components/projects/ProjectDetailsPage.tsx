import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProjectById } from '../../store/projects/projectsSlice';
import { fetchVideosByProject } from '../../store/videos/videosSlice';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import VideoList from '../../components/videos/VideoList';
import VideoUpload from '../../components/videos/VideoUpload';
import VideoPlayer from '../../components/videos/VideoPlayer';
import DetectionFilters from '../../components/detection/DetectionFilters';
import DetectionTimeline from '../../components/detection/DetectionTimeline';
import ObjectThumbnails from '../../components/detection/ObjectThumbnails';

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { project, isLoading: isProjectLoading } = useSelector(
    (state: RootState) => state.projects
  );
  const { videos, isLoading: isVideosLoading } = useSelector(
    (state: RootState) => state.videos
  );
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(parseInt(projectId)));
      dispatch(fetchVideosByProject(parseInt(projectId)));
    }
  }, [dispatch, projectId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleVideoSelect = (videoId: number) => {
    setSelectedVideo(videoId);
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
      return;
    }
    
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  // Mock data for demo
  const mockTimelineEvents = [
    { type: 'object_appeared', class_name: 'person', track_id: 1, start_time: 5, end_time: 15, confidence: 0.95 },
    { type: 'object_appeared', class_name: 'car', track_id: 2, start_time: 10, end_time: 30, confidence: 0.87 },
    { type: 'object_appeared', class_name: 'person', track_id: 3, start_time: 25, end_time: 40, confidence: 0.91 },
  ];

  const availableClasses = ['Person', 'Vehicle', 'Others'];

  if (isProjectLoading && !project) {
    return <Typography>Loading project...</Typography>;
  }

  if (!project) {
    return <Typography>Project not found</Typography>;
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/projects" underline="hover" color="inherit">
          Projects
        </Link>
        <Typography color="text.primary">{project.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {project.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Case Number: {project.case_number}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Uploaded Data" />
        <Tab label="Classes" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ width: '30%' }}>
              <VideoUpload
                projectId={parseInt(projectId!)}
                onSuccess={() => dispatch(fetchVideosByProject(parseInt(projectId!)))}
              />
              
              <Box sx={{ mt: 3 }}>
                <VideoList
                  videos={videos}
                  isLoading={isVideosLoading}
                  onSelectVideo={handleVideoSelect}
                  selectedVideoId={selectedVideo}
                />
              </Box>
            </Box>
            
            <Box sx={{ width: '70%' }}>
              {selectedVideo ? (
                <>
                  <VideoPlayer
                    src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
                    title="Selected Video"
                    timeline={mockTimelineEvents.map(e => ({ time: e.start_time, type: e.class_name }))}
                    onTimeUpdate={handleTimeUpdate}
                  />
                  
                  <DetectionTimeline
                    events={mockTimelineEvents}
                    videoDuration={60}
                    currentTime={currentTime}
                    onSelectTime={handleTimelineSelect}
                  />
                </>
              ) : (
                <Box
                  sx={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    Select a video to view
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
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
            objects={[
              { id: '1', class_name: 'Person', thumbnail_url: '', confidence: 0.95 },
              { id: '2', class_name: 'Vehicle', thumbnail_url: '', confidence: 0.87 },
              { id: '3', class_name: 'Person', thumbnail_url: '', confidence: 0.92 },
            ]}
            selectedClasses={selectedClasses}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProjectDetailsPage;