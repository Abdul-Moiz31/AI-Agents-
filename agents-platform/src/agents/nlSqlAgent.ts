import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { executeSqlReadonlyTool, validateSqlTool } from '../tools/sqlTools.js';

export const nlSqlAgent = new Agent({
  name: 'NL → SQL Agent',
  instructions: loadPrompt('nl-sql.md'),
  tools: [validateSqlTool, executeSqlReadonlyTool],
});
