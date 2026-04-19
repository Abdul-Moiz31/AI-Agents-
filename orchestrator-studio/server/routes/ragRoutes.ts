import { Router } from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { z } from 'zod';
import { loadBuiltinChunkPreviews } from '../services/builtinRagCorpus.js';
import {
  flattenUserChunks,
  ingestTextDocument,
  listUserDocuments,
  removeDocument,
} from '../services/ragUserStore.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return (result.text ?? '').replace(/\u0000/g, '').trim();
  } finally {
    await parser.destroy();
  }
}

export type RagCorpusChunkDto = {
  id: string;
  source: string;
  textPreview: string;
};

const uuid = z.string().uuid();

const uploadSchema = z.object({
  collectionId: uuid,
  title: z.string().min(1).max(200),
  text: z.string().min(1).max(500_000),
});

const removeSchema = z.object({
  collectionId: uuid,
  documentId: uuid,
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');
    cb(null, ok);
  },
});

export function ragRoutes(): Router {
  const r = Router();

  r.get(
    '/rag/corpus',
    asyncHandler(async (req, res) => {
      const collectionRaw = typeof req.query.collectionId === 'string' ? req.query.collectionId : undefined;
      const collectionParse = collectionRaw ? uuid.safeParse(collectionRaw) : { success: false as const };

      const demo = loadBuiltinChunkPreviews();
      const userDocs = collectionParse.success ? listUserDocuments(collectionParse.data) : [];
      const userFlat =
        collectionParse.success && userDocs.length > 0
          ? flattenUserChunks(collectionParse.data).map((c) => ({
              id: c.id,
              source: c.source,
              textPreview: c.text.length > 240 ? `${c.text.slice(0, 240)}…` : c.text,
            }))
          : [];

      res.json({
        chunks: [...demo.chunks, ...userFlat],
        demoChunkCount: demo.chunks.length,
        uploadedDocuments: userDocs,
        userChunkCount: userFlat.length,
        indexKind: 'lexical-overlap-demo',
        description:
          'Built-in platform guide + sample snippets + your uploads. Token-overlap retrieval (add embeddings for production).',
        error: demo.error,
      });
    }),
  );

  r.post(
    '/rag/upload-pdf',
    pdfUpload.single('file'),
    asyncHandler(async (req, res) => {
      const collectionId = typeof req.body.collectionId === 'string' ? req.body.collectionId : '';
      const titleRaw = typeof req.body.title === 'string' ? req.body.title : '';
      const cid = uuid.safeParse(collectionId);
      if (!cid.success) {
        res.status(400).json({ error: { collectionId: ['Invalid UUID'] }, requestId: req.requestId });
        return;
      }
      if (!req.file?.buffer?.length) {
        res.status(400).json({ error: 'Expected a PDF file in field "file"', requestId: req.requestId });
        return;
      }
      let text: string;
      try {
        text = await extractPdfText(req.file.buffer);
      } catch (e) {
        res.status(400).json({
          error: e instanceof Error ? e.message : 'Failed to read PDF',
          requestId: req.requestId,
        });
        return;
      }
      if (!text.trim()) {
        res.status(400).json({ error: 'No extractable text in PDF', requestId: req.requestId });
        return;
      }
      const title =
        titleRaw.trim() ||
        req.file.originalname.replace(/\.pdf$/i, '') ||
        'Uploaded PDF';
      try {
        const { documentId, chunkCount } = ingestTextDocument(cid.data, title, text);
        res.json({ ok: true, documentId, chunkCount, requestId: req.requestId });
      } catch (e) {
        res.status(400).json({
          error: e instanceof Error ? e.message : String(e),
          requestId: req.requestId,
        });
      }
    }),
  );

  r.post(
    '/rag/upload',
    asyncHandler(async (req, res) => {
      const parsed = uploadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten().fieldErrors, requestId: req.requestId });
        return;
      }
      try {
        const { documentId, chunkCount } = ingestTextDocument(
          parsed.data.collectionId,
          parsed.data.title,
          parsed.data.text,
        );
        res.json({ ok: true, documentId, chunkCount, requestId: req.requestId });
      } catch (e) {
        res.status(400).json({
          error: e instanceof Error ? e.message : String(e),
          requestId: req.requestId,
        });
      }
    }),
  );

  r.post(
    '/rag/remove-document',
    asyncHandler(async (req, res) => {
      const parsed = removeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten().fieldErrors, requestId: req.requestId });
        return;
      }
      const ok = removeDocument(parsed.data.collectionId, parsed.data.documentId);
      if (!ok) {
        res.status(404).json({ error: 'Document not found', requestId: req.requestId });
        return;
      }
      res.json({ ok: true, requestId: req.requestId });
    }),
  );

  return r;
}
