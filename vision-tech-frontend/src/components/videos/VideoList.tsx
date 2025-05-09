import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Divider, Chip } from '@mui/material';
import { VideoWithDetails } from '../../types/video.types';
import { Videocam, Warning, CheckCircle, HourglassEmpty } from '@mui/icons-material';
import { formatDuration, formatDate } from '../../utils/date.utils';

interface VideoListProps {
  videos?: VideoWithDetails[];
  isLoading?: boolean;
  onSelectVideo?: (videoId: number) => void;
  selectedVideoId?: number | null;
  projectId?: number;
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const VideoList: React.FC<VideoListProps> = ({
  videos = [],
  isLoading = false,
  onSelectVideo = () => {},
  selectedVideoId = null,
  projectId,
  limit,
  showViewAll = false,
  onViewAll,
}) => {
  if (isLoading && videos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <HourglassEmpty sx={{ fontSize: 40, color: 'action.active', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Loading videos...
        </Typography>
      </Box>
    );
  }

  if (videos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Videocam sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
        <Typography variant="body1">No videos uploaded yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Use the upload button to add videos
        </Typography>
      </Box>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle fontSize="small" color="success" />;
      case 'processing':
        return <HourglassEmpty fontSize="small" color="warning" />;
      case 'error':
        return <Warning fontSize="small" color="error" />;
      default:
        return <HourglassEmpty fontSize="small" color="disabled" />;
    }
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {videos.map((video) => (
        <React.Fragment key={video.id}>
          <ListItem disablePadding>
            <ListItemButton 
              selected={selectedVideoId === video.id}
              onClick={() => onSelectVideo(video.id)}
              sx={{ borderRadius: 1 }}
            >
              <ListItemAvatar>
                <Avatar variant="rounded">
                  <Videocam />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {video.original_filename}
                    {getStatusIcon(video.processing_status)}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" component="span">
                      {video.duration 
                        ? formatDuration(video.duration) 
                        : 'Duration unknown'}
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                      Uploaded: {formatDate(video.uploaded_at)}
                    </Typography>
                    {video.detection_jobs_count > 0 && (
                      <Chip 
                        label={`${video.detection_jobs_count} analysis jobs`} 
                        size="small" 
                        variant="outlined" 
                        sx={{ mt: 0.5, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};

export default VideoList;