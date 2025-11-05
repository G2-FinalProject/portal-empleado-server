export interface RoleAttributes {
  id: number;
  role_name: string;
  
}

export type RoleCreationAttributes =
  Omit<RoleAttributes, 'id' | 'created_at' | 'updated_at'>;
