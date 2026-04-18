import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { retrieveContextTool } from '../tools/ragTools.js';

export const knowledgeBaseRagAgent = new Agent({
  name: 'Knowledge Base RAG Agent',
  instructions: loadPrompt('knowledge-rag.md'),
  tools: [retrieveContextTool],
});
