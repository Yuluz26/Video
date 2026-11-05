# Video

Remotion project for programmatic video, rendered with Node and ffmpeg.

## Requirements

- Node 22+ (`nvm use` reads `.nvmrc`)
- ffmpeg is bundled with Remotion. You don't need a system install.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Opens Remotion Studio for live preview |
| `npm run render` | Renders `Title` to `out/Title.mp4` via the Node API |
| `npm run render -- <id> <output> '<json props>'` | Renders any composition with custom props |
| `npm run ffmpeg -- <args>` | Runs Remotion's bundled ffmpeg |
| `npm run ffprobe -- <args>` | Runs Remotion's bundled ffprobe |
| `npm run lint` | Type-checks the project |

Set `BROWSER_EXECUTABLE=/path/to/chromium` to render with an existing
Chromium instead of the one Remotion downloads.

## Structure

```
src/
  index.ts              registerRoot entry
  Root.tsx              composition registry
  compositions/         one file per composition
scripts/render.mjs      Node render pipeline (bundle → select → renderMedia)
remotion.config.ts      CLI-only settings
```
