import { tool } from '@openai/agents';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const fetchPrDiffTool = tool({
  name: 'fetch_pr_diff',
  description:
    'Fetch unified diff for a GitHub pull request. Uses GITHUB_TOKEN when set; otherwise returns a mock diff for demos.',
  parameters: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
  }),
  execute: async ({ owner, repo, pull_number }) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      const mock = readFileSync(join(packageRoot, 'src', 'data', 'mock-pr-diff.txt'), 'utf-8');
      return {
        mode: 'mock',
        owner,
        repo,
        pull_number,
        diff: mock,
      };
    }
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.diff',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!res.ok) {
      return { error: `GitHub API ${res.status}`, body: await res.text() };
    }
    const diff = await res.text();
    return { mode: 'live', owner, repo, pull_number, diff };
  },
});

export const getLintRulesTool = tool({
  name: 'get_lint_rules',
  description: 'Return configured static analysis / lint rules for this repo review.',
  parameters: z.object({}),
  execute: async () => {
    const path = join(packageRoot, 'src', 'data', 'lint-rules.json');
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw) as unknown;
  },
});
