import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, HasMany } from 'sequelize-typescript';
import { User } from './userModel.js';
import { Holiday } from './holidayModel.js';
import type { LocationAttributes, LocationCreationAttributes } from '../types/locationInterface.js';

@Table({ tableName: 'locations', timestamps: false, underscored: true })

export class Location 
extends Model<LocationAttributes, LocationCreationAttributes>
implements LocationAttributes {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(255)    })
    declare location_name: string;

    @HasMany(() => User)
    declare users: User[];

    @HasMany(() => Holiday)
    declare holidays: Holiday[];
}
