import { agentRegistry, runAgentById } from './index.js';

async function main() {
  const id = (process.argv[2] as (typeof agentRegistry)[number]['id']) ?? 'research';
  const message =
    process.argv.slice(3).join(' ') || 'What is TypeScript? Give a short answer with one source.';

  console.log(`Agent: ${id}`);
  console.log(`Message: ${message}\n---\n`);

  const out = await runAgentById(id, message);
  console.log(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
