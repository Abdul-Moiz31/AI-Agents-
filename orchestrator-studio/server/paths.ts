import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Directory containing `dist/` after `npm run build` (Vite output). */
export function getStudioDistDir(): string | null {
  const serverDir = dirname(fileURLToPath(import.meta.url));
  const dist = join(serverDir, '..', 'dist');
  if (!existsSync(dist)) return null;
  if (process.env.NODE_ENV === 'production') return dist;
  if (process.env.SERVE_STUDIO_UI === '1') return dist;
  return null;
}
