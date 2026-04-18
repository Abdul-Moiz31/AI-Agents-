import { useEffect, useState } from 'react';
import { ApiKeyModal } from '../components/ApiKeyModal.js';
import { ToolsGrid } from '../components/ToolsGrid.js';
import { Workspace } from '../components/Workspace.js';
import { useAppState } from '../context/AppStateContext.js';
import { useAgentRunner } from '../hooks/useAgentRunner.js';

export function ToolsPage() {
  const { specialists, meta, bootstrapError } = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!specialists.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev && specialists.some((s) => s.id === prev)) return prev;
      return specialists[0].id;
    });
  }, [specialists]);

  const {
    message,
    setMessage,
    output,
    loading,
    error,
    lastRun,
    onRun,
    sessionReady,
    apiKeyModalOpen,
    closeApiKeyModal,
    submitApiKey,
  } = useAgentRunner(selectedId);

  return (
    <div className="page page--tools">
      {bootstrapError && (
        <div className="page__banner page__banner--error" role="alert">
          {bootstrapError}
        </div>
      )}
      <header className="page__intro">
        <h2 className="page__intro-title">Specialist tools</h2>
        <p className="page__intro-text">
          Pick a single-purpose agent — PR review, SQL, RAG, fraud scoring, and the rest. Each tool uses the same
          run pipeline as the API; only the active agent changes.
        </p>
      </header>

      {specialists.length === 0 ? (
        <p className="page__empty">No specialists loaded yet. Check the API connection.</p>
      ) : (
        <>
          <ToolsGrid agents={specialists} selectedId={selectedId} onSelect={setSelectedId} />
          <Workspace
            meta={meta}
            message={message}
            onMessageChange={setMessage}
            onRun={onRun}
            loading={loading}
            sessionReady={sessionReady}
            error={error}
            output={output}
            lastRun={lastRun}
          />
          <ApiKeyModal open={apiKeyModalOpen} onClose={closeApiKeyModal} onSubmitKey={submitApiKey} />
        </>
      )}
    </div>
  );
}
