import { FreshServiceClient } from '../client';
import {
  Asset,
  AssetType,
  CreateAssetParams,
  UpdateAssetParams,
  ListAssetsParams,
} from '../types/asset';

export class AssetsResource {
  constructor(private readonly client: FreshServiceClient) {}

  async list(params: ListAssetsParams = {}): Promise<Asset[]> {
    const { include, ...rest } = params;
    const query: Record<string, unknown> = this.client.buildParams(rest);
    if (include?.length) query['include'] = include.join(',');

    const res = await this.client.http.get<{ assets: Asset[] }>('/assets', {
      params: query,
    });
    return res.data.assets;
  }

  async get(displayId: number, include?: string[]): Promise<Asset> {
    const params: Record<string, unknown> = {};
    if (include?.length) params['include'] = include.join(',');

    const res = await this.client.http.get<{ asset: Asset }>(
      `/assets/${displayId}`,
      { params },
    );
    return this.client.unwrap<Asset>(res.data as Record<string, unknown>, 'asset');
  }

  async create(params: CreateAssetParams): Promise<Asset> {
    const res = await this.client.http.post<{ asset: Asset }>('/assets', params);
    return this.client.unwrap<Asset>(res.data as Record<string, unknown>, 'asset');
  }

  async update(displayId: number, params: UpdateAssetParams): Promise<Asset> {
    const res = await this.client.http.put<{ asset: Asset }>(
      `/assets/${displayId}`,
      params,
    );
    return this.client.unwrap<Asset>(res.data as Record<string, unknown>, 'asset');
  }

  async delete(displayId: number): Promise<void> {
    await this.client.http.delete(`/assets/${displayId}`);
  }

  async listTypes(): Promise<AssetType[]> {
    const res = await this.client.http.get<{ asset_types: AssetType[] }>(
      '/asset_types',
    );
    return res.data.asset_types;
  }
}
