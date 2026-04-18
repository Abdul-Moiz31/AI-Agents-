import { tool } from '@openai/agents';
import { z } from 'zod';

const approvals = new Map<string, { approved: boolean; action: string; rationale: string }>();

export const requestInfraApprovalTool = tool({
  name: 'request_infra_approval',
  description:
    'Request human/system approval before mutating infrastructure. Returns action_id to pass to execute_infra_action.',
  parameters: z.object({
    action: z.string(),
    rationale: z.string(),
    blast_radius: z.enum(['low', 'medium', 'high']),
    requester: z.string().default('agent'),
  }),
  execute: async ({ action, rationale, blast_radius, requester }) => {
    const action_id = `infra_${Date.now()}`;
    const autoApprove = process.env.INFRA_AUTO_APPROVE === 'true';
    approvals.set(action_id, { approved: autoApprove, action, rationale });
    return {
      action_id,
      approved: autoApprove,
      blast_radius,
      requester,
      note: autoApprove
        ? 'INFRA_AUTO_APPROVE=true — do not use in production.'
        : 'Pending approval: set INFRA_AUTO_APPROVE=true for local demos only.',
    };
  },
});

export const executeInfraActionTool = tool({
  name: 'execute_infra_action',
  description:
    'Execute infrastructure change only after request_infra_approval. Checks approval record (mock AWS/GCP/K8s).',
  parameters: z.object({
    action_id: z.string(),
    action: z.string(),
  }),
  execute: async ({ action_id, action }) => {
    const row = approvals.get(action_id);
    if (!row?.approved) {
      return { ok: false, error: 'Not approved or unknown action_id' };
    }
    return {
      ok: true,
      action_id,
      action,
      provider: 'mock',
      message: 'Change applied in mock provider. Wire to cloud SDK with least privilege.',
    };
  },
});
