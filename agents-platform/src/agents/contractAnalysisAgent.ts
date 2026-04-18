import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { ocrContractTool, parseContractClausesTool } from '../tools/contractTools.js';

export const contractAnalysisAgent = new Agent({
  name: 'Contract Analysis Agent',
  instructions: loadPrompt('contract-analysis.md'),
  tools: [ocrContractTool, parseContractClausesTool],
});
