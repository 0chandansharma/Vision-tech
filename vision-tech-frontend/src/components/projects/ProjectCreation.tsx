import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createProject, updateProject } from '../../store/projects/projectsSlice';
import { Project, ProjectCreate, ProjectUpdate } from '../../types/project.types';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';

interface ProjectCreationProps {
  isEdit?: boolean;
  initialData?: Project;
  onSubmit?: (data: ProjectCreate | ProjectUpdate) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const ProjectCreation: React.FC<ProjectCreationProps> = ({
  isEdit = false,
  initialData,
  onSubmit,
  isLoading: externalLoading,
  error: externalError
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [name, setName] = useState(initialData?.name || '');
  const [caseNumber, setCaseNumber] = useState(initialData?.case_number || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [error, setError] = useState<string | null>(externalError || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCaseNumber(initialData.case_number);
      setDescription(initialData.description || '');
      setTags(initialData.tags || []);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !caseNumber) {
      setError('Project name and case number are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use external submit function if provided
      if (onSubmit) {
        const formData = {
          name,
          case_number: caseNumber,
          description: description || undefined,
          tags: tags.length > 0 ? tags : undefined
        };
        await onSubmit(formData);
      } else {
        // Use internal dispatch if no external submit provided
        if (isEdit && initialData) {
          const resultAction = await dispatch(updateProject({
            id: initialData.id,
            data: {
              name,
              case_number: caseNumber,
              description: description || undefined,
              tags: tags.length > 0 ? tags : undefined
            }
          }));

          if (updateProject.fulfilled.match(resultAction)) {
            navigate(`/projects/${resultAction.payload.id}`);
          } else {
            throw new Error('Failed to update project');
          }
        } else {
          const resultAction = await dispatch(createProject({
            name,
            case_number: caseNumber,
            description: description || undefined,
            tags: tags.length > 0 ? tags : undefined
          }));

          if (createProject.fulfilled.match(resultAction)) {
            navigate(`/projects/${resultAction.payload.id}`);
          } else {
            throw new Error('Failed to create project');
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to save project');
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if loading from props or state
  const isLoading = externalLoading || isSubmitting;
  const errorMessage = error || externalError;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/projects')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            >
              {isLoading
                ? (isEdit ? 'Updating...' : 'Creating...')
                : (isEdit ? 'Update Project' : 'Create Project')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectCreation;