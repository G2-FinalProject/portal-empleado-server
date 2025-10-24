export interface RoleAttributes {
  id: number;
  role_name: string;
  created_at: Date;
  updated_at: Date;
}

export type RoleCreationAttributes =
  Omit<RoleAttributes, 'id' | 'created_at' | 'updated_at'>;
