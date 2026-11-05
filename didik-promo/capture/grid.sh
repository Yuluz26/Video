#!/usr/bin/env bash
# grid.sh OUT.jpg COLS TILE_W img1 img2 ... : tiles images into one contact sheet with ffmpeg.
out=$1; cols=$2; w=$3; shift 3
n=$#; rows=$(( (n + cols - 1) / cols ))
args=(); filt=""; i=0
for f in "$@"; do args+=(-i "$f"); filt+="[$i:v]scale=${w}:-2,pad=${w}:ceil(ih/2)*2[s$i];"; i=$((i+1)); done
layout=""; for ((k=0;k<n;k++)); do c=$((k % cols)); r=$((k / cols)); x=$([ $c -eq 0 ] && echo 0 || echo "$(printf 'w0%.0s+' $(seq 1 $c) | sed 's/+$//')"); y=$([ $r -eq 0 ] && echo 0 || echo "$(printf 'h0%.0s+' $(seq 1 $r) | sed 's/+$//')"); layout+="${x}_${y}|"; done
inputs=""; for ((k=0;k<n;k++)); do inputs+="[s$k]"; done
ffmpeg -y -loglevel error "${args[@]}" -filter_complex "${filt}${inputs}xstack=inputs=$n:layout=${layout%|}:fill=white" -frames:v 1 -q:v 3 "$out"
