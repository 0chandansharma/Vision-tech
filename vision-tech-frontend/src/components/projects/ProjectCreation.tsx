import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createProject } from '../../store/projects/projectsSlice';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  Alert
} from '@mui/material';

const ProjectCreation: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !caseNumber) {
      setError('Project name and case number are required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const resultAction = await dispatch(createProject({
        name,
        case_number: caseNumber,
        description: description || undefined
      }));
      
      if (createProject.fulfilled.match(resultAction)) {
        navigate(`/projects/${resultAction.payload.id}`);
      } else {
        throw new Error('Failed to create project');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Create New Project
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Case Number"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="e.g. DOC09874"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/projects')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProjectCreation;