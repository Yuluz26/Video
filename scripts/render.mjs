// Programmatic render via Node.
// Usage: npm run render -- [compositionId] [output] ['{"title":"..."}']
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const [id = "Title", output = `out/${id}.mp4`, rawProps = "{}"] =
  process.argv.slice(2);
const inputProps = JSON.parse(rawProps);

// Optional: point at an existing Chromium instead of downloading one.
const browserExecutable = process.env.BROWSER_EXECUTABLE ?? null;

const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
});

const composition = await selectComposition({
  serveUrl,
  id,
  inputProps,
  browserExecutable,
});

let lastLogged = -1;
await renderMedia({
  serveUrl,
  composition,
  inputProps,
  codec: "h264",
  outputLocation: output,
  browserExecutable,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 100);
    if (pct % 10 === 0 && pct !== lastLogged) {
      lastLogged = pct;
      console.log(`Rendering ${id}: ${pct}%`);
    }
  },
});

console.log(`Done: ${output}`);
