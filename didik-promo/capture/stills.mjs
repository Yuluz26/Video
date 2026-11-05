// Renders chosen frames of a composition to PNG with one bundle, for layout checks and contact sheets.
//   node stills.mjs <compositionId> <outDir> <scale> <frame> [frame...]
import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const [id, outDir, scaleArg, ...frames] = process.argv.slice(2);
const root = path.resolve(import.meta.dirname, '..');
const browserExecutable = process.env.BROWSER_EXECUTABLE ?? null;
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'remotion/index.ts'), publicDir: path.join(root, 'public') });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const f of frames.map(Number)) {
  await renderStill({ serveUrl, composition, frame: f, output: path.join(outDir, `${id}-${String(f).padStart(5, '0')}.png`), scale: Number(scaleArg), browserExecutable });
  process.stdout.write(`${f} `);
}
console.log('done');
