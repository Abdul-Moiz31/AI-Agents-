import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { fetchPrDiffTool, getLintRulesTool } from '../tools/githubTools.js';

export const prReviewAgent = new Agent({
  name: 'PR Review Agent',
  instructions: loadPrompt('pr-review.md'),
  tools: [fetchPrDiffTool, getLintRulesTool],
});
