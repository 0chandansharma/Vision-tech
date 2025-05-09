import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Search as AnalyzeIcon,
} from '@mui/icons-material';
import { getVideoThumbnailUrl } from '../../utils/video.utils';
import { formatDate } from '../../utils/date.utils';

interface VideoThumbnailProps {
  video: {
    id: number;
    filename: string;
    original_filename: string;
    duration?: number;
    resolution?: string;
    format?: string;
    created_at: string;
    analyzed?: boolean;
  };
  onPlay?: (videoId: number) => void;
  onAnalyze?: (videoId: number) => void;
  onDelete?: (videoId: number) => void;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  video,
  onPlay,
  onAnalyze,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePlay = () => {
    if (onPlay) {
      onPlay(video.id);
    } else {
      navigate(`/videos/${video.id}`);
    }
  };

  const handleAnalyze = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    if (onAnalyze) {
      onAnalyze(video.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    if (onDelete) {
      onDelete(video.id);
    }
  };

  // Format duration from seconds to mm:ss or hh:mm:ss
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handlePlay}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="140"
            image={getVideoThumbnailUrl(video.id)}
            alt={video.original_filename}
            sx={{ objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px 0 0 0',
              fontSize: '0.75rem',
            }}
          >
            {formatDuration(video.duration)}
          </Box>
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
            size="small"
            onClick={handleMenuOpen}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <CardContent>
          <Typography variant="subtitle1" component="div" noWrap>
            {video.original_filename}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Added: {formatDate(video.created_at)}
          </Typography>
          
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            {video.resolution && (
              <Chip 
                label={video.resolution} 
                size="small" 
                variant="outlined" 
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            )}
            {video.format && (
              <Chip 
                label={video.format.toUpperCase()} 
                size="small" 
                variant="outlined" 
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            )}
            {video.analyzed && (
              <Chip 
                label="Analyzed" 
                size="small" 
                color="primary"
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handlePlay}>
          <PlayIcon fontSize="small" sx={{ mr: 1 }} />
          Play Video
        </MenuItem>
        <MenuItem onClick={handleAnalyze}>
          <AnalyzeIcon fontSize="small" sx={{ mr: 1 }} />
          Analyze
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default VideoThumbnail;