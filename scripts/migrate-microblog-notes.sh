#!/usr/bin/env bash
# One-shot: migrate micro.blog export to src/content/notes/.
# Usage:
#   scripts/migrate-microblog-notes.sh dry <path-to-source-file>   # preview one file
#   scripts/migrate-microblog-notes.sh run                         # migrate all
set -euo pipefail

SRC="/Users/tylerbu/Library/Mobile Documents/com~apple~CloudDocs/Downloads/tylerbutler_26748c/content"
DEST="$(cd "$(dirname "$0")/.." && pwd)/src/content/notes"

mode="${1:-}"
single="${2:-}"

normalize_tz() {
  # 2020-06-17T09:10:38-0700 -> 2020-06-17T09:10:38-07:00
  sed -E 's/([+-])([0-9]{2})([0-9]{2})$/\1\2:\3/'
}

extract_field() {
  # $1 = field name, $2 = file. Strips optional surrounding double quotes.
  grep -E "^${1}:" "$2" | head -1 | sed -E "s/^${1}:[[:space:]]*//; s/^\"(.*)\"[[:space:]]*$/\1/"
}

migrate_one() {
  local src="$1"
  local rel="${src#$SRC/}"                     # 2020/06/17/trump-really-doesnt.md
  local year="${rel%%/*}"
  local rest="${rel#*/}"
  local month="${rest%%/*}"
  rest="${rest#*/}"
  local day="${rest%%/*}"
  local filename="${rest#*/}"
  local slug="${filename%.md}"
  local out="$DEST/${year}-${month}-${day}-${slug}.md"

  local date lastmod url title
  date=$(extract_field "date" "$src" | normalize_tz)
  lastmod=$(extract_field "lastmod" "$src" | normalize_tz || true)
  url=$(extract_field "url" "$src" || true)
  title=$(extract_field "title" "$src" || true)

  {
    printf -- "---\n"
    printf "date: %s\n" "$date"
    if [[ -n "$lastmod" && "$lastmod" != "$date" ]]; then
      printf "lastmod: %s\n" "$lastmod"
    fi
    if [[ -n "$title" ]]; then
      # Escape any literal " in the title for the YAML double-quoted string.
      local escaped_title="${title//\"/\\\"}"
      printf "title: \"%s\"\n" "$escaped_title"
    fi
    if [[ -n "$url" ]]; then
      printf "originalUrl: \"%s\"\n" "$url"
    fi
    printf "draft: true\n"
    printf -- "---\n"
    awk 'BEGIN{n=0} /^---$/{n++; next} n>=2{print}' "$src"
  } > "$out.tmp"

  if [[ "$mode" == "dry" ]]; then
    echo "=== source: $src"
    echo "=== dest:   $out"
    cat "$out.tmp"
    rm "$out.tmp"
  else
    mv "$out.tmp" "$out"
  fi
}

if [[ "$mode" == "dry" ]]; then
  if [[ -z "$single" ]]; then
    echo "dry mode requires a source file path as second arg" >&2
    exit 1
  fi
  migrate_one "$single"
  exit 0
fi

if [[ "$mode" != "run" ]]; then
  echo "usage: $0 {dry <file>|run}" >&2
  exit 1
fi

count=0
while IFS= read -r -d '' src; do
  migrate_one "$src"
  count=$((count + 1))
done < <(find "$SRC" -type f -name "*.md" -path '*/[0-9][0-9][0-9][0-9]/[0-9][0-9]/[0-9][0-9]/*' -print0)

echo "migrated $count notes -> $DEST"
