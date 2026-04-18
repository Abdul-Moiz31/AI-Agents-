import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { loadIcpAndLeadsTool, recordAbVariantTool } from '../tools/salesTools.js';

export const salesOutreachAgent = new Agent({
  name: 'Sales Outreach Agent',
  instructions: loadPrompt('sales-outreach.md'),
  tools: [loadIcpAndLeadsTool, recordAbVariantTool],
});
