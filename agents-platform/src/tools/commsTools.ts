import { tool } from '@openai/agents';
import { z } from 'zod';

export const postSlackMessageTool = tool({
  name: 'post_slack_message',
  description: 'Post a message to a Slack channel (mock unless SLACK_BOT_TOKEN + channel configured).',
  parameters: z.object({
    channel: z.string(),
    text: z.string(),
  }),
  execute: async ({ channel, text }) => {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
      return { mode: 'mock', channel, text, ok: true };
    }
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ channel, text }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    return { mode: 'live', ok: data.ok, error: data.error };
  },
});

export const triggerPagerDutyTool = tool({
  name: 'trigger_pagerduty',
  description: 'Create a PagerDuty incident (mock unless PAGERDUTY_ROUTING_KEY is set).',
  parameters: z.object({
    summary: z.string(),
    severity: z.enum(['critical', 'error', 'warning', 'info']),
  }),
  execute: async ({ summary, severity }) => {
    const key = process.env.PAGERDUTY_ROUTING_KEY;
    if (!key) {
      return { mode: 'mock', summary, severity, incident_key: 'mock-incident' };
    }
    const res = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routing_key: key,
        event_action: 'trigger',
        payload: {
          summary,
          severity: severity === 'critical' ? 'critical' : 'error',
          source: 'agents-platform',
        },
      }),
    });
    return { mode: 'live', status: res.status, body: await res.text() };
  },
});
