import { run, type Agent } from '@openai/agents';

export async function runWithAgent<T extends Agent<any, any>>(
  agent: T,
  input: string,
): Promise<string> {
  const result = await run(agent, input);
  return result.finalOutput ?? '';
}
