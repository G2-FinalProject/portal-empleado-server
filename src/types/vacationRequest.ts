export type VacationStatus = 'pending' | 'approved' | 'rejected';

export interface VacationRequestAttributes {
  id: number;
  requester_id: number;
  start_date: Date;
  end_date: Date;
  requested_days: number;
  request_status: VacationStatus;  //  usa el tipo aquí
  comments: string | null;
  created_at: Date;
  updated_at: Date;
}

export type VacationRequestCreationAttributes =
  Omit<VacationRequestAttributes, 'id' | 'created_at' | 'updated_at'>;
