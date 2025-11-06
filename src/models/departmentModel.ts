import {
  Table, Column, Model, DataType, HasMany, AllowNull,
  ForeignKey, BelongsTo
} from 'sequelize-typescript';
import type { DepartmentAttributes, DepartmentCreationAttributes } from '../types/departmentInterface.js';
import { User } from './userModel.js';

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

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column({ type: DataType.INTEGER })
  declare manager_id: number;

  @BelongsTo(() => User, 'manager_id')
  declare manager: User;

  @HasMany(() => User)
  declare users: User[];
}
