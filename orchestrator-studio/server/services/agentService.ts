import {
  type AgentId,
  type RagChunk,
  agentRegistry,
  getAgentEntry,
  runAgentById,
} from 'agents-platform';
import type { AgentDetailDto, AgentSummaryDto } from '../types/api.js';
import { flattenUserChunks } from './ragUserStore.js';

export function listAgents(): AgentSummaryDto[] {
  return agentRegistry.map(({ id, title, description }) => ({ id, title, description }));
}

export function getAgentById(id: string): AgentDetailDto | undefined {
  const entry = getAgentEntry(id as AgentId);
  if (!entry) return undefined;
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
  };
}

export function isValidAgentId(id: string): id is AgentId {
  return Boolean(getAgentEntry(id as AgentId));
}

export async function executeAgentRun(
  agentId: AgentId,
  message: string,
  options?: { openaiApiKey?: string; ragCollectionId?: string },
): Promise<string> {
  let ragExtraChunks: RagChunk[] | undefined;
  if (agentId === 'knowledge-rag' && options?.ragCollectionId) {
    const user = flattenUserChunks(options.ragCollectionId);
    if (user.length > 0) ragExtraChunks = user;
  }

  return runAgentById(agentId, message, {
    openaiApiKey: options?.openaiApiKey,
    ragExtraChunks,
  });
}
