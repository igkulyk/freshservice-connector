import { FreshServiceClient } from '../client';
import { Workspace } from '../types/workspace';

export class WorkspacesResource {
  constructor(private readonly client: FreshServiceClient) {}

  async list(): Promise<Workspace[]> {
    const res = await this.client.http.get<{ workspaces: Workspace[] }>('/workspaces');
    return res.data.workspaces;
  }

  async get(id: number): Promise<Workspace> {
    const res = await this.client.http.get<{ workspace: Workspace }>(`/workspaces/${id}`);
    return this.client.unwrap<Workspace>(res.data as Record<string, unknown>, 'workspace');
  }
}
