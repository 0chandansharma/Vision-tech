export interface Detection {
    class_id: number;
    class_name: string;
    confidence: number;
    bbox: [number, number, number, number]; // [x, y, width, height]
    track_id?: number;
  }
  
  export interface FrameDetection {
    job_id: number;
    video_id: number;
    frame_number: number;
    timestamp: number;
    detections: Detection[];
    motion_areas?: number[][];
  }
  
  export interface TimelineEvent {
    type: string;
    class_name: string;
    track_id: number;
    start_time: number;
    end_time: number;
    first_frame: number;
    last_frame: number;
    confidence: number;
  }
  
  export interface Timeline {
    job_id: number;
    video_id: number;
    events: TimelineEvent[];
  }
  
  export interface DetectionJob {
    id: number;
    video_id: number;
    model_name: string;
    parameters?: Record<string, any>;
    status: string;
    created_by: number;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
  }
  
  export interface DetectionModel {
    id: string;
    name: string;
    type: string;
    description: string;
    classes: string[];
  }
  
  export interface ObjectThumbnail {
    id: string;
    job_id: number;
    video_id: number;
    frame_number: number;
    timestamp: number;
    class_id: number;
    class_name: string;
    confidence: number;
    bbox: [number, number, number, number];
    track_id?: number;
    thumbnail_url: string;
  }