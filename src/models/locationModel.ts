import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, HasMany } from 'sequelize-typescript';
import { User } from './userModel.js';
import { Holiday } from './holidayModel.js';

@Table({ tableName: 'locations', timestamps: false })

export class Location extends Model<Location> {
  @PrimaryKey 
  @AutoIncrement 
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'location_name' })
  declare locationName: string;

  @HasMany(() => User) 
  declare users: User[];
  
  @HasMany(() => Holiday) 
  declare holidays: Holiday[];
}
