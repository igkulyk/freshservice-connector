export interface Agent {
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
  job_title?: string;
  phone?: string;
  mobile?: string;
  department_ids?: number[];
  location_id?: number;
  group_ids?: number[];
  role_ids?: number[];
  active: boolean;
  time_zone?: string;
  language?: string;
  occasional?: boolean;
  signature?: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  business_hours_id?: number;
  escalate_to?: number;
  unassigned_for?: string;
  auto_ticket_assign?: boolean;
  agent_ids?: number[];
  created_at: string;
  updated_at: string;
}

export interface ListAgentsParams {
  page?: number;
  per_page?: number;
  active?: boolean;
  state?: 'fulltime' | 'occasional';
  email?: string;
  group_id?: number;
}

export interface ListGroupsParams {
  page?: number;
  per_page?: number;
}
