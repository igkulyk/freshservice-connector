/**
 * Read-only connection probe.
 * Usage:
 *   npx ts-node src/probe.ts <domain> <api-key>
 *   -- or set FRESHSERVICE_DOMAIN / FRESHSERVICE_API_KEY and run without args.
 */
import { FreshService, FreshServiceError } from './index';

async function main() {
  const [, , argDomain, argKey] = process.argv;
  const domain = argDomain ?? process.env['FRESHSERVICE_DOMAIN'] ?? '';
  const apiKey = argKey ?? process.env['FRESHSERVICE_API_KEY'] ?? '';

  if (!domain || !apiKey) {
    console.error('Usage: npx ts-node src/probe.ts <domain> <api-key>');
    process.exit(1);
  }

  const fs = new FreshService({ domain, apiKey });
  console.log(`Probing https://${domain}.freshservice.com …\n`);

  const checks: { label: string; fn: () => Promise<string> }[] = [
    {
      label: 'Agents (first page)',
      fn: async () => {
        const agents = await fs.agents.list({ per_page: 5 });
        return `${agents.length} agent(s) returned (showing up to 5)`;
      },
    },
    {
      label: 'Groups (first page)',
      fn: async () => {
        const groups = await fs.agents.listGroups({ per_page: 5 });
        return `${groups.length} group(s) returned (showing up to 5)`;
      },
    },
    {
      label: 'Tickets (first page, read-only)',
      fn: async () => {
        const tickets = await fs.tickets.list({ per_page: 5 });
        return `${tickets.length} ticket(s) returned (showing up to 5)`;
      },
    },
    {
      label: 'Asset types',
      fn: async () => {
        const types = await fs.assets.listTypes();
        return `${types.length} asset type(s) found`;
      },
    },
  ];

  let passed = 0;
  for (const check of checks) {
    try {
      const detail = await check.fn();
      console.log(`  ✓  ${check.label}: ${detail}`);
      passed++;
    } catch (err) {
      const msg = err instanceof FreshServiceError
        ? `HTTP ${err.statusCode ?? '?'} — ${err.message}`
        : String(err);
      console.log(`  ✗  ${check.label}: ${msg}`);
    }
  }

  console.log(`\n${passed}/${checks.length} checks passed.`);
  process.exit(passed === checks.length ? 0 : 1);
}

main();
