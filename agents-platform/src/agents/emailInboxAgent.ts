import { Agent } from '@openai/agents';
import { loadPrompt } from '../lib/loadPrompt.js';
import { draftGmailReplyTool, listGmailMessagesTool } from '../tools/emailTools.js';

export const emailInboxAgent = new Agent({
  name: 'Email Inbox Agent',
  instructions: loadPrompt('email-inbox.md'),
  tools: [listGmailMessagesTool, draftGmailReplyTool],
});
