export type HomeFeature = {
  title: string;
  summary: string;
  tag: string;
};

export const HOME_FEATURES: HomeFeature[] = [
  {
    tag: 'Console',
    title: 'Unified orchestration',
    summary:
      'One natural-language brief routes through the task orchestrator, which delegates to PR review, research, content, support, and incident agents as needed.',
  },
  {
    tag: 'Tools',
    title: 'Specialist surface',
    summary:
      'Fourteen focused agents—from NL→SQL and RAG to fraud and contracts—available as pick-and-run tools without touching the orchestrator.',
  },
  {
    tag: 'API',
    title: 'Production HTTP API',
    summary:
      'List agents, fetch metadata, and execute runs over REST with validation, rate limits, concurrency caps, and request IDs for support and audit.',
  },
  {
    tag: 'Safety',
    title: 'Guardrails by design',
    summary:
      'Read-only SQL validation, infra approval gates in agent tools, and soft timeouts on runs reduce accidental misuse in demos and pilots.',
  },
  {
    tag: 'Observability',
    title: 'Run transparency',
    summary:
      'Every response includes duration and a request id aligned with API logs—easier to trace failures and compare iterations.',
  },
  {
    tag: 'Experience',
    title: 'Operator-first UI',
    summary:
      'Editorial layout, light and dark themes, and a clear split between “one job” console work and repeatable specialist tasks.',
  },
];

export type HomeStep = {
  step: string;
  title: string;
  body: string;
};

export const HOME_STEPS: HomeStep[] = [
  {
    step: '01',
    title: 'Choose your mode',
    body: 'Use the Console for cross-cutting goals, or Tools when you already know which agent should run.',
  },
  {
    step: '02',
    title: 'Write the brief',
    body: 'State intent, constraints, and any ids (orders, repos, transactions). Sample prompts load per agent to get you started.',
  },
  {
    step: '03',
    title: 'Execute and review',
    body: 'Read the transcript, note elapsed time and request id, then iterate or switch specialists without leaving the studio.',
  },
];

export const HOME_CAPABILITY_GROUPS = [
  {
    title: 'Engineering',
    items: ['Pull request review', 'Code generation sandbox', 'DevOps approval workflow'],
  },
  {
    title: 'Operations',
    items: ['Incident response drafts', 'Log and alert triage', 'Mitigation script hooks'],
  },
  {
    title: 'Customer & revenue',
    items: ['Tier-1 support with escalation', 'Sales outreach variants', 'Meeting notes to actions'],
  },
  {
    title: 'Risk & knowledge',
    items: ['Fraud scoring demo', 'Contract clause pass', 'RAG over internal chunks', 'Validated read-only SQL'],
  },
] as const;
