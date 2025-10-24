export type HolidayType = 'national' | 'regional' | 'company';

export interface HolidayAttributes {
  id: number;
  holiday_name: string;
  holiday_date: Date;
  holiday_type: HolidayType;
  location: string;
  created_at: Date;
  updated_at: Date;
}

export type HolidayCreationAttributes =
  Omit<HolidayAttributes, 'id' | 'created_at' | 'updated_at'>;
