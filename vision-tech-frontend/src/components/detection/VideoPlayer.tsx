import React, { useRef, useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Slider, IconButton, Stack } from '@mui/material';
import { 
  PlayArrow, 
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  SkipNext,
  SkipPrevious
} from '@mui/icons-material';
import { formatTimeDisplay } from '../../utils/video.utils';

interface TimelineEvent {
  time: number;
  type: string;
}

interface VideoPlayerProps {
  src: string;
  title?: string;
  timeline?: TimelineEvent[];
  onTimeUpdate?: (time: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  timeline = [],
  onTimeUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(videoElement.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = typeof newValue === 'number' ? newValue : newValue[0];
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = typeof newValue === 'number' ? newValue : newValue[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleSkipForward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(video.currentTime + 10, duration);
  };

  const handleSkipBackward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(video.currentTime - 10, 0);
  };

  // Find next detection event from the current time
  const handleNextEvent = () => {
    if (!timeline || timeline.length === 0) return;
    
    const nextEvent = timeline.find(event => event.time > currentTime);
    if (nextEvent && videoRef.current) {
      videoRef.current.currentTime = nextEvent.time;
    }
  };

  // Find previous detection event from the current time
  const handlePrevEvent = () => {
    if (!timeline || timeline.length === 0) return;
    
    const reversedEvents = [...timeline].reverse();
    const prevEvent = reversedEvents.find(event => event.time < currentTime);
    if (prevEvent && videoRef.current) {
      videoRef.current.currentTime = prevEvent.time;
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <Box sx={{ position: 'relative' }}>
        <video
          ref={videoRef}
          src={src}
          style={{ width: '100%', maxHeight: '70vh', backgroundColor: '#000' }}
        />
      </Box>
      
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ minWidth: 65 }}>
            {formatTimeDisplay(currentTime)}
          </Typography>
          
          <Slider
            value={currentTime}
            onChange={handleSeek}
            min={0}
            max={duration}
            step={0.1}
            aria-label="Time"
            sx={{ mx: 2 }}
          />
          
          <Typography variant="body2" sx={{ minWidth: 65, textAlign: 'right' }}>
            {formatTimeDisplay(duration)}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
          <Box>
            <IconButton onClick={handlePlayPause} size="medium">
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            
            <IconButton onClick={handlePrevEvent} disabled={!timeline || timeline.length === 0} size="medium">
              <SkipPrevious />
            </IconButton>
            
            <IconButton onClick={handleNextEvent} disabled={!timeline || timeline.length === 0} size="medium">
              <SkipNext />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', width: '30%' }}>
            <IconButton onClick={handleMuteToggle} size="medium">
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            
            <Slider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.1}
              aria-label="Volume"
              sx={{ mx: 2 }}
            />
            
            <IconButton onClick={handleFullscreen} size="medium">
              <Fullscreen />
            </IconButton>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;