import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import {
  fetchActiveAlertsTool,
  fetchRecentLogsTool,
  runMitigationScriptTool,
} from '../tools/observabilityTools.js';
import { postSlackMessageTool, triggerPagerDutyTool } from '../tools/commsTools.js';

export const incidentResponseAgent = new Agent({
  name: 'Incident Response Agent',
  instructions: loadPrompt('incident-response.md'),
  tools: [
    fetchRecentLogsTool,
    fetchActiveAlertsTool,
    runMitigationScriptTool,
    postSlackMessageTool,
    triggerPagerDutyTool,
  ],
});
