export const EXAMPLE_PROMPTS: Record<string, string> = {
  'task-orchestrator':
    'We are launching an internal docs site: run research on "docs as code", draft a short launch blog outline, and list any incident risks if we ship Friday.',
  'pr-review':
    'Review PR for owner demo, repo payment-service, PR 42. Focus on security and logging.',
  'customer-support':
    'User says: "I STILL dont have my refund!!! This is USELESS!!!" Order ord_1003.',
  'nl-sql':
    'In plain English: show revenue by region for demo_revenue. Give SQL after validation.',
  research: 'Summarize what OpenAI Agents SDK is with Wikipedia-based bullets.',
  'meeting-copilot': 'Process the sample standup transcript and list action items with owners.',
  'sales-outreach': 'Draft A/B outreach for the sample leads in our ICP data.',
  'devops-automation':
    'Scale the API service: request approval with low blast radius then execute if approved.',
  'content-pipeline': 'Topic: observability for LLM apps in production. Full pipeline output.',
  'fraud-detection': 'Score fraud risk for transaction txn_2 and explain triggers.',
  'contract-analysis': 'Review the sample contract: flag auto-renewal and liability cap.',
  'email-inbox': 'Triage inbox and draft a reply to the invoice question.',
  'knowledge-rag': 'What does our handbook say about PII in logs?',
  'code-gen-exec': 'Compute (19 * 7) + 3 in the sandbox and show the tool result.',
  'incident-response': 'api service errors spiked; pull logs and suggest mitigations.',
};
