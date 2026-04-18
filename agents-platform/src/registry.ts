import type { Agent } from '@openai/agents';
import { codeGenExecAgent } from './agents/codeGenExecAgent.js';
import { contentPipelineAgent } from './agents/contentPipelineAgent.js';
import { contractAnalysisAgent } from './agents/contractAnalysisAgent.js';
import { customerSupportAgent } from './agents/customerSupportAgent.js';
import { devopsAutomationAgent } from './agents/devopsAutomationAgent.js';
import { emailInboxAgent } from './agents/emailInboxAgent.js';
import { fraudDetectionAgent } from './agents/fraudDetectionAgent.js';
import { incidentResponseAgent } from './agents/incidentResponseAgent.js';
import { knowledgeBaseRagAgent } from './agents/knowledgeBaseRagAgent.js';
import { meetingCopilotAgent } from './agents/meetingCopilotAgent.js';
import { nlSqlAgent } from './agents/nlSqlAgent.js';
import { prReviewAgent } from './agents/prReviewAgent.js';
import { researchAgent } from './agents/researchAgent.js';
import { salesOutreachAgent } from './agents/salesOutreachAgent.js';
import { taskOrchestratorAgent } from './agents/taskOrchestratorAgent.js';
import { runWithAgent } from './lib/runWithAgent.js';

export type AgentId =
  | 'pr-review'
  | 'incident-response'
  | 'customer-support'
  | 'nl-sql'
  | 'research'
  | 'meeting-copilot'
  | 'sales-outreach'
  | 'devops-automation'
  | 'content-pipeline'
  | 'fraud-detection'
  | 'contract-analysis'
  | 'task-orchestrator'
  | 'email-inbox'
  | 'knowledge-rag'
  | 'code-gen-exec';

export type AgentRegistryEntry = {
  id: AgentId;
  title: string;
  description: string;
  agent: Agent<any, any>;
};

export const agentRegistry: AgentRegistryEntry[] = [
  {
    id: 'pr-review',
    title: 'PR Review',
    description: 'GitHub diff + lint rules → inline findings and summary.',
    agent: prReviewAgent,
  },
  {
    id: 'incident-response',
    title: 'Incident Response',
    description: 'Logs, alerts, mitigations, Slack/PagerDuty (mock/live).',
    agent: incidentResponseAgent,
  },
  {
    id: 'customer-support',
    title: 'Customer Support',
    description: 'KB + orders + escalation; angry-user detection.',
    agent: customerSupportAgent,
  },
  {
    id: 'nl-sql',
    title: 'NL → SQL',
    description: 'Validated read-only SQL + explanation.',
    agent: nlSqlAgent,
  },
  {
    id: 'research',
    title: 'Research',
    description: 'Web search + fetch; citations and confidence.',
    agent: researchAgent,
  },
  {
    id: 'meeting-copilot',
    title: 'Meeting Copilot',
    description: 'Transcript → summary, actions, calendar holds.',
    agent: meetingCopilotAgent,
  },
  {
    id: 'sales-outreach',
    title: 'Sales Outreach',
    description: 'ICP-aware drafts + A/B logging.',
    agent: salesOutreachAgent,
  },
  {
    id: 'devops-automation',
    title: 'DevOps Automation',
    description: 'Infra changes with approval gate.',
    agent: devopsAutomationAgent,
  },
  {
    id: 'content-pipeline',
    title: 'Content Pipeline',
    description: 'Topic → blog, SEO, social.',
    agent: contentPipelineAgent,
  },
  {
    id: 'fraud-detection',
    title: 'Fraud Detection',
    description: 'Rules + features → risk score.',
    agent: fraudDetectionAgent,
  },
  {
    id: 'contract-analysis',
    title: 'Contract Analysis',
    description: 'OCR/mock text → clause map + risk flags.',
    agent: contractAnalysisAgent,
  },
  {
    id: 'task-orchestrator',
    title: 'Multi-Agent Orchestrator',
    description: 'Delegates to PR, research, content, support, incident agents.',
    agent: taskOrchestratorAgent,
  },
  {
    id: 'email-inbox',
    title: 'Email Inbox',
    description: 'Triage + draft replies (Gmail mock).',
    agent: emailInboxAgent,
  },
  {
    id: 'knowledge-rag',
    title: 'Knowledge RAG',
    description: 'Retrieve internal chunks → grounded answers.',
    agent: knowledgeBaseRagAgent,
  },
  {
    id: 'code-gen-exec',
    title: 'Code Gen + Exec',
    description: 'Restricted sandbox execution demo.',
    agent: codeGenExecAgent,
  },
];

const byId = new Map<AgentId, AgentRegistryEntry>(agentRegistry.map((e) => [e.id, e]));

export function getAgentEntry(id: AgentId): AgentRegistryEntry | undefined {
  return byId.get(id);
}

export async function runAgentById(id: AgentId, message: string): Promise<string> {
  const entry = byId.get(id);
  if (!entry) throw new Error(`Unknown agent: ${id}`);
  return runWithAgent(entry.agent, message);
}
