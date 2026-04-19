/** Split plain text into overlapping windows for lexical RAG (demo / uploads). */
export function chunkPlainText(text: string, maxChars: number, overlap: number): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];

  const parts: string[] = [];
  let i = 0;
  while (i < normalized.length) {
    let end = Math.min(i + maxChars, normalized.length);
    let slice = normalized.slice(i, end);

    if (end < normalized.length) {
      const breakCandidates = [
        slice.lastIndexOf('\n\n'),
        slice.lastIndexOf('\n'),
        slice.lastIndexOf('. '),
        slice.lastIndexOf(' '),
      ].filter((n) => n > maxChars * 0.35);
      const cut = Math.max(...breakCandidates, -1);
      if (cut > 0) slice = slice.slice(0, cut + 1);
    }

    const trimmed = slice.trim();
    if (trimmed) parts.push(trimmed);

    const step = Math.max(1, slice.length - overlap);
    i += step;
    if (i >= normalized.length) break;
  }
  return parts;
}
