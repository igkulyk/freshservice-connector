export type TicketStatus = 2 | 3 | 4 | 5;
// 2=Open, 3=Pending, 4=Resolved, 5=Closed

export type TicketPriority = 1 | 2 | 3 | 4;
// 1=Low, 2=Medium, 3=High, 4=Urgent

export type TicketSource = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Ticket {
  id: number;
  subject: string;
  description?: string;
  description_text?: string;
  email?: string;
  requester_id?: number;
  responder_id?: number;
  type: string;
  status: TicketStatus;
  priority: TicketPriority;
  source: TicketSource;
  category?: string;
  sub_category?: string;
  item_category?: string;
  group_id?: number;
  department_id?: number;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  due_by?: string;
  fr_due_by?: string;
  fr_escalated?: boolean;
  spam?: boolean;
  is_escalated?: boolean;
  association_type?: number;
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  content_type: string;
  size: number;
  name: string;
  attachment_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketParams {
  subject: string;
  description?: string;
  email?: string;
  requester_id?: number;
  type?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  source?: TicketSource;
  category?: string;
  sub_category?: string;
  group_id?: number;
  responder_id?: number;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface UpdateTicketParams {
  subject?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  sub_category?: string;
  group_id?: number;
  responder_id?: number;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface ListTicketsParams {
  page?: number;
  per_page?: number;
  order_type?: 'asc' | 'desc';
  order_by?: string;
  updated_since?: string;
  type?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  include?: ('stats' | 'requester' | 'conversations' | 'problem' | 'assets')[];
}
