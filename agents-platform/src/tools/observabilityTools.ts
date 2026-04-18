import { tool } from '@openai/agents';
import { z } from 'zod';

/** Demo log lines — replace with Datadog/Prometheus queries in production. */
const SAMPLE_LOGS = [
  { ts: '2026-04-18T10:00:01Z', level: 'error', service: 'api', msg: 'timeout contacting payments-gw' },
  { ts: '2026-04-18T10:00:03Z', level: 'warn', service: 'api', msg: 'retry 2/3 payments-gw' },
  { ts: '2026-04-18T10:00:08Z', level: 'error', service: 'worker', msg: 'queue depth payments9000 > threshold' },
];

export const fetchRecentLogsTool = tool({
  name: 'fetch_recent_logs',
  description: 'Fetch recent production logs for a service (demo dataset; wire to Datadog/Loki in prod).',
  parameters: z.object({
    service: z.string().describe('Service name filter'),
    window_minutes: z.number().default(30),
  }),
  execute: async ({ service }) => {
    return {
      source: 'demo',
      service,
      lines: SAMPLE_LOGS.filter((l) => l.service === service || service === 'all'),
    };
  },
});

export const fetchActiveAlertsTool = tool({
  name: 'fetch_active_alerts',
  description: 'List firing alerts (demo; wire to Prometheus Alertmanager or Datadog monitors).',
  parameters: z.object({}),
  execute: async () => ({
    alerts: [
      { name: 'HighErrorRate', severity: 'critical', service: 'api' },
      { name: 'PaymentsLatencyP99', severity: 'warning', service: 'payments-gw' },
    ],
  }),
});

export const runMitigationScriptTool = tool({
  name: 'run_mitigation_script',
  description:
    'Execute an approved mitigation script (dry-run / mock). In production, run in controlled runner with audit.',
  parameters: z.object({
    script_id: z.enum(['restart-payments-gw', 'scale-api', 'enable-circuit-breaker']),
    dry_run: z.boolean().default(true),
  }),
  execute: async ({ script_id, dry_run }) => ({
    script_id,
    dry_run,
    status: dry_run ? 'would_execute' : 'executed_mock',
    message: `Mitigation ${script_id} completed in sandbox.`,
  }),
});
