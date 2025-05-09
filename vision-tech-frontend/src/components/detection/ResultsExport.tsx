//src/components/detection/ResultsExport.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Description as JsonIcon,
  TableChart as CsvIcon,
  VideoFile as VideoIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { exportDetectionResults } from '../../store/detection/detectionSlice';

interface ResultsExportProps {
  jobId: number;
}

const ResultsExport: React.FC<ResultsExportProps> = ({ jobId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFormat(null);
  };

  const handleExport = async (format: 'json' | 'csv' | 'video') => {
    setLoading(true);
    setSelectedFormat(format);

    try {
      const resultAction = await dispatch(
        exportDetectionResults({
          jobId,
          format,
        })
      );

      if (exportDetectionResults.fulfilled.match(resultAction)) {
        const { download_url } = resultAction.payload;
        
        // Open download in new tab
        window.open(download_url, '_blank');
        
        setNotification({
          open: true,
          message: `Successfully exported results in ${format.toUpperCase()} format`,
          severity: 'success',
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to export results: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <>
      <Button 
        variant="outlined" 
        startIcon={<DownloadIcon />} 
        onClick={handleOpen}
        fullWidth
      >
        Export Results
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Export Detection Results
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Typography gutterBottom>
            Select the format to export detection results:
          </Typography>
          
          <List>
            <ListItem 
              button 
              onClick={() => handleExport('json')}
              disabled={loading}
              selected={selectedFormat === 'json'}
            >
              <ListItemIcon>
                {loading && selectedFormat === 'json' ? 
                  <CircularProgress size={24} /> : 
                  <JsonIcon color="primary" />
                }
              </ListItemIcon>
              <ListItemText 
                primary="JSON Format" 
                secondary="Export all detection data in JSON format" 
              />
            </ListItem>
            
            <ListItem 
              button 
              onClick={() => handleExport('csv')}
              disabled={loading}
              selected={selectedFormat === 'csv'}
            >
              <ListItemIcon>
                {loading && selectedFormat === 'csv' ? 
                  <CircularProgress size={24} /> : 
                  <CsvIcon color="primary" />
                }
              </ListItemIcon>
              <ListItemText 
                primary="CSV Format" 
                secondary="Export detection coordinates and metadata in CSV format" 
              />
            </ListItem>
            
            <ListItem 
              button 
              onClick={() => handleExport('video')}
              disabled={loading || true} // Video export disabled for now
              selected={selectedFormat === 'video'}
            >
              <ListItemIcon>
                {loading && selectedFormat === 'video' ? 
                  <CircularProgress size={24} /> : 
                  <VideoIcon color="disabled" />
                }
              </ListItemIcon>
              <ListItemText 
                primary="Annotated Video (Coming Soon)" 
                secondary="Export video with detection annotations overlay" 
              />
            </ListItem>
          </List>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// IconButton component for close button
const IconButton: React.FC<{
  'aria-label': string;
  onClick: () => void;
  sx: any;
  children: React.ReactNode;
}> = (props) => {
  return (
    <Button 
      size="small" 
      onClick={props.onClick} 
      sx={{ 
        minWidth: 'auto', 
        padding: '4px',
        borderRadius: '50%',
        ...props.sx
      }}
    >
      {props.children}
    </Button>
  );
};

export default ResultsExport;