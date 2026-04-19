import { useCallback, useEffect, useMemo, useState } from 'react';
import { runAgent, runAgentDemo, type RunAgentOptions } from '../api/client.js';
import { EXAMPLE_PROMPTS } from '../constants/examplePrompts.js';
import { USER_OPENAI_KEY_STORAGE } from '../constants/storageKeys.js';
import { useAppState } from '../context/AppStateContext.js';

function readStoredKey(): string | undefined {
  if (typeof sessionStorage === 'undefined') return undefined;
  const k = sessionStorage.getItem(USER_OPENAI_KEY_STORAGE)?.trim();
  return k && k.length > 0 ? k : undefined;
}

export type UseAgentRunnerOptions = {
  /** Passed to `/api/run` for `knowledge-rag` so uploads are included in retrieval. */
  ragCollectionId?: string | null;
};

export function useAgentRunner(agentId: string | null, opts?: UseAgentRunnerOptions) {
  const { session, refetchSession } = useAppState();
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<{
    durationMs: number;
    requestId: string;
    mode?: string;
  } | null>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  /** When set, modal opens with this value (e.g. existing key for edit). */
  const [apiKeyModalSeed, setApiKeyModalSeed] = useState<string | undefined>(undefined);

  const runOpts: RunAgentOptions | undefined = useMemo(() => {
    const id = opts?.ragCollectionId?.trim();
    return id && id.length > 0 ? { ragCollectionId: id } : undefined;
  }, [opts?.ragCollectionId]);

  useEffect(() => {
    if (!agentId) {
      setMessage('');
      setOutput('');
      setError(null);
      setLastRun(null);
      return;
    }
    const ex = EXAMPLE_PROMPTS[agentId];
    setMessage(ex ?? '');
    setOutput('');
    setError(null);
    setLastRun(null);
  }, [agentId]);

  const applyRunResult = useCallback((r: Awaited<ReturnType<typeof runAgent>>) => {
    setOutput(r.output);
    setLastRun({ durationMs: r.durationMs, requestId: r.requestId, mode: r.mode });
  }, []);

  const executeRun = useCallback(async () => {
    if (!agentId) return;

    const stored = readStoredKey();
    if (stored) {
      const r = await runAgent(agentId, message, stored, runOpts);
      applyRunResult(r);
      return;
    }

    if (session?.allowAnonymousServerRun) {
      const r = await runAgent(agentId, message, undefined, runOpts);
      applyRunResult(r);
      return;
    }

    if (session?.demoAvailable && !session.demoConsumed) {
      const r = await runAgentDemo(agentId, message, runOpts);
      applyRunResult(r);
      await refetchSession();
      return;
    }

    setApiKeyModalSeed(undefined);
    setApiKeyModalOpen(true);
  }, [agentId, message, session, refetchSession, applyRunResult, runOpts]);

  const onRun = useCallback(() => {
    if (!agentId || !session) return;
    setLoading(true);
    setError(null);
    setOutput('');
    setLastRun(null);
    void executeRun()
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [agentId, session, executeRun]);

  const closeApiKeyModal = useCallback(() => {
    setApiKeyModalOpen(false);
    setApiKeyModalSeed(undefined);
  }, []);

  const requestChangeApiKey = useCallback(() => {
    setApiKeyModalSeed(readStoredKey() ?? '');
    setApiKeyModalOpen(true);
  }, []);

  const submitApiKey = useCallback(
    (key: string) => {
      if (!agentId) return;
      sessionStorage.setItem(USER_OPENAI_KEY_STORAGE, key.trim());
      setApiKeyModalOpen(false);
      setApiKeyModalSeed(undefined);
      setLoading(true);
      setError(null);
      setOutput('');
      setLastRun(null);
      void runAgent(agentId, message, key.trim(), runOpts)
        .then(applyRunResult)
        .catch((e) => setError(e instanceof Error ? e.message : String(e)))
        .finally(() => setLoading(false));
    },
    [agentId, message, applyRunResult, runOpts],
  );

  const hasStoredApiKey = Boolean(readStoredKey());

  return {
    message,
    setMessage,
    output,
    loading,
    error,
    lastRun,
    onRun,
    sessionReady: session !== null,
    apiKeyModalOpen,
    apiKeyModalSeed,
    closeApiKeyModal,
    submitApiKey,
    requestChangeApiKey,
    hasStoredApiKey,
  };
}
