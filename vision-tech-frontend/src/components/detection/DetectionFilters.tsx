import React from 'react';
import { Box, Chip, Typography, Paper } from '@mui/material';

interface DetectionFiltersProps {
  availableClasses: string[];
  selectedClasses: string[];
  onClassToggle: (className: string) => void;
}

const DetectionFilters: React.FC<DetectionFiltersProps> = ({
  availableClasses,
  selectedClasses,
  onClassToggle,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Identified Objects:
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label="All"
          color={selectedClasses.length === 0 ? "primary" : "default"}
          onClick={() => onClassToggle('all')}
        />
        
        {availableClasses.map((className) => (
          <Chip
            key={className}
            label={className}
            color={selectedClasses.includes(className) ? "primary" : "default"}
            onClick={() => onClassToggle(className)}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default DetectionFilters;