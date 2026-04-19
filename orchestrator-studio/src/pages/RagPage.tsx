import { useCallback, useEffect, useState } from 'react';
import { ApiKeyModal } from '../components/ApiKeyModal.js';
import { Workspace } from '../components/Workspace.js';
import { fetchRagCorpus, removeRagDocument, uploadRagDocument, uploadRagPdf } from '../api/client.js';
import type { RagCorpusChunk, RagUploadedDocument } from '../api/types.js';
import { RAG_AGENT_ID } from '../constants/rag.js';
import { RAG_COLLECTION_STORAGE } from '../constants/storageKeys.js';
import { useAppState } from '../context/AppStateContext.js';
import { useAgentRunner } from '../hooks/useAgentRunner.js';

function getOrCreateCollectionId(): string {
  if (typeof sessionStorage === 'undefined') return '';
  let id = sessionStorage.getItem(RAG_COLLECTION_STORAGE);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(RAG_COLLECTION_STORAGE, id);
  }
  return id;
}

export function RagPage() {
  const { meta, bootstrapError } = useAppState();
  const [collectionId] = useState(() => getOrCreateCollectionId());
  const [corpusLoading, setCorpusLoading] = useState(true);
  const [corpusError, setCorpusError] = useState<string | null>(null);
  const [chunks, setChunks] = useState<RagCorpusChunk[]>([]);
  const [indexKind, setIndexKind] = useState<string>('');
  const [uploadedDocuments, setUploadedDocuments] = useState<RagUploadedDocument[]>([]);
  const [demoChunkCount, setDemoChunkCount] = useState(0);
  const [userChunkCount, setUserChunkCount] = useState(0);

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadText, setUploadText] = useState('');
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

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
  } = useAgentRunner(RAG_AGENT_ID, { ragCollectionId: collectionId });

  const refreshCorpus = useCallback(() => {
    if (!collectionId) return;
    setCorpusLoading(true);
    setCorpusError(null);
    void fetchRagCorpus(collectionId)
      .then((data) => {
        setChunks(data.chunks);
        setIndexKind(data.indexKind);
        setUploadedDocuments(data.uploadedDocuments ?? []);
        setDemoChunkCount(data.demoChunkCount ?? 0);
        setUserChunkCount(data.userChunkCount ?? 0);
        if (data.error) setCorpusError(data.error);
      })
      .catch((e) => {
        setCorpusError(e instanceof Error ? e.message : String(e));
        setChunks([]);
        setUploadedDocuments([]);
      })
      .finally(() => setCorpusLoading(false));
  }, [collectionId]);

  useEffect(() => {
    refreshCorpus();
  }, [refreshCorpus]);

  const onPickFile = (file: File | null) => {
    if (!file) return;
    const isPdf =
      file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (isPdf) {
      setPendingPdf(file);
      setUploadText('');
      setUploadMsg('PDF selected — set a title if you like, then Add to corpus (text is extracted server-side).');
      if (!uploadTitle.trim()) {
        setUploadTitle(file.name.replace(/\.pdf$/i, '') || file.name);
      }
      return;
    }
    setPendingPdf(null);
    const isText =
      /\.(txt|md|markdown|csv)$/i.test(file.name) || file.type.startsWith('text/');
    if (!isText) {
      setUploadMsg('Choose a .txt, .md, or .pdf file.');
      return;
    }
    setUploadMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const t = typeof reader.result === 'string' ? reader.result : '';
      setUploadText(t);
      if (!uploadTitle.trim()) {
        setUploadTitle(file.name.replace(/\.[^.]+$/, '') || file.name);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const onUpload = () => {
    if (!collectionId) return;
    const title = (uploadTitle.trim() || 'Untitled').slice(0, 200);
    setUploadBusy(true);
    setUploadMsg(null);

    if (pendingPdf) {
      void uploadRagPdf({ collectionId, title, file: pendingPdf })
        .then((r) => {
          setUploadMsg(`Indexed ${r.chunkCount} chunk(s) from PDF.`);
          setPendingPdf(null);
          setFileInputKey((k) => k + 1);
          refreshCorpus();
        })
        .catch((e) => setUploadMsg(e instanceof Error ? e.message : String(e)))
        .finally(() => setUploadBusy(false));
      return;
    }

    const text = uploadText.trim();
    if (!text) {
      setUploadMsg('Paste text, load a text file, or pick a PDF.');
      setUploadBusy(false);
      return;
    }
    void uploadRagDocument({ collectionId, title, text })
      .then((r) => {
        setUploadMsg(`Indexed ${r.chunkCount} chunk(s). You can ask questions now.`);
        setUploadText('');
        setFileInputKey((k) => k + 1);
        refreshCorpus();
      })
      .catch((e) => setUploadMsg(e instanceof Error ? e.message : String(e)))
      .finally(() => setUploadBusy(false));
  };

  const onRemoveDoc = (documentId: string) => {
    if (!collectionId) return;
    void removeRagDocument(collectionId, documentId)
      .then(() => {
        setUploadMsg(null);
        refreshCorpus();
      })
      .catch((e) => setUploadMsg(e instanceof Error ? e.message : String(e)));
  };

  const sourcesByFile = chunks.reduce<Record<string, RagCorpusChunk[]>>((acc, c) => {
    const k = c.source;
    if (!acc[k]) acc[k] = [];
    acc[k].push(c);
    return acc;
  }, {});

  return (
    <div className="page page--rag">
      {bootstrapError && (
        <div className="page__banner page__banner--error" role="alert">
          {bootstrapError}
        </div>
      )}

      <header className="page__intro page__intro--rag">
        <h2 className="page__intro-title">Knowledge RAG</h2>
        <p className="page__intro-text">
          Ask questions in natural language. The assistant <strong>retrieves</strong> relevant passages first, then
          answers with a <strong>Sources</strong> list (chunk ids). Full details: <span className="type-mono">docs/RAG.md</span>.
        </p>
      </header>

      <section className="rag-about" aria-labelledby="rag-about-title">
        <h3 id="rag-about-title" className="rag-about__title">
          What you can ask about
        </h3>
        <ul className="rag-about__list">
          <li>
            <strong>Built-in platform guide</strong> — always indexed: what Orchestrator Studio is, the{' '}
            <strong>Home / Console / RAG / Tools</strong> tabs, request flow (UI → API → agent → tools), how RAG and
            uploads work, BYOK vs demo key, and main HTTP routes. Try: &quot;What is the Console tab for?&quot; or
            &quot;How does my upload get into retrieval?&quot;
          </li>
          <li>
            <strong>Sample handbook snippets</strong> — small fictional policy/pricing examples in the same index.
          </li>
          <li>
            <strong>Your documents</strong> — paste text, upload <strong>.txt / .md</strong>, or <strong>PDF</strong>{' '}
            (text extracted on the server; layout-heavy PDFs may be imperfect). Stored per browser tab under a random
            collection id.
          </li>
        </ul>
      </section>

      <div className="rag-layout">
        <aside className="rag-sidebar" aria-labelledby="rag-corpus-heading">
          <h3 id="rag-corpus-heading" className="rag-sidebar__title">
            Your uploads
          </h3>
          <p className="rag-sidebar__muted">
            Text, Markdown, or PDF. Everything is merged with the <strong>built-in platform guide</strong> and sample
            snippets for retrieval.
          </p>
          <div className="rag-upload">
            <label className="rag-upload__label" htmlFor="rag-upload-title">
              Title
            </label>
            <input
              id="rag-upload-title"
              className="rag-upload__input"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Q2 OKRs"
              autoComplete="off"
            />
            <label className="rag-upload__label" htmlFor="rag-upload-body">
              Text
            </label>
            <textarea
              id="rag-upload-body"
              className="rag-upload__textarea"
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="Paste policy notes, specs, or meeting notes…"
              rows={5}
              spellCheck={false}
            />
            <div className="rag-upload__row">
              <label className="rag-upload__file">
                <input
                  key={fileInputKey}
                  type="file"
                  accept=".txt,.md,.markdown,.csv,.pdf,text/plain,text/markdown,application/pdf"
                  className="rag-upload__file-input"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
                <span>Choose file (.txt · .md · .pdf)</span>
              </label>
              <button
                type="button"
                className="rag-upload__btn"
                disabled={uploadBusy || !collectionId}
                onClick={onUpload}
              >
                {uploadBusy ? 'Indexing…' : 'Add to corpus'}
              </button>
            </div>
            {uploadMsg && (
              <p className={uploadMsg.startsWith('Indexed') ? 'rag-upload__ok' : 'rag-upload__err'} role="status">
                {uploadMsg}
              </p>
            )}
          </div>

          {uploadedDocuments.length > 0 && (
            <ul className="rag-doc-list">
              {uploadedDocuments.map((d) => (
                <li key={d.documentId} className="rag-doc-list__item">
                  <div className="rag-doc-list__meta">
                    <span className="type-mono rag-doc-list__title">{d.title}</span>
                    <span className="rag-doc-list__sub">
                      {d.chunkCount} chunks · {new Date(d.uploadedAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="rag-doc-list__rm"
                    onClick={() => onRemoveDoc(d.documentId)}
                    aria-label={`Remove ${d.title}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3 className="rag-sidebar__title rag-sidebar__title--secondary">Indexed corpus</h3>
          {corpusLoading && <p className="rag-sidebar__muted">Loading corpus…</p>}
          {!corpusLoading && corpusError && (
            <p className="rag-sidebar__warn" role="status">
              {corpusError}
            </p>
          )}
          {!corpusLoading && !corpusError && indexKind && (
            <p className="rag-sidebar__badge type-mono">{indexKind}</p>
          )}
          {!corpusLoading && (demoChunkCount > 0 || userChunkCount > 0) && (
            <p className="rag-sidebar__counts">
              Built-in (guide + samples): <strong>{demoChunkCount}</strong> · Your uploads:{' '}
              <strong>{userChunkCount}</strong>
            </p>
          )}

          {!corpusLoading && chunks.length > 0 && (
            <ul className="rag-corpus-files">
              {Object.entries(sourcesByFile).map(([source, list]) => (
                <li key={source} className="rag-corpus-file">
                  <span className="rag-corpus-file__name type-mono">{source}</span>
                  <ul className="rag-corpus-ids">
                    {list.map((ch) => (
                      <li key={ch.id}>
                        <span className="type-mono">{ch.id}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          <details className="rag-concepts">
            <summary className="rag-concepts__summary">RAG pipeline (this demo)</summary>
            <ol className="rag-concepts__list">
              <li>
                <strong>Ingest</strong> — you add text; the server chunks it (~520 chars, overlap) and stores it under
                your tab&apos;s collection id.
              </li>
              <li>
                <strong>Retrieval</strong> — <span className="type-mono">retrieve_context</span> scores{' '}
                <em>demo + your</em> chunks by token overlap.
              </li>
              <li>
                <strong>Answer</strong> — the model cites chunk ids and sources.
              </li>
            </ol>
          </details>
        </aside>

        <div className="rag-main">
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
            memoTitle="Question"
            memoHint="Ask about this product (tabs, flow, RAG), the sample snippets, or your uploads. Retrieval runs first."
            briefPlaceholder="e.g. What is Orchestrator Studio? How do PDF uploads work? What are our PII logging rules?"
            transcriptTitle="Answer & trace"
            submitLabel="Retrieve & answer"
            submitWorkingLabel="Retrieving…"
          />
        </div>
      </div>

      <ApiKeyModal
        open={apiKeyModalOpen}
        onClose={closeApiKeyModal}
        onSubmitKey={submitApiKey}
        initialKey={apiKeyModalSeed}
      />
    </div>
  );
}
