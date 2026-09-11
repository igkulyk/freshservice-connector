import { FreshServiceClient, FreshServiceConfig, FreshServiceError } from './client';
import { TicketsResource } from './resources/tickets';
import { AssetsResource } from './resources/assets';
import { AgentsResource } from './resources/agents';

export { FreshServiceError } from './client';
export type { FreshServiceConfig } from './client';
export type { Ticket, CreateTicketParams, UpdateTicketParams, ListTicketsParams } from './types/ticket';
export type { Asset, AssetType, CreateAssetParams, UpdateAssetParams, ListAssetsParams } from './types/asset';
export type { Agent, Group, ListAgentsParams, ListGroupsParams } from './types/agent';

export class FreshService {
  readonly tickets: TicketsResource;
  readonly assets: AssetsResource;
  readonly agents: AgentsResource;

  constructor(config: FreshServiceConfig) {
    const client = new FreshServiceClient(config);
    this.tickets = new TicketsResource(client);
    this.assets = new AssetsResource(client);
    this.agents = new AgentsResource(client);
  }

  /** Build a client from environment variables:
   *  FRESHSERVICE_DOMAIN and FRESHSERVICE_API_KEY */
  static fromEnv(): FreshService {
    const domain = process.env['FRESHSERVICE_DOMAIN'];
    const apiKey = process.env['FRESHSERVICE_API_KEY'];
    if (!domain || !apiKey) {
      throw new FreshServiceError(
        'FRESHSERVICE_DOMAIN and FRESHSERVICE_API_KEY must be set',
      );
    }
    return new FreshService({ domain, apiKey });
  }
}
