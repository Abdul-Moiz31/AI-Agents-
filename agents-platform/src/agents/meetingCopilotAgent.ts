import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { createCalendarHoldTool, loadMeetingTranscriptTool } from '../tools/meetingTools.js';

export const meetingCopilotAgent = new Agent({
  name: 'Meeting Copilot Agent',
  instructions: loadPrompt('meeting-copilot.md'),
  tools: [loadMeetingTranscriptTool, createCalendarHoldTool],
});
