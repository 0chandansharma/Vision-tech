import React, { useState } from 'react';
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
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface VideoUploadProps {
  projectId: number;
  onSuccess?: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ projectId, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    // Check file extension
    const validExtensions = ['mp4', 'avi', 'mov', 'mkv'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !validExtensions.includes(fileExt)) {
      setError(`Invalid file type. Supported formats: ${validExtensions.join(', ')}`);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 95) {
            clearInterval(progressInterval);
            return 95; // Pause at 95% until upload is confirmed
          }
          return newProgress;
        });
      }, 500);

      // Dispatch upload action
      const resultAction = await dispatch(
        uploadVideo({
          projectId,
          file,
          onProgress: (progress) => setProgress(progress),
        })
      );

      clearInterval(progressInterval);

      if (uploadVideo.fulfilled.match(resultAction)) {
        setProgress(100);
        setSuccess(true);
        setFile(null);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
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

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                <Typography>{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
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
                  {progress}% complete
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