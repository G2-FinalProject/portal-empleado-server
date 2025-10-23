import {
  Table, Column, Model, PrimaryKey, AutoIncrement, DataType, HasMany
} from 'sequelize-typescript';
import type { UserAttributes, UserCreationAttributes } from '../types/userInterface.js';
import { VacationRequest } from './vacationRequestModel.js';

@Table({ tableName: 'users', timestamps: true, underscored: true })
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {

  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  declare id: number;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare first_name: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare last_name: string;

  @Column({ allowNull: false, type: DataType.STRING(255), unique: true })
  declare email: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare password_hash: string;

  @Column({ allowNull: false, type: DataType.INTEGER })
  declare role_id: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  declare department_id: number;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare region: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare city: string;

  @Column({ allowNull: false, type: DataType.INTEGER, defaultValue: 23 })
  declare available_days: number;

  @Column({ allowNull: false, type: DataType.DATE, defaultValue: DataType.NOW })
  declare created_at: Date;

  @Column({ allowNull: false, type: DataType.DATE, defaultValue: DataType.NOW })
  declare updated_at: Date;

  @HasMany(() => VacationRequest)
  declare vacation_requests: VacationRequest[];
}
