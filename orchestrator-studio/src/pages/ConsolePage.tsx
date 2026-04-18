import { ApiKeyModal } from '../components/ApiKeyModal.js';
import { Workspace } from '../components/Workspace.js';
import { ORCHESTRATOR_AGENT_ID } from '../constants/orchestrator.js';
import { useAppState } from '../context/AppStateContext.js';
import { useAgentRunner } from '../hooks/useAgentRunner.js';

export function ConsolePage() {
  const { meta, bootstrapError } = useAppState();
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
    apiKeyModalSeed,
    closeApiKeyModal,
    submitApiKey,
    requestChangeApiKey,
    hasStoredApiKey,
  } = useAgentRunner(ORCHESTRATOR_AGENT_ID);

  return (
    <div className="page page--console">
      {bootstrapError && (
        <div className="page__banner page__banner--error" role="alert">
          {bootstrapError}
        </div>
      )}
      <header className="page__intro">
        <h2 className="page__intro-title">Unified console</h2>
        <p className="page__intro-text">
          This tab always runs the <span className="type-mono">{ORCHESTRATOR_AGENT_ID}</span> agent. Describe a
          complex goal in one brief — it will call the right specialists (research, content, support, incidents,
          PR review) and merge the results.
        </p>
      </header>
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
        hasStoredApiKey={hasStoredApiKey}
        onChangeApiKey={requestChangeApiKey}
      />
      <ApiKeyModal
        open={apiKeyModalOpen}
        onClose={closeApiKeyModal}
        onSubmitKey={submitApiKey}
        initialKey={apiKeyModalSeed}
      />
    </div>
  );
}
