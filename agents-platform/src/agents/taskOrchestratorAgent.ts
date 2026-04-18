import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { contentPipelineAgent } from './contentPipelineAgent.js';
import { customerSupportAgent } from './customerSupportAgent.js';
import { incidentResponseAgent } from './incidentResponseAgent.js';
import { prReviewAgent } from './prReviewAgent.js';
import { researchAgent } from './researchAgent.js';

/**
 * Coordinates a subset of specialists. Add more `.asTool()` delegations as needed.
 */
export const taskOrchestratorAgent = new Agent({
  name: 'Multi-Agent Task Orchestrator',
  instructions: loadPrompt('task-orchestrator.md'),
  tools: [
    prReviewAgent.asTool({
      toolName: 'delegate_pr_review',
      toolDescription:
        'Run a senior-style PR review. Include repo coordinates or paste the diff in your message.',
    }),
    researchAgent.asTool({
      toolName: 'delegate_research',
      toolDescription: 'Multi-step research with web search, optional page fetch, citations.',
    }),
    contentPipelineAgent.asTool({
      toolName: 'delegate_content_pipeline',
      toolDescription: 'End-to-end marketing content: keywords, draft, SEO metadata, social variants.',
    }),
    customerSupportAgent.asTool({
      toolName: 'delegate_customer_support',
      toolDescription: 'Support playbook: KB search, orders, payments, sentiment, escalation.',
    }),
    incidentResponseAgent.asTool({
      toolName: 'delegate_incident_response',
      toolDescription: 'Incident response: logs, alerts, mitigations, Slack/PagerDuty drafts.',
    }),
  ],
});
