export interface HolidayAttributes {
  id: number;
  holiday_name: string;
  holiday_date: Date;
  location_id: number;  
}

export type HolidayCreationAttributes =
  Omit<HolidayAttributes, 'id' | 'created_at' | 'updated_at'>;
