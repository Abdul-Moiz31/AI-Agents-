import { tool } from '@openai/agents';
import { z } from 'zod';

const FORBIDDEN = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|EXEC|EXECUTE|CALL|MERGE|REPLACE)\b/i;
const DISALLOWED_SUFFIX = /;\s*\S/i;

/** Tiny in-memory demo table */
const DEMO_ROWS: Record<string, string | number>[] = [
  { id: 1, region: 'US', revenue: 12000, month: '2026-01' },
  { id: 2, region: 'EU', revenue: 8900, month: '2026-01' },
  { id: 3, region: 'US', revenue: 13400, month: '2026-02' },
];

export function validateSqlStrict(sql: string): { ok: boolean; error?: string } {
  const trimmed = sql.trim();
  if (!trimmed.toLowerCase().startsWith('select')) {
    return { ok: false, error: 'Only SELECT statements are allowed.' };
  }
  if (FORBIDDEN.test(trimmed)) {
    return { ok: false, error: 'Query contains forbidden keywords.' };
  }
  if (DISALLOWED_SUFFIX.test(trimmed)) {
    return { ok: false, error: 'Multiple statements are not allowed.' };
  }
  if (!trimmed.toLowerCase().includes('from demo_revenue')) {
    return {
      ok: false,
      error: 'For this sandbox, queries must read from table demo_revenue only.',
    };
  }
  if (!/\blimit\s+\d+\s*;?\s*$/i.test(trimmed)) {
    return { ok: false, error: 'Every query must end with a LIMIT clause (e.g. LIMIT 100).' };
  }
  return { ok: true };
}

export const validateSqlTool = tool({
  name: 'validate_sql',
  description:
    'Validate SQL for safety (read-only, single statement, allowlisted table). Must pass before execute_sql_readonly.',
  parameters: z.object({ sql: z.string() }),
  execute: async ({ sql }) => validateSqlStrict(sql),
});

export const executeSqlReadonlyTool = tool({
  name: 'execute_sql_readonly',
  description:
    'Run a previously validated SELECT against demo_revenue. Call validate_sql first; same SQL should be used.',
  parameters: z.object({ sql: z.string() }),
  execute: async ({ sql }) => {
    const v = validateSqlStrict(sql);
    if (!v.ok) return { error: v.error };
    return {
      rows: DEMO_ROWS,
      note: 'Demo data — wire to Postgres/MySQL with read-only role in production.',
    };
  },
});
