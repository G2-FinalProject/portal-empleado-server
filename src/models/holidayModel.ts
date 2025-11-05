import { Table, Column, Model, DataType, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import type { HolidayAttributes, HolidayCreationAttributes } from '../types/holidayInterface.js';
import { Location } from './locationModel.js';

@Table({
    tableName: 'holidays',
    timestamps: true,
    underscored: true,
})
export class Holiday
    extends Model<HolidayAttributes, HolidayCreationAttributes>
    implements HolidayAttributes {
    @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
    declare id: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING(255) })
    declare holiday_name: string;

    @AllowNull(false)
    @Column({ type: DataType.DATEONLY })
    declare holiday_date: Date;

    @ForeignKey(() => Location) @AllowNull(false) @Column(DataType.INTEGER)
    declare location_id: number;
    
    @BelongsTo(() => Location) 
    declare location: Location;

    
}
