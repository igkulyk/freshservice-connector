#!/usr/bin/env node
/**
 * FreshService MCP Server
 * Exposes FreshService API operations as MCP tools for use in Claude Code
 * and other MCP-compatible clients.
 *
 * Configure via environment variables:
 *   FRESHSERVICE_DOMAIN   — your subdomain (e.g. "sectigo")
 *   FRESHSERVICE_API_KEY  — API key from Admin → API Settings
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { FreshService, FreshServiceError } from './index.js';
import type { ListTicketsParams, CreateTicketParams, UpdateTicketParams } from './types/ticket.js';

const STATUS_LABELS: Record<number, string> = {
  2: 'Open', 3: 'Pending', 4: 'Resolved', 5: 'Closed',
};

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent',
};

function ok(data: unknown): { content: [{ type: 'text'; text: string }] } {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(e: unknown): { content: [{ type: 'text'; text: string }]; isError: true } {
  const msg = e instanceof FreshServiceError
    ? `FreshService error (HTTP ${e.statusCode ?? '?'}): ${e.message}`
    : String(e);
  return { content: [{ type: 'text', text: msg }], isError: true };
}

const server = new McpServer({
  name: 'freshservice',
  version: '1.0.0',
});

const fs = FreshService.fromEnv();

// ── Tickets ────────────────────────────────────────────────────────────────

server.tool(
  'list_tickets',
  'List FreshService tickets with optional filters. Returns id, subject, status, priority, created_at, and requester info.',
  {
    workspace_id: z.number().optional().describe('Filter by workspace ID'),
    status: z.number().optional().describe('Status code: 2=Open 3=Pending 4=Resolved 5=Closed'),
    priority: z.number().optional().describe('Priority code: 1=Low 2=Medium 3=High 4=Urgent'),
    updated_since: z.string().optional().describe('ISO 8601 date — only tickets updated after this date, e.g. 2026-09-01T00:00:00Z'),
    page: z.number().optional().describe('Page number (default 1)'),
    per_page: z.number().optional().describe('Results per page, max 100 (default 30)'),
    order_by: z.string().optional().describe('Field to sort by, e.g. created_at'),
    order_type: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    include: z.array(z.enum(['stats', 'requester', 'conversations', 'problem', 'assets']))
      .optional()
      .describe('Additional data to include in the response'),
  },
  async (args) => {
    try {
      const tickets = await fs.tickets.list(args as ListTicketsParams);
      const labelled = tickets.map(t => ({
        ...t,
        status_label: STATUS_LABELS[t.status] ?? `Status ${t.status}`,
        priority_label: PRIORITY_LABELS[t.priority] ?? `Priority ${t.priority}`,
      }));
      return ok({ count: labelled.length, tickets: labelled });
    } catch (e) { return err(e); }
  },
);

server.tool(
  'get_ticket',
  'Get a single FreshService ticket by ID.',
  {
    id: z.number().describe('Ticket ID'),
    include: z.array(z.enum(['stats', 'requester', 'conversations', 'problem', 'assets']))
      .optional()
      .describe('Additional data to include'),
  },
  async ({ id, include }) => {
    try {
      const ticket = await fs.tickets.get(id, include);
      return ok({
        ...ticket,
        status_label: STATUS_LABELS[ticket.status] ?? `Status ${ticket.status}`,
        priority_label: PRIORITY_LABELS[ticket.priority] ?? `Priority ${ticket.priority}`,
      });
    } catch (e) { return err(e); }
  },
);

server.tool(
  'create_ticket',
  'Create a new FreshService ticket.',
  {
    subject: z.string().describe('Ticket subject / title'),
    description: z.string().optional().describe('Ticket description (HTML allowed)'),
    email: z.string().email().optional().describe('Requester email address'),
    status: z.number().optional().describe('Status: 2=Open 3=Pending 4=Resolved 5=Closed (default 2)'),
    priority: z.number().optional().describe('Priority: 1=Low 2=Medium 3=High 4=Urgent (default 1)'),
    source: z.number().optional().describe('Source: 2=Portal 3=Email'),
    category: z.string().optional(),
    sub_category: z.string().optional(),
    group_id: z.number().optional().describe('Assign to group ID'),
    responder_id: z.number().optional().describe('Assign to agent ID'),
    tags: z.array(z.string()).optional(),
  },
  async (args) => {
    try {
      const ticket = await fs.tickets.create(args as CreateTicketParams);
      return ok(ticket);
    } catch (e) { return err(e); }
  },
);

server.tool(
  'update_ticket',
  'Update an existing FreshService ticket.',
  {
    id: z.number().describe('Ticket ID to update'),
    subject: z.string().optional(),
    description: z.string().optional(),
    status: z.number().optional().describe('Status: 2=Open 3=Pending 4=Resolved 5=Closed'),
    priority: z.number().optional().describe('Priority: 1=Low 2=Medium 3=High 4=Urgent'),
    category: z.string().optional(),
    sub_category: z.string().optional(),
    group_id: z.number().optional(),
    responder_id: z.number().optional(),
    tags: z.array(z.string()).optional(),
  },
  async ({ id, ...params }) => {
    try {
      const ticket = await fs.tickets.update(id, params as UpdateTicketParams);
      return ok(ticket);
    } catch (e) { return err(e); }
  },
);

server.tool(
  'close_ticket',
  'Close a FreshService ticket (sets status to Closed).',
  { id: z.number().describe('Ticket ID') },
  async ({ id }) => {
    try {
      const ticket = await fs.tickets.close(id);
      return ok(ticket);
    } catch (e) { return err(e); }
  },
);

server.tool(
  'resolve_ticket',
  'Resolve a FreshService ticket (sets status to Resolved).',
  { id: z.number().describe('Ticket ID') },
  async ({ id }) => {
    try {
      const ticket = await fs.tickets.resolve(id);
      return ok(ticket);
    } catch (e) { return err(e); }
  },
);

// ── Workspaces ─────────────────────────────────────────────────────────────

server.tool(
  'list_workspaces',
  'List all FreshService workspaces available in the account.',
  {},
  async () => {
    try {
      const workspaces = await fs.workspaces.list();
      return ok({ count: workspaces.length, workspaces });
    } catch (e) { return err(e); }
  },
);

// ── Agents & Groups ────────────────────────────────────────────────────────

server.tool(
  'list_agents',
  'List FreshService agents (support staff members).',
  {
    email: z.string().email().optional().describe('Filter by email address'),
    active: z.boolean().optional().describe('Filter by active status'),
    page: z.number().optional(),
    per_page: z.number().optional(),
  },
  async (args) => {
    try {
      const agents = await fs.agents.list(args);
      return ok({ count: agents.length, agents });
    } catch (e) { return err(e); }
  },
);

server.tool(
  'list_groups',
  'List FreshService agent groups.',
  {
    page: z.number().optional(),
    per_page: z.number().optional(),
  },
  async (args) => {
    try {
      const groups = await fs.agents.listGroups(args);
      return ok({ count: groups.length, groups });
    } catch (e) { return err(e); }
  },
);

// ── Start ──────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('FreshService MCP server running on stdio\n');
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e}\n`);
  process.exit(1);
});
