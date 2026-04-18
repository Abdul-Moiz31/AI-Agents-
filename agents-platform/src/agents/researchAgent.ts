import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { fetchUrlTextTool, webSearchTool } from '../tools/researchTools.js';

export const researchAgent = new Agent({
  name: 'Research Agent',
  instructions: loadPrompt('research.md'),
  tools: [webSearchTool, fetchUrlTextTool],
});
