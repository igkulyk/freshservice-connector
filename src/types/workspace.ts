export interface Workspace {
  id: number;
  name: string;
  description?: string | null;
  primary: boolean;
  primary_id: number;
  restricted: boolean;
  state: 'active' | 'archived';
  template_name: string;
  type: string;
  created_at: string;
  updated_at: string;
}
