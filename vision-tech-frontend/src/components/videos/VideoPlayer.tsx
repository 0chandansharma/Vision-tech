import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  LinearProgress,
  Paper,
  Slider,
  Typography,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Replay,
  VolumeUp,
  VolumeOff,
} from '@mui/icons-material';
import { formatTimeDisplay } from '../../utils/video.utils';

interface VideoPlayerProps {
  src: string;
  title?: string;
  timeline?: Array<{
    time: number;
    type: string;
  }>;
  onTimeUpdate?: (currentTime: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  timeline = [],
  onTimeUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleLoadStart = () => {
      setLoading(true);
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    const handleEnded = () => {
      setPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleSeek = (_: Event, newValue: number | number[]) => {
    if (videoRef.current && typeof newValue === 'number') {
      videoRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    if (videoRef.current && typeof newValue === 'number') {
      videoRef.current.volume = newValue;
      setVolume(newValue);
      setMuted(newValue === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      );
    }
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setPlaying(true);
    }
  };

  // Convert timeline to marks for the slider
  const timelineMarks = timeline.map((mark) => ({
    value: mark.time,
    type: mark.type,
  }));

  return (
    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', backgroundColor: '#000' }}>
        <video
          ref={videoRef}
          src={src}
          style={{ width: '100%', display: 'block' }}
        />

        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              p: 2,
            }}
          >
            <LinearProgress />
          </Box>
        )}
      </Box>

      {title && (
        <Typography variant="subtitle1" sx={{ px: 2, pt: 1 }}>
          {title}
        </Typography>
      )}

      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 1 }}>
          <Slider
            value={currentTime}
            min={0}
            max={duration || 100}
            onChange={handleSeek}
            aria-label="video progress"
            sx={{
              '& .MuiSlider-markLabel': {
                display: 'none',
              },
              '& .MuiSlider-mark': {
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
              },
            }}
            marks={timelineMarks}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={skipBackward} size="small">
              <SkipPrevious />
            </IconButton>
            <IconButton onClick={togglePlay} size="medium">
              {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={skipForward} size="small">
              <SkipNext />
            </IconButton>
            <IconButton onClick={restart} size="small">
              <Replay />
            </IconButton>
            <Typography variant="caption" sx={{ ml: 1, minWidth: 80 }}>
              {formatTimeDisplay(currentTime)} / {formatTimeDisplay(duration)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', width: 150 }}>
            <IconButton onClick={toggleMute} size="small">
              {muted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
              value={muted ? 0 : volume}
              min={0}
              max={1}
              step={0.1}
              onChange={handleVolumeChange}
              aria-label="volume"
              size="small"
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default VideoPlayer;