import { FreshServiceClient } from '../client';
import {
  Ticket,
  CreateTicketParams,
  UpdateTicketParams,
  ListTicketsParams,
} from '../types/ticket';

export class TicketsResource {
  constructor(private readonly client: FreshServiceClient) {}

  async list(params: ListTicketsParams = {}): Promise<Ticket[]> {
    const { include, ...rest } = params;
    const query: Record<string, unknown> = this.client.buildParams(rest);
    if (include?.length) query['include'] = include.join(',');

    const res = await this.client.http.get<{ tickets: Ticket[] }>('/tickets', {
      params: query,
    });
    return res.data.tickets;
  }

  async get(id: number, include?: string[]): Promise<Ticket> {
    const params: Record<string, unknown> = {};
    if (include?.length) params['include'] = include.join(',');

    const res = await this.client.http.get<{ ticket: Ticket }>(
      `/tickets/${id}`,
      { params },
    );
    return this.client.unwrap<Ticket>(res.data as Record<string, unknown>, 'ticket');
  }

  async create(params: CreateTicketParams): Promise<Ticket> {
    const res = await this.client.http.post<{ ticket: Ticket }>(
      '/tickets',
      params,
    );
    return this.client.unwrap<Ticket>(res.data as Record<string, unknown>, 'ticket');
  }

  async update(id: number, params: UpdateTicketParams): Promise<Ticket> {
    const res = await this.client.http.put<{ ticket: Ticket }>(
      `/tickets/${id}`,
      params,
    );
    return this.client.unwrap<Ticket>(res.data as Record<string, unknown>, 'ticket');
  }

  async delete(id: number): Promise<void> {
    await this.client.http.delete(`/tickets/${id}`);
  }

  async close(id: number): Promise<Ticket> {
    return this.update(id, { status: 5 });
  }

  async resolve(id: number): Promise<Ticket> {
    return this.update(id, { status: 4 });
  }
}
