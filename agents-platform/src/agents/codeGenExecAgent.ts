import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { runSandboxCodeTool } from '../tools/codeExecTools.js';

export const codeGenExecAgent = new Agent({
  name: 'Code Gen + Exec Agent',
  instructions: loadPrompt('code-gen-exec.md'),
  tools: [runSandboxCodeTool],
});
