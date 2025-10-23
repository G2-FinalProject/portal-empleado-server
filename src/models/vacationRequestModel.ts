import {
  Table, Column, Model, DataType, AllowNull,
  ForeignKey, BelongsTo
} from 'sequelize-typescript';
import type {
  VacationRequestAttributes,
  VacationRequestCreationAttributes,
  VacationStatus
} from '../types/vacationRequest.js';
import { User } from './userModel.js';

@Table({
  tableName: 'vacation_request',
  timestamps: true,
  underscored: true,
})
export class VacationRequest
  extends Model<VacationRequestAttributes, VacationRequestCreationAttributes>
  implements VacationRequestAttributes
{
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  declare requester_id: number;

  @AllowNull(false)
  @Column({ type: DataType.DATEONLY })
  declare start_date: Date;

  @AllowNull(false)
  @Column({ type: DataType.DATEONLY })
  declare end_date: Date;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  declare requested_days: number;

  @AllowNull(false)
  @Column({ type: DataType.ENUM('pending', 'approved', 'rejected') })
  declare request_status: VacationStatus;

  @AllowNull(true)
  @Column({ type: DataType.STRING(255) })
  declare comments: string | null;

  @Column({ type: DataType.DATE })
  declare created_at: Date;

  @Column({ type: DataType.DATE })
  declare updated_at: Date;

  @BelongsTo(() => User, 'requester_id')
  declare requester: User;
}
