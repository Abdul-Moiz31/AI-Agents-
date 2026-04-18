import { tool } from '@openai/agents';
import { z } from 'zod';

const MOCK_INBOX = [
  {
    id: 'm1',
    from: 'client@example.com',
    subject: 'Invoice question',
    snippet: 'Can you resend invoice for March?',
    thread: 'Need PDF attached.',
  },
  {
    id: 'm2',
    from: 'news@vendor.com',
    subject: 'April product newsletter',
    snippet: 'Top features this month...',
    thread: 'Marketing',
  },
];

export const listGmailMessagesTool = tool({
  name: 'list_gmail_messages',
  description: 'List recent messages (mock Gmail; use Gmail API with OAuth2 in production).',
  parameters: z.object({ label: z.string().default('INBOX'), max: z.number().default(10) }),
  execute: async ({ max }) => ({ messages: MOCK_INBOX.slice(0, max) }),
});

export const draftGmailReplyTool = tool({
  name: 'draft_gmail_reply',
  description: 'Draft a reply for a message id (mock).',
  parameters: z.object({
    message_id: z.string(),
    reply_body: z.string(),
  }),
  execute: async ({ message_id, reply_body }) => ({
    mode: 'mock',
    message_id,
    draft: reply_body,
    status: 'ready_to_send',
  }),
});
