import {
  Table, Column, Model, DataType, AllowNull,
  ForeignKey, BelongsTo
} from 'sequelize-typescript';
import type { DepartmentAttributes, DepartmentCreationAttributes } from '../types/departmentInterface.js';

@Table({
  tableName: 'departments',
  timestamps: true,
  underscored: true,
})
export class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255) })
  declare department_name: string;

  @AllowNull(true)
  @Column({ type: DataType.INTEGER })
  declare manager_id: number;
}
