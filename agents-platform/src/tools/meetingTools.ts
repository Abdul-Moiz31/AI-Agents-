import { tool } from '@openai/agents';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const loadMeetingTranscriptTool = tool({
  name: 'load_meeting_transcript',
  description: 'Load a meeting transcript from the data folder (replace with Zoom/Google Meet API).',
  parameters: z.object({
    transcript_id: z.enum(['sample', 'inline']).default('sample'),
    inline_text: z.string().optional(),
  }),
  execute: async ({ transcript_id, inline_text }) => {
    if (transcript_id === 'inline' && inline_text) {
      return { transcript_id, text: inline_text };
    }
    const text = readFileSync(
      join(packageRoot, 'src', 'data', 'meeting-transcript-sample.txt'),
      'utf-8',
    );
    return { transcript_id: 'sample', text };
  },
});

export const createCalendarHoldTool = tool({
  name: 'create_calendar_hold',
  description: 'Create a calendar hold (mock; connect Google Calendar API with OAuth in production).',
  parameters: z.object({
    title: z.string(),
    start_iso: z.string(),
    end_iso: z.string(),
    attendees: z.array(z.string()).default([]),
  }),
  execute: async (payload) => ({
    mode: 'mock',
    eventId: `cal_${Date.now()}`,
    ...payload,
  }),
});
