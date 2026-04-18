import { useCallback, useEffect, useState } from 'react';
import { runAgent } from '../api/client.js';
import { EXAMPLE_PROMPTS } from '../constants/examplePrompts.js';

export function useAgentRunner(agentId: string | null) {
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<{ durationMs: number; requestId: string } | null>(null);

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

  const onRun = useCallback(() => {
    if (!agentId) return;
    setLoading(true);
    setError(null);
    setOutput('');
    setLastRun(null);
    void runAgent(agentId, message)
      .then((r) => {
        setOutput(r.output);
        setLastRun({ durationMs: r.durationMs, requestId: r.requestId });
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [agentId, message]);

  return {
    message,
    setMessage,
    output,
    loading,
    error,
    lastRun,
    onRun,
  };
}
