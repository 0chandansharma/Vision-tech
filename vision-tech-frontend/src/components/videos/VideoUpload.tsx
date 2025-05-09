import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { uploadVideo } from '../../store/videos/videosSlice';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Typography,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface VideoUploadProps {
  projectId: number;
  onSuccess?: () => void;
}

// Type for upload errors
interface UploadError {
  message: string;
  details?: string;
  code?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ projectId, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);
  const [success, setSuccess] = useState(false);

  // Use refs to manage intervals
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setSuccess(false);

      // Validate file size
      const maxSizeMB = 500; // 500MB limit
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setError({
          message: `File too large`,
          details: `Maximum file size is ${maxSizeMB}MB. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB.`
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      // Check file extension
      const validExtensions = ['mp4', 'avi', 'mov', 'mkv'];
      const fileExt = droppedFile.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !validExtensions.includes(fileExt)) {
        setError({
          message: `Invalid file type`,
          details: `Supported formats: ${validExtensions.join(', ')}`
        });
        return;
      }

      setFile(droppedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError({ message: 'Please select a file' });
      return;
    }

    // Check file extension again
    const validExtensions = ['mp4', 'avi', 'mov', 'mkv'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !validExtensions.includes(fileExt)) {
      setError({
        message: `Invalid file type`,
        details: `Supported formats: ${validExtensions.join(', ')}`
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      // Start a new interval for progress simulation
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          // Simulate a realistic progress curve that slows down as it approaches 95%
          const remaining = 95 - prev;
          const increment = Math.max(0.5, remaining * 0.1);
          const newProgress = prev + increment;

          if (newProgress >= 95) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return 95; // Pause at 95% until upload is confirmed
          }
          return Math.min(95, newProgress);
        });
      }, 300);

      // Dispatch upload action
      const resultAction = await dispatch(
        uploadVideo({
          projectId,
          file,
          onProgress: (progress) => {
            // For real progress updates from the API
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            setProgress(progress);
          },
        })
      );

      // Clean up interval if it's still running
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (uploadVideo.fulfilled.match(resultAction)) {
        setProgress(100);
        setSuccess(true);
        setFile(null);
        if (onSuccess) {
          onSuccess();
        }
      } else if (uploadVideo.rejected.match(resultAction)) {
        // Handle rejected action with payload
        const payload = resultAction.payload;
        if (payload && typeof payload === 'object') {
          setError({
            message: 'Upload failed',
            details: payload.toString()
          });
        } else {
          throw new Error(resultAction.error.message || 'Upload failed');
        }
      }
    } catch (err: unknown) {
      // Type guard for Error objects
      if (err instanceof Error) {
        setError({
          message: 'Upload failed',
          details: err.message
        });
      } else {
        setError({
          message: 'Upload failed',
          details: 'An unknown error occurred'
        });
      }

      // Ensure progress is reset
      setProgress(0);
    } finally {
      setUploading(false);

      // Final cleanup of any interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  const resetUpload = () => {
    setFile(null);
    setProgress(0);
    setError(null);
    setSuccess(false);

    // Clear any running interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Upload Video</Typography>
          {(uploading || success || error) && (
            <IconButton size="small" onClick={resetUpload}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              error.details ? (
                <Tooltip title={error.details}>
                  <IconButton size="small" color="inherit">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : undefined
            }
          >
            {error.message}
          </Alert>
        )}

        {success ? (
          <Alert severity="success" sx={{ mb: 2 }} icon={<SuccessIcon />}>
            Video uploaded successfully
          </Alert>
        ) : (
          <>
            {!uploading && !file && (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => document.getElementById('video-upload')?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="video-upload"
                  accept=".mp4,.avi,.mov,.mkv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <UploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography>Click to select or drag video file here</Typography>
                <Typography variant="caption" color="text.secondary">
                  Supported formats: MP4, AVI, MOV, MKV
                </Typography>
              </Box>
            )}

            {file && !uploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
            )}

            {uploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Uploading {file?.name}...
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 1, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {Math.round(progress)}% complete
                </Typography>
              </Box>
            )}

            {file && !uploading && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={resetUpload} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  startIcon={<UploadIcon />}
                  disabled={!!error}
                >
                  Upload
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoUpload;