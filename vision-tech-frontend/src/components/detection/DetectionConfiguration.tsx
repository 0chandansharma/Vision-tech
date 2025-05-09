// src/components/detection/DetectionConfiguration.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchAvailableModels, createDetectionJob } from '../../store/detection/detectionSlice';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { PlayArrow as StartIcon } from '@mui/icons-material';

interface DetectionConfigurationProps {
  videoId: number;
  onJobCreated?: (jobId: number) => void;
}

const DetectionConfiguration: React.FC<DetectionConfigurationProps> = ({
  videoId,
  onJobCreated,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { availableModels, isLoading, error } = useSelector((state: RootState) => state.detection);
  
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.25);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    dispatch(fetchAvailableModels());
  }, [dispatch]);
  
  // Update available classes when model changes
  useEffect(() => {
    if (selectedModel && availableModels.length > 0) {
      const model = availableModels.find(m => m.id === selectedModel);
      if (model) {
        setAvailableClasses(model.classes || []);
        setSelectedClasses([]); // Reset selected classes when model changes
      }
    }
  }, [selectedModel, availableModels]);
  
  const handleModelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedModel(event.target.value as string);
  };
  
  const handleConfidenceChange = (_event: Event, newValue: number | number[]) => {
    setConfidenceThreshold(newValue as number);
  };
  
  const handleClassToggle = (classIndex: number) => {
    setSelectedClasses(prev => {
      if (prev.includes(classIndex)) {
        return prev.filter(index => index !== classIndex);
      } else {
        return [...prev, classIndex];
      }
    });
  };
  
  const handleSelectAllClasses = () => {
    if (selectedClasses.length === availableClasses.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(availableClasses.map((_, index) => index));
    }
  };
  
  const handleStartDetection = async () => {
    if (!selectedModel) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare parameters
      const parameters: Record<string, any> = {
        conf_threshold: confidenceThreshold,
      };
      
      if (selectedClasses.length > 0) {
        parameters.classes = selectedClasses;
      }
      
      const resultAction = await dispatch(
        createDetectionJob({
          videoId,
          modelName: selectedModel,
          parameters,
        })
      );
      
      if (createDetectionJob.fulfilled.match(resultAction)) {
        if (onJobCreated) {
          onJobCreated(resultAction.payload.id);
        }
      }
    } catch (err) {
      console.error('Failed to create detection job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading && availableModels.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Detection Configuration
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="model-select-label">Select Detection Model</InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={selectedModel}
          label="Select Detection Model"
          onChange={handleModelChange}
        >
          {availableModels.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.name} - {model.description}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedModel && (
        <>
          <Typography gutterBottom>
            Confidence Threshold: {confidenceThreshold}
          </Typography>
          <Slider
            value={confidenceThreshold}
            onChange={handleConfidenceChange}
            step={0.05}
            marks
            min={0.05}
            max={0.95}
            valueLabelDisplay="auto"
            sx={{ mb: 4 }}
          />
          
          {availableClasses.length > 0 && (
            <>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Classes to Detect
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedClasses.length === availableClasses.length}
                    indeterminate={selectedClasses.length > 0 && selectedClasses.length < availableClasses.length}
                    onChange={handleSelectAllClasses}
                  />
                }
                label="Select All"
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {availableClasses.map((className, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={selectedClasses.includes(index)}
                        onChange={() => handleClassToggle(index)}
                        size="small"
                      />
                    }
                    label={className}
                  />
                ))}
              </Box>
            </>
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <StartIcon />}
            onClick={handleStartDetection}
            disabled={isSubmitting || !selectedModel}
            fullWidth
          >
            {isSubmitting ? 'Starting Detection...' : 'Start Detection'}
          </Button>
        </>
      )}
    </Paper>
  );
};

export default DetectionConfiguration;