import React from 'react';
import { Box, Paper, Typography, Chip, Grid } from '@mui/material';
import { formatTimeDisplay } from '../../utils/video.utils';

interface TimelineEvent {
  type: string;
  class_name: string;
  track_id: number;
  start_time: number;
  end_time: number;
  confidence: number;
}

interface DetectionTimelineProps {
  events: TimelineEvent[];
  videoDuration: number;
  currentTime: number;
  onSelectTime: (time: number) => void;
}

const DetectionTimeline: React.FC<DetectionTimelineProps> = ({
  events,
  videoDuration,
  currentTime,
  onSelectTime,
}) => {
  // Group events by class_name
  const eventsByClass: Record<string, TimelineEvent[]> = {};
  
  events.forEach((event) => {
    if (!eventsByClass[event.class_name]) {
      eventsByClass[event.class_name] = [];
    }
    eventsByClass[event.class_name].push(event);
  });

  // Get unique class names
  const classNames = Object.keys(eventsByClass);

  // Function to calculate position percentage based on time
  const getPositionPercent = (time: number) => {
    return (time / videoDuration) * 100;
  };

  // Function to get color based on class name
  const getClassColor = (className: string) => {
    const colorMap: Record<string, string> = {
      person: '#e53935',
      car: '#1e88e5',
      bicycle: '#43a047',
      motorcycle: '#fb8c00',
      truck: '#8e24aa',
      bus: '#3949ab',
      default: '#757575',
    };
    
    return colorMap[className.toLowerCase()] || colorMap.default;
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Detection Timeline
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        {classNames.map((className) => (
          <Chip
            key={className}
            label={className}
            size="small"
            sx={{
              mr: 1,
              mb: 1,
              backgroundColor: getClassColor(className),
              color: 'white',
            }}
          />
        ))}
      </Box>
      
      <Box sx={{ position: 'relative', height: 100, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        {/* Current time indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${getPositionPercent(currentTime)}%`,
            width: 2,
            backgroundColor: 'error.main',
            zIndex: 10,
          }}
        />
        
        {/* Time labels */}
        <Box sx={{ position: 'absolute', bottom: -20, left: 0, right: 0, height: 20 }}>
          <Typography variant="caption" sx={{ position: 'absolute', left: 0 }}>
            0:00
          </Typography>
          <Typography variant="caption" sx={{ position: 'absolute', left: '25%', transform: 'translateX(-50%)' }}>
            {formatTimeDisplay(videoDuration * 0.25)}
          </Typography>
          <Typography variant="caption" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {formatTimeDisplay(videoDuration * 0.5)}
          </Typography>
          <Typography variant="caption" sx={{ position: 'absolute', left: '75%', transform: 'translateX(-50%)' }}>
            {formatTimeDisplay(videoDuration * 0.75)}
          </Typography>
          <Typography variant="caption" sx={{ position: 'absolute', right: 0 }}>
            {formatTimeDisplay(videoDuration)}
          </Typography>
        </Box>
        
        {/* Event segments by class */}
        {classNames.map((className, index) => {
          const rowHeight = 16;
          const rowSpacing = 4;
          const yPosition = index * (rowHeight + rowSpacing);
          
          return (
            <React.Fragment key={className}>
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: -5,
                  top: yPosition,
                  transform: 'translateX(-100%)',
                  whiteSpace: 'nowrap',
                }}
              >
                {className}
              </Typography>
              
              {eventsByClass[className].map((event, eventIndex) => (
                <Box
                  key={`${className}-${eventIndex}`}
                  sx={{
                    position: 'absolute',
                    left: `${getPositionPercent(event.start_time)}%`,
                    width: `${getPositionPercent(event.end_time - event.start_time)}%`,
                    height: rowHeight,
                    top: yPosition,
                    backgroundColor: getClassColor(className),
                    borderRadius: 1,
                    opacity: 0.8,
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                  onClick={() => onSelectTime(event.start_time)}
                  title={`${className} (${formatTimeDisplay(event.start_time)} - ${formatTimeDisplay(event.end_time)})`}
                />
              ))}
            </React.Fragment>
          );
        })}
      </Box>
      
      <Typography variant="body2">
        Click on any detection to navigate to that point in the video
      </Typography>
    </Paper>
  );
};

export default DetectionTimeline;