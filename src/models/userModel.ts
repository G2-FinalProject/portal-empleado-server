import {
    Table, Column, Model, PrimaryKey, AutoIncrement, DataType, HasMany, BelongsTo, AllowNull, ForeignKey,
    Unique
} from 'sequelize-typescript';
import type { UserAttributes, UserCreationAttributes } from '../types/userInterface.js';
import { VacationRequest } from './vacationRequestModel.js';
import { Department } from './departmentModel.js';
import { Role } from './roleModel.js';
import { Location } from './locationModel.js';

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

    @Unique('users_email_uq')
    @Column({ type: DataType.STRING(255), allowNull: false })
    email!: string;


    @Column({ allowNull: false, type: DataType.STRING(255) })
    declare password_hash: string;

    @ForeignKey(() => Role)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    declare role_id: number;

    @BelongsTo(() => Role)
    declare role: Role;

    @ForeignKey(() => Department)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    declare department_id: number;

    @BelongsTo(() => Department)
    declare department: Department;

    @ForeignKey(() => Location) @AllowNull(false) @Column(DataType.INTEGER)
    declare location_id: number;
    @BelongsTo(() => Location)
    declare location: Location;

    @Column({ allowNull: false, type: DataType.INTEGER, defaultValue: 23 })
    declare available_days: number;


    @HasMany(() => VacationRequest)
    declare vacation_requests: VacationRequest[];
}
