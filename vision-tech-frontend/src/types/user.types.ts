export interface Role {
    id: number;
    name: string;
    permissions: Record<string, boolean>;
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    is_active: boolean;
    created_at: string;
    last_login?: string;
  }
  
  export interface LoginCredentials {
    username: string;
    password: string;
  }