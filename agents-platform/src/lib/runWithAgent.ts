import { OpenAIProvider, Runner, run, type Agent } from '@openai/agents';
import { ragRequestContext, type RagChunk } from './ragRequestContext.js';

export type RunWithAgentOptions = {
  openaiApiKey?: string;
  /** Merged with demo chunks inside `retrieve_context` for this run only. */
  ragExtraChunks?: RagChunk[];
};

export async function runWithAgent<T extends Agent<any, any>>(
  agent: T,
  input: string,
  options?: RunWithAgentOptions,
): Promise<string> {
  const extra = options?.ragExtraChunks;
  const execute = async () => {
    if (options?.openaiApiKey) {
      const runner = new Runner({
        modelProvider: new OpenAIProvider({ apiKey: options.openaiApiKey }),
      });
      const result = await runner.run(agent, input);
      return result.finalOutput ?? '';
    }
    const result = await run(agent, input);
    return result.finalOutput ?? '';
  };

  if (extra && extra.length > 0) {
    return ragRequestContext.run({ extraChunks: extra }, execute);
  }
  return execute();
}
