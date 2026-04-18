import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { keywordResearchTool, seoMetadataTool } from '../tools/contentTools.js';

export const contentPipelineAgent = new Agent({
  name: 'Content Pipeline Agent',
  instructions: loadPrompt('content-pipeline.md'),
  tools: [keywordResearchTool, seoMetadataTool],
});
