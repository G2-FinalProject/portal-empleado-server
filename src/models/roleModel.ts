import {
  Table, Column, Model, DataType, HasMany, AllowNull
} from 'sequelize-typescript';
import type { RoleAttributes, RoleCreationAttributes } from '../types/roleInterface.js';
import { User } from './userModel.js';

@Table({
  tableName: 'roles',
  timestamps: true,
  underscored: true,
})
export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255) })
  declare role_name: string;

  @HasMany(() => User)
  declare users: User[];
}
