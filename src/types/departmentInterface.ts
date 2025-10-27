export interface DepartmentAttributes {
  id: number;
  department_name: string;
  manager_id?: number; // FK a users.id
  created_at: Date;
  updated_at: Date;
}

export type DepartmentCreationAttributes =
  Omit<DepartmentAttributes, 'id' | 'created_at' | 'updated_at'>;
