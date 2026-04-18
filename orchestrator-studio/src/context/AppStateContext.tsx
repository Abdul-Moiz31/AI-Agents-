import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchAgents, fetchMeta, fetchSession } from '../api/client.js';
import type { AgentSummary, MetaResponse, SessionResponse } from '../api/types.js';
import { ORCHESTRATOR_AGENT_ID } from '../constants/orchestrator.js';

const SESSION_FALLBACK: SessionResponse = {
  demoAvailable: false,
  demoConsumed: true,
  allowAnonymousServerRun: false,
};

type AppStateValue = {
  agents: AgentSummary[];
  specialists: AgentSummary[];
  meta: MetaResponse | null;
  session: SessionResponse | null;
  bootstrapError: string | null;
  refetch: () => void;
  refetchSession: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const loadSession = useCallback(() => {
    return fetchSession()
      .then(setSession)
      .catch(() => setSession(SESSION_FALLBACK));
  }, []);

  const load = useCallback(() => {
    void fetchSession()
      .then(setSession)
      .catch(() => setSession(SESSION_FALLBACK));

    Promise.all([fetchAgents(), fetchMeta()])
      .then(([a, m]) => {
        setAgents(a);
        setMeta(m);
        setBootstrapError(null);
      })
      .catch(() =>
        setBootstrapError(
          'API unreachable. From orchestrator-studio run npm run dev (starts API + UI together), or npm run dev:api on port 8787.',
        ),
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const specialists = useMemo(
    () => agents.filter((a) => a.id !== ORCHESTRATOR_AGENT_ID),
    [agents],
  );

  const value = useMemo(
    () => ({
      agents,
      specialists,
      meta,
      session,
      bootstrapError,
      refetch: load,
      refetchSession: loadSession,
    }),
    [agents, specialists, meta, session, bootstrapError, load, loadSession],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
