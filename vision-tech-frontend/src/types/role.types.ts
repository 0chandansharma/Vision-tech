// src/types/role.types.ts
export interface Role {
    id: number;
    name: string;
    permissions: Record<string, boolean>;
    created_at: string;
  }
  
  export interface RoleCreate {
    name: string;
    permissions: Record<string, boolean>;
  }
  
  export interface RoleUpdate {
    name?: string;
    permissions?: Record<string, boolean>;
  }