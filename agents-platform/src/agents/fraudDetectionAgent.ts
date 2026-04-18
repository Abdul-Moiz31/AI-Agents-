import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { applyRulesEngineTool, loadTransactionEventsTool } from '../tools/fraudTools.js';

export const fraudDetectionAgent = new Agent({
  name: 'Fraud Detection Agent',
  instructions: loadPrompt('fraud-detection.md'),
  tools: [loadTransactionEventsTool, applyRulesEngineTool],
});
