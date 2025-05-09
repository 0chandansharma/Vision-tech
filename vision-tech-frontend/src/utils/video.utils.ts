/**
 * Get the API base URL from environment variables or use the default
 */
export const getApiBaseUrl = (): string => {
  return process.env.REACT_APP_API_URL || '/api/v1';
};

/**
 * Get the storage base URL from environment variables or use the default
 */
export const getStorageBaseUrl = (): string => {
  return process.env.REACT_APP_STORAGE_URL || '/storage';
};

/**
 * Format time in seconds to display format (mm:ss or hh:mm:ss)
 */
export const formatTimeDisplay = (seconds: number): string => {
  if (isNaN(seconds)) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

/**
 * Generate a video thumbnail URL
 */
export const getVideoThumbnailUrl = (videoId: number, timestamp: number = 0): string => {
  if (!videoId) return '';
  return `${getApiBaseUrl()}/videos/${videoId}/thumbnail?time=${timestamp}`;
};

/**
 * Get a signed URL for a video file
 */
export const getVideoUrl = (videoId: number): string => {
  if (!videoId) return '';
  return `${getApiBaseUrl()}/videos/${videoId}/stream`;
};

/**
 * Get URL for a specific detection object thumbnail
 */
export const getDetectionObjectUrl = (jobId: number, objectId: string): string => {
  if (!jobId || !objectId) return '';
  return `${getStorageBaseUrl()}/detection/${jobId}/objects/${objectId}.jpg`;
};

/**
 * Format file size in bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};