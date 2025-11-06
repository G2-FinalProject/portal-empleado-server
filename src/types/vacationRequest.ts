export type VacationStatus = 'pending' | 'approved' | 'rejected';

export interface VacationRequestAttributes {
  id: number;
  requester_id: number;
  start_date: Date;
  end_date: Date;
  requested_days: number;
  request_status: VacationStatus;  
  requester_comment: string | null;
  approver_comment: string | null;

}

export type VacationRequestCreationAttributes =
  Omit<VacationRequestAttributes, 'id'> & {
    requester_comment?: string | null; 
    approver_comment?: string | null;
  };
