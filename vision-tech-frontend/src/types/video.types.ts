export interface Video {
    id: number;
    project_id: number;
    filename: string;
    original_filename: string;
    file_path: string;
    file_size: number;
    duration?: number;
    width?: number;
    height?: number;
    fps?: number;
    format?: string;
    uploaded_by: number;
    uploaded_at: string;
    processing_status: string;
  }
  
  export interface VideoWithDetails extends Video {
    project: {
      id: number;
      name: string;
      case_number: string;
    };
    uploader: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    detection_jobs_count: number;
  }
  
  export interface VideoUploadParams {
    projectId: number;
    file: File;
    onProgress?: (progress: number) => void;
  }