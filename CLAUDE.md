# FreshService Connector

TypeScript library and MCP server for the FreshService ITSM API v2.

## Project structure

```
src/
  client.ts          — Axios-based HTTP client, auth, error handling
  index.ts           — FreshService class (public API entry point)
  mcp-server.ts      — MCP server exposing FreshService tools over stdio
  resources/
    tickets.ts       — CRUD + list/close/resolve
    assets.ts        — asset management
    agents.ts        — agents and groups
    workspaces.ts    — workspace listing
  types/
    ticket.ts        — Ticket, CreateTicketParams, UpdateTicketParams, ListTicketsParams
    asset.ts         — Asset types
    agent.ts         — Agent, Group types
    workspace.ts     — Workspace type
.claude/
  agents/
    termination-report.md  — daily termination report agent (see below)
.mcp.json            — registers the freshservice MCP server for Claude Code
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `FRESHSERVICE_DOMAIN` | yes | Subdomain, e.g. `sectigo` |
| `FRESHSERVICE_API_KEY` | yes | API key from Admin → API Settings |
| `FRESHSERVICE_IO_WORKSPACE_ID` | no | Numeric ID of the I&O Test workspace; auto-detected by name if omitted |

## Common commands

```bash
npm run build       # compile TypeScript → dist/
npm run dev         # watch mode
npm run lint        # type-check only (no emit)
npm run mcp         # run MCP server from compiled dist/
npm run mcp:dev     # run MCP server with ts-node (no build needed)
```

## MCP server

`src/mcp-server.ts` exposes these tools:

- `list_tickets` — list tickets with filters (workspace, status, priority, date range)
- `get_ticket` — fetch one ticket by ID
- `create_ticket` — create a ticket
- `update_ticket` — update a ticket
- `close_ticket` / `resolve_ticket` — status shortcuts
- `list_workspaces` — list all workspaces
- `list_agents` — list agents/staff
- `list_groups` — list agent groups

## Agents

### `@termination-report`

Runs the daily termination report:
1. Finds the I&O Test workspace in FreshService and lists tickets updated in the last 24 h
2. Searches the Outlook TERMINATIONS folder for emails received in the last 24 h (uses the Microsoft 365 MCP connector — must be authenticated)
3. Saves a draft email with the formatted summary

Invoke with `@termination-report` in Claude Code. No Azure AD setup required — uses the existing Microsoft 365 MCP connection.
