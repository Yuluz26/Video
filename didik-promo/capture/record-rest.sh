#!/usr/bin/env bash
# The takes after the 2D games, one after another. Usage: ./record-rest.sh OUT_DIR
out=${1:?out dir}
ROOM_SETTINGS='{"shuffle":false}' ALI_WRONG_AT=4 node record-game.cjs interaktif 70 "$out" 9 2>&1 | cut -c1-300
TAG=results HOST_END=1 node record-game.cjs lumba 24 "$out" 2>&1 | cut -c1-300
# Legenda on a landscape player screen plus the host (a portrait take blacked out in software rendering)
node record-story.cjs host 330 "$out" 1 1 2>&1 | cut -c1-600
node record-parent.cjs "$out" 2>&1 | cut -c1-600
echo REST_DONE
