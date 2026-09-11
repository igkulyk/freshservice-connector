import { FreshServiceClient } from '../client';
import {
  Agent,
  Group,
  ListAgentsParams,
  ListGroupsParams,
} from '../types/agent';

export class AgentsResource {
  constructor(private readonly client: FreshServiceClient) {}

  async list(params: ListAgentsParams = {}): Promise<Agent[]> {
    const res = await this.client.http.get<{ agents: Agent[] }>('/agents', {
      params: this.client.buildParams(params as Record<string, unknown>),
    });
    return res.data.agents;
  }

  async get(id: number): Promise<Agent> {
    const res = await this.client.http.get<{ agent: Agent }>(`/agents/${id}`);
    return this.client.unwrap<Agent>(res.data as Record<string, unknown>, 'agent');
  }

  async listGroups(params: ListGroupsParams = {}): Promise<Group[]> {
    const res = await this.client.http.get<{ groups: Group[] }>('/groups', {
      params: this.client.buildParams(params as Record<string, unknown>),
    });
    return res.data.groups;
  }

  async getGroup(id: number): Promise<Group> {
    const res = await this.client.http.get<{ group: Group }>(`/groups/${id}`);
    return this.client.unwrap<Group>(res.data as Record<string, unknown>, 'group');
  }
}
