import type { MetaResponse } from '../api/types.js';

type Props = {
  meta: MetaResponse | null;
  message: string;
  onMessageChange: (v: string) => void;
  onRun: () => void;
  loading: boolean;
  sessionReady?: boolean;
  error: string | null;
  output: string;
  lastRun: { durationMs: number; requestId: string; mode?: string } | null;
};

export function Workspace({
  meta,
  message,
  onMessageChange,
  onRun,
  loading,
  sessionReady = true,
  error,
  output,
  lastRun,
}: Props) {
  const serverKeyMissing = meta && !meta.openaiConfigured;

  return (
    <div className="studio">
      {serverKeyMissing && (
        <div className="studio__alert" role="status">
          No shared <span className="type-mono">OPENAI_API_KEY</span> on this host — use one free demo (if offered) or
          add your key when you run. For local dev with a shared key, set it in <span className="type-mono">.env</span>{' '}
          and restart the API.
        </div>
      )}

      <section className="memo" aria-labelledby="memo-heading">
        <div className="memo__rule" aria-hidden />
        <div className="memo__inner">
          <header className="memo__head">
            <h2 id="memo-heading" className="memo__title">
              Brief
            </h2>
            <p className="memo__hint">Instructions for the active agent.</p>
          </header>
          <textarea
            className="memo__field"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="State the objective, constraints, and any identifiers the tools should use."
            spellCheck={false}
            rows={6}
          />
          <footer className="memo__foot">
            <button
              type="button"
              className="memo__submit"
              disabled={loading || !sessionReady}
              onClick={onRun}
            >
              {loading ? (
                <>
                  <span className="memo__spinner" aria-hidden />
                  Working
                </>
              ) : (
                'Execute run'
              )}
            </button>
          </footer>
        </div>
      </section>

      <section className="transcript" aria-labelledby="transcript-heading">
        <header className="transcript__head">
          <h2 id="transcript-heading" className="transcript__title">
            Transcript
          </h2>
          {lastRun ? (
            <dl className="transcript__meta">
              <div>
                <dt>Elapsed</dt>
                <dd>
                  {lastRun.durationMs}
                  <span className="transcript__unit">ms</span>
                </dd>
              </div>
              <div>
                <dt>Request</dt>
                <dd className="type-mono transcript__rid" title={lastRun.requestId}>
                  {lastRun.requestId}
                </dd>
              </div>
              {lastRun.mode && (
                <div>
                  <dt>Mode</dt>
                  <dd className="type-mono">{lastRun.mode}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="transcript__placeholder-meta">No run yet</p>
          )}
        </header>
        {error && (
          <div className="transcript__error" role="alert">
            {error}
          </div>
        )}
        <article className="transcript__page">
          <pre className="transcript__body">
            {output || '— Run output will be recorded here.'}
          </pre>
        </article>
      </section>
    </div>
  );
}
