import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { executeInfraActionTool, requestInfraApprovalTool } from '../tools/devopsTools.js';

export const devopsAutomationAgent = new Agent({
  name: 'DevOps Automation Agent',
  instructions: loadPrompt('devops-automation.md'),
  tools: [requestInfraApprovalTool, executeInfraActionTool],
});
