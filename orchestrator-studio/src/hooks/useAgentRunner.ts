import { useCallback, useEffect, useState } from 'react';
import { runAgent, runAgentDemo } from '../api/client.js';
import { EXAMPLE_PROMPTS } from '../constants/examplePrompts.js';
import { USER_OPENAI_KEY_STORAGE } from '../constants/storageKeys.js';
import { useAppState } from '../context/AppStateContext.js';

function readStoredKey(): string | undefined {
  if (typeof sessionStorage === 'undefined') return undefined;
  const k = sessionStorage.getItem(USER_OPENAI_KEY_STORAGE)?.trim();
  return k && k.length > 0 ? k : undefined;
}

export function useAgentRunner(agentId: string | null) {
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
      const r = await runAgent(agentId, message, stored);
      applyRunResult(r);
      return;
    }

    if (session?.allowAnonymousServerRun) {
      const r = await runAgent(agentId, message);
      applyRunResult(r);
      return;
    }

    if (session?.demoAvailable && !session.demoConsumed) {
      const r = await runAgentDemo(agentId, message);
      applyRunResult(r);
      await refetchSession();
      return;
    }

    setApiKeyModalOpen(true);
  }, [agentId, message, session, refetchSession, applyRunResult]);

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
  }, []);

  const submitApiKey = useCallback(
    (key: string) => {
      if (!agentId) return;
      sessionStorage.setItem(USER_OPENAI_KEY_STORAGE, key.trim());
      setApiKeyModalOpen(false);
      setLoading(true);
      setError(null);
      setOutput('');
      setLastRun(null);
      void runAgent(agentId, message, key.trim())
        .then(applyRunResult)
        .catch((e) => setError(e instanceof Error ? e.message : String(e)))
        .finally(() => setLoading(false));
    },
    [agentId, message, applyRunResult],
  );

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
    closeApiKeyModal,
    submitApiKey,
  };
}
