import {
  Table, Column, Model, DataType, AllowNull,

} from 'sequelize-typescript';
import type {
  VacationRequestAttributes,
  VacationRequestCreationAttributes,
  VacationStatus
} from '../types/vacationRequest.js';

@Table({
  tableName: 'vacation_requests',
  timestamps: true,
  underscored: true,
})
export class VacationRequest
  extends Model<VacationRequestAttributes, VacationRequestCreationAttributes>
  implements VacationRequestAttributes {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

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
  declare requester_comment: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(255) })
  declare approver_comment: string | null;

}
