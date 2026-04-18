import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
/** Package root (`agents-platform/`), whether running from `src` or `dist`. */
const packageRoot = join(here, '..', '..');

export function loadPrompt(filename: string): string {
  return readFileSync(join(packageRoot, 'src', 'data', 'prompts', filename), 'utf-8');
}
