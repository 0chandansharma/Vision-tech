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
    // In a real application, this would generate a URL to fetch a thumbnail from the server
    return `/api/v1/videos/${videoId}/thumbnail?time=${timestamp}`;
  };
  
  /**
   * Get a signed URL for a video file
   */
  export const getVideoUrl = (videoId: number): string => {
    // In a real application, this would return a signed URL to access the video
    return `/api/v1/videos/${videoId}/stream`;
  };