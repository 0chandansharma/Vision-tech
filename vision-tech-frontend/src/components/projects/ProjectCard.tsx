import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Folder as FolderIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatDate } from '../../utils/date.utils';
import { Project } from '../../types/project.types';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) {
      onEdit(project);
    }
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) {
      onDelete(project.id);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.light', mr: 1 }}>
              <FolderIcon />
            </Avatar>
            <Typography variant="h6" component="h3">
              {project.name}
            </Typography>
          </Box>
          {(onEdit || onDelete) && (
            <div>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {onEdit && (
                  <MenuItem onClick={handleEdit}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Edit
                  </MenuItem>
                )}
                {onDelete && (
                  <MenuItem onClick={handleDelete}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                  </MenuItem>
                )}
              </Menu>
            </div>
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Case Number: {project.case_number || 'N/A'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Created: {formatDate(project.created_at)}
        </Typography>
        
        {project.creator && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Created by: {project.creator.first_name || ''} {project.creator.last_name || ''}
          </Typography>
        )}
        
        {project.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {project.description}
          </Typography>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip
            label={`${project.video_count || 0} Videos`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {project.tags && project.tags.length > 0 && (
            project.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" />
            ))
          )}
        </Box>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          component={RouterLink}
          to={`/projects/${project.id}`}
        >
          View Project
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;