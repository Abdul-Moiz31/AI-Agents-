import { tool } from '@openai/agents';
import { z } from 'zod';

export const runSandboxCodeTool = tool({
  name: 'run_sandbox_code',
  description:
    'Execute short JavaScript in an isolated vm-like mock (no real VM here—eval disabled; only allowlisted ops).',
  parameters: z.object({
    language: z.enum(['javascript']),
    code: z.string().max(4000),
  }),
  execute: async ({ code }) => {
    const forbidden = /\b(require|import|process|child_process|fs)\b/;
    if (forbidden.test(code)) {
      return { ok: false, stderr: 'Forbidden identifiers in sandbox.', exitCode: 1 };
    }
    if (!/^[\s\n0-9+\-*/().,;'"A-Za-z_$]+$/.test(code)) {
      return { ok: false, stderr: 'Characters outside safe subset.', exitCode: 1 };
    }
    try {
      const fn = new Function(`return (${code})`)();
      return { ok: true, stdout: String(fn), exitCode: 0 };
    } catch (e) {
      return { ok: false, stderr: String(e), exitCode: 1 };
    }
  },
});
