import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Button, 
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { 
  Folder as FolderIcon, 
  VideoLibrary as VideoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { formatDate } from '../../utils/date.utils';
import { Project } from '../../types/project.types';
import VideoList from '../videos/VideoList';
import VideoUpload from '../videos/VideoUpload';

interface ProjectDetailsProps {
  project: Project;
  onEditProject?: () => void;
  onDeleteProject?: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ 
  project, 
  onEditProject,
  onDeleteProject,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEditProject) {
      onEditProject();
    }
  };

  const handleDelete = () => {
    handleMenuClose();
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    setConfirmDelete(false);
    if (onDeleteProject) {
      onDeleteProject();
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  const handleUploadComplete = () => {
    setShowUploadDialog(false);
    // Refresh videos
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FolderIcon sx={{ fontSize: 36, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1">
                {project.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Case Number: {project.case_number || 'N/A'}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEdit}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Edit Project
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Delete Project
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Project Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(project.created_at)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body1">
                      {project.creator ? 
                        `${project.creator.first_name || ''} ${project.creator.last_name || ''}` : 
                        'Unknown'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {project.description || 'No description provided.'}
                    </Typography>
                  </Grid>
                  
                  {project.tags && project.tags.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Tags
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {project.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VideoIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      Videos
                    </Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    Upload Video
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {project.video_count || 0} Videos in this project
                </Typography>
                
                <VideoList 
                  projectId={project.id} 
                  limit={3} 
                  showViewAll={true}
                  onViewAll={() => navigate(`/projects/${project.id}/videos`)}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Upload Video Dialog */}
      <Dialog 
        open={showUploadDialog} 
        onClose={() => setShowUploadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Video</DialogTitle>
        <DialogContent>
          <VideoUpload 
            projectId={project.id} 
            onSuccess={handleUploadComplete} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this project? This action cannot be undone
            and will delete all associated videos and detection results.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectDetails;