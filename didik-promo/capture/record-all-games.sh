#!/usr/bin/env bash
# Records every 2D game (host + phone) one after another. Usage: ./record-all-games.sh OUT_DIR [modes...]
out=${1:?out dir}; shift
modes=${*:-"lumba lompat harta hutan pasukan kampung teka pancing wau kubu keretapi pasar bintang"}
for m in $modes; do
  case $m in lumba|lompat|teka|wau|pasukan|bintang) s=36;; hutan) s=45;; *) s=30;; esac
  node record-game.cjs "$m" "$s" "$out" 2>&1 | cut -c1-400
done
echo ALL_DONE
