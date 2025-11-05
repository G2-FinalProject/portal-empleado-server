export interface DepartmentAttributes {
  id: number;
  department_name: string;
  manager_id?: number; 
 
}

export type DepartmentCreationAttributes =
  Omit<DepartmentAttributes, 'id' | 'created_at' | 'updated_at'>;
