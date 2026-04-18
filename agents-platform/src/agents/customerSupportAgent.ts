import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import {
  checkPaymentStatusTool,
  detectSentimentTool,
  escalateTicketTool,
  getOrderTool,
  searchKnowledgeBaseTool,
} from '../tools/supportTools.js';

export const customerSupportAgent = new Agent({
  name: 'Customer Support Agent',
  instructions: loadPrompt('customer-support.md'),
  tools: [
    searchKnowledgeBaseTool,
    getOrderTool,
    checkPaymentStatusTool,
    detectSentimentTool,
    escalateTicketTool,
  ],
});
