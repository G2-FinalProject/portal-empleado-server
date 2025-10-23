export interface UserAttributes {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role_id: number;
  department_id: number;
  region: string;
  city: string;
  available_days: number;
  created_at: Date;
  updated_at: Date;
} 

export type UserCreationAttributes = Omit<UserAttributes, "id" | "created_at" | "update_at">;
