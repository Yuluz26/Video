#!/usr/bin/env bash
# Re-records everything the aura video uses against the latest DIDIK (13 Nov 2026). Usage: ./record-v2.sh OUT
out=${1:?out}
for m in lompat lumba pancing kebun pasar harta kampung teka keretapi hutan; do
  node record-game.cjs "$m" 32 "$out" 2>&1 | cut -c1-260
done
ROOM_SETTINGS='{"shuffle":false}' node record-game.cjs interaktif 40 "$out" 9 2>&1 | cut -c1-260
ROOM_SETTINGS='{"shuffle":false}' node record-game.cjs interaktif-sejarah 40 "$out" 15 2>&1 | cut -c1-260
ROOM_SETTINGS='{"shuffle":false}' node record-game.cjs interaktif-islam 40 "$out" 18 2>&1 | cut -c1-260
TAG=b node record-game.cjs kampung 36 "$out" 2>&1 | cut -c1-260   # Ali opens the village (Lihat kampung)
TAG=results HOST_END=1 node record-game.cjs lumba 22 "$out" 2>&1 | cut -c1-260
node record-parent.cjs "$out" host_lobby 2>&1 | cut -c1-300
node record-story.cjs host 300 "$out" 1 0 2>&1 | cut -c1-400
echo V2_DONE
