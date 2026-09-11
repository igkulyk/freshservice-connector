export interface Asset {
  id: number;
  display_id: number;
  name: string;
  description?: string;
  asset_type_id: number;
  asset_tag?: string;
  impact?: string;
  author_type?: string;
  usage_type?: string;
  user_id?: number;
  department_id?: number;
  location_id?: number;
  agent_id?: number;
  group_id?: number;
  assigned_on?: string;
  created_at: string;
  updated_at: string;
  type_fields?: Record<string, unknown>;
}

export interface AssetType {
  id: number;
  name: string;
  parent_asset_type_id?: number;
  visible?: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetParams {
  name: string;
  asset_type_id: number;
  description?: string;
  asset_tag?: string;
  impact?: string;
  usage_type?: string;
  user_id?: number;
  department_id?: number;
  location_id?: number;
  type_fields?: Record<string, unknown>;
}

export interface UpdateAssetParams {
  name?: string;
  description?: string;
  asset_tag?: string;
  impact?: string;
  usage_type?: string;
  user_id?: number;
  department_id?: number;
  location_id?: number;
  type_fields?: Record<string, unknown>;
}

export interface ListAssetsParams {
  page?: number;
  per_page?: number;
  order_type?: 'asc' | 'desc';
  order_by?: string;
  search?: string;
  include?: ('type_fields' | 'tags' | 'components' | 'requests' | 'relationships')[];
}
