export interface Project {
    id: number;
    name: string;
    case_number: string;
    description?: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
    metadata?: Record<string, any>;
    creator: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    video_count: number;
  }
  
  export interface ProjectCreate {
    name: string;
    case_number: string;
    description?: string;
  }
  
  export interface ProjectMember {
    project_id: number;
    user_id: number;
    role: string;
    added_at: string;
  }