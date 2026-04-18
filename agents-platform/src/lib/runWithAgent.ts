import { OpenAIProvider, Runner, run, type Agent } from '@openai/agents';

export async function runWithAgent<T extends Agent<any, any>>(
  agent: T,
  input: string,
  options?: { openaiApiKey?: string },
): Promise<string> {
  if (options?.openaiApiKey) {
    const runner = new Runner({
      modelProvider: new OpenAIProvider({ apiKey: options.openaiApiKey }),
    });
    const result = await runner.run(agent, input);
    return result.finalOutput ?? '';
  }
  const result = await run(agent, input);
  return result.finalOutput ?? '';
}
