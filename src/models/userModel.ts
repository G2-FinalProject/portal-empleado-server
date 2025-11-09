import {
    Table, Column, Model, PrimaryKey, AutoIncrement, DataType, AllowNull,
    Unique
} from 'sequelize-typescript';
import type { UserAttributes, UserCreationAttributes } from '../types/userInterface.js';

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
    declare email: string;


    @Column({ allowNull: false, type: DataType.STRING(255) })
    declare password_hash: string;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    declare role_id: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    declare department_id: number;

    @AllowNull(false) @Column(DataType.INTEGER)
    declare location_id: number;


    @Column({ allowNull: false, type: DataType.INTEGER })
    declare available_days: number;
  role: any;

}
