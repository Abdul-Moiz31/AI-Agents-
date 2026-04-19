# RAG in Orchestrator Studio

This document explains **retrieval-augmented generation (RAG)** as implemented in this repo: the **RAG** tab, **user uploads**, the `knowledge-rag` agent, the `retrieve_context` tool, and how to evolve toward production-grade search.

---

## What you see in the product

| Piece | Purpose |
| ----- | ------- |
| **RAG tab** (`/rag`) | Fixed to the `knowledge-rag` agent: **upload** plain text / `.txt` / `.md`, then **ask** questions. Answers should include a **Sources** section. |
| **Built-in corpus** | `rag-platform-guide.md` content as `rag-platform-guide.json` (product + flow) **plus** sample snippets in `rag-chunks.json` — always merged into retrieval. |
| **Your uploads** | Chunked and stored on the API host under `orchestrator-studio/data/rag-collections/<uuid>.json` (gitignored). Scoped by a **collection id** kept in `sessionStorage` for this browser tab. |
| **Tools tab** | Same **Knowledge RAG** agent from the specialist grid. Uploads apply when you use the RAG tab (collection id + run body); from Tools alone there is **no** collection id unless we extend that page later. |
| **Console** | Orchestrator may delegate to RAG among other skills. |

---

## Concepts we cover

### 1. Chunking

Long text is split into **chunks** (~520 characters with overlap) so retrieval can return focused passages. Each chunk has an **id** and **source** (e.g. `upload:My notes`).

### 2. Session collection id

Each browser tab gets a stable UUID in `sessionStorage` (`orchestrator_rag_collection_id`). The UI sends it as:

- `collectionId` on **upload** and **corpus** fetch.
- `ragCollectionId` on **`POST /api/run`** and **`POST /api/run/demo`** (only affects `knowledge-rag`).

There is no login: anyone who guesses a UUID could read that corpus path on the server—**treat uploads as non-secret demo data** unless you add auth.

### 3. Indexing (demo vs production)

| This repo | Typical production |
| --------- | ------------------ |
| JSON + uploaded chunks on disk | Object storage + DB or vector store |
| **Lexical** token overlap (BM25-ish) | **Dense** embeddings + ANN |
| Single-node filesystem | Replicated index, access control |

### 4. Request-scoped extra chunks

During an agent run, the API loads your uploaded chunks and passes them into **`AsyncLocalStorage`** (`agents-platform` `ragRequestContext`). `retrieve_context` merges **demo + extra** chunks for that request only, then scores and returns top-k.

### 5. Augmented generation

The model must call `retrieve_context` first, ground answers in retrieved text, and add a **`Sources`** section (`knowledge-rag.md`).

---

## How it works end-to-end

```text
Upload (RAG tab)
    → POST /api/rag/upload { collectionId, title, text }
        → chunk on server → save JSON under data/rag-collections/

Ask
    → POST /api/run { agentId: "knowledge-rag", message, ragCollectionId }
        → executeAgentRun loads user chunks
        → runWithAgent wraps run in ragRequestContext { extraChunks }
        → retrieve_context merges demo + extra, scores, top-k
        → LLM answer + Sources
```

---

## HTTP API

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/rag/corpus?collectionId=<uuid>` | Demo + user chunk previews, `uploadedDocuments`, counts. |
| `POST` | `/api/rag/upload` | Body: `{ collectionId, title, text }` — chunk and persist (max 500k chars text, capped chunks per doc). |
| `POST` | `/api/rag/upload-pdf` | `multipart/form-data`: fields `collectionId`, `title`, `file` (PDF, max ~12MB). Text extracted with `pdf-parse` (layout may be lossy). |
| `POST` | `/api/rag/remove-document` | Body: `{ collectionId, documentId }` — remove one uploaded doc. |
| `POST` | `/api/run` | Optional `ragCollectionId` (uuid) for `knowledge-rag`. |
| `POST` | `/api/run/demo` | Same optional field for one demo run with uploads. |

---

## Deploy notes (Render, etc.)

- **Ephemeral disk**: free web services often lose `data/rag-collections/` on restart. Use a disk add-on, external DB, or object store for durable uploads.
- **Multi-instance**: in-memory or local disk is per-machine; use shared storage if you scale horizontally.

---

## Swapping in “real” RAG

1. **Ingest**: richer parsers (PDF, DOCX), cleaning, embeddings.
2. **Store**: vector DB + metadata filters (tenant, ACL).
3. **Replace** `retrieve_context` internals (or add a second tool) to query that store.
4. Keep: retrieve first → answer + **Sources**.

---

## Further reading

- [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/)
- Studio layout: [`../README.md`](../README.md)
