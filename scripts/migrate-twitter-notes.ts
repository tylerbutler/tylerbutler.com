#!/usr/bin/env tsx
/**
 * One-shot: migrate a Twitter archive into src/content/notes/.
 *
 * Filters: skips retweets, replies (anything with in_reply_to_*), and tweets
 * sourced from Micro.blog (already migrated via scripts/migrate-microblog-notes.sh).
 *
 * Usage:
 *   scripts/migrate-twitter-notes.ts dry      # preview without writing files
 *   scripts/migrate-twitter-notes.ts run      # write notes
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ARCHIVE =
  "/Users/tylerbu/Library/Mobile Documents/com~apple~CloudDocs/Downloads/twitter-2026-04-07-ea0f4a309ce2c13403a8697969947e0580a7049cad23f8e2f0d42e2057cc17de";
const TWEETS_FILE = `${ARCHIVE}/data/tweets.js`;
const HANDLE = "tylerbutler";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST = path.resolve(__dirname, "../src/content/notes");

const mode = process.argv[2];
if (mode !== "dry" && mode !== "run") {
  console.error("usage: migrate-twitter-notes.ts {dry|run}");
  process.exit(1);
}

interface TweetUrl {
  url: string;
  expanded_url: string;
  display_url: string;
}
interface TweetMedia {
  url: string;
  expanded_url: string;
}
interface TweetEntities {
  urls?: TweetUrl[];
  media?: TweetMedia[];
}
interface ExtendedEntities {
  media?: TweetMedia[];
}
interface Tweet {
  id_str: string;
  full_text: string;
  created_at: string;
  source?: string;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  entities?: TweetEntities;
  extended_entities?: ExtendedEntities;
}

function loadTweets(): Tweet[] {
  const raw = readFileSync(TWEETS_FILE, "utf8");
  const json = raw.replace(/^window\.YTD\.tweets\.part0\s*=\s*/, "");
  const items = JSON.parse(json) as { tweet: Tweet }[];
  return items.map((i) => i.tweet);
}

function shouldImport(t: Tweet): boolean {
  if (t.full_text.startsWith("RT @")) return false;
  if (t.in_reply_to_status_id_str || t.in_reply_to_user_id_str) return false;
  if (t.source && t.source.includes("micro.blog")) return false;
  return true;
}

function expandUrls(text: string, t: Tweet): string {
  let out = text;
  const urls = t.entities?.urls ?? [];
  for (const u of urls) {
    if (u.url && u.expanded_url) out = out.split(u.url).join(u.expanded_url);
  }
  const media = [
    ...(t.entities?.media ?? []),
    ...(t.extended_entities?.media ?? []),
  ];
  for (const m of media) {
    if (m.url && m.expanded_url) out = out.split(m.url).join(m.expanded_url);
  }
  return out;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function makeSlug(text: string): string {
  const noUrl = text.replace(/https?:\/\/\S+/g, " ");
  const slug = noUrl
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug;
}

function isoParts(twDate: string): { ymd: string; iso: string } {
  const d = new Date(twDate);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return { ymd: `${yyyy}-${mm}-${dd}`, iso: d.toISOString() };
}

function uniqueFilename(base: string, used: Set<string>): string {
  let candidate = `${base}.md`;
  let n = 2;
  while (used.has(candidate) || existsSync(path.join(DEST, candidate))) {
    candidate = `${base}-${n}.md`;
    n++;
  }
  used.add(candidate);
  return candidate;
}

function buildNote(
  t: Tweet,
): { filenameBase: string; iso: string; body: string; url: string } | null {
  const expanded = expandUrls(t.full_text, t);
  const body = decodeHtmlEntities(expanded).trim();
  if (!body) return null;
  const { ymd, iso } = isoParts(t.created_at);
  const slugBase = makeSlug(body) || t.id_str;
  const url = `https://twitter.com/${HANDLE}/status/${t.id_str}`;
  return { filenameBase: `${ymd}-${slugBase}`, iso, body, url };
}

function renderNote(
  filename: string,
  iso: string,
  body: string,
  url: string,
): string {
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  return [
    "---",
    `date: ${iso}`,
    `slug: "${slug}"`,
    `originalUrl: "${url}"`,
    "draft: true",
    "---",
    "",
    body,
    "",
  ].join("\n");
}

const tweets = loadTweets();
const candidates = tweets.filter(shouldImport);
console.log(
  `scanned ${tweets.length} tweets, ${candidates.length} pass filter`,
);

const used = new Set<string>();
let written = 0;
let skippedEmpty = 0;
const previewMax = 3;

for (const t of candidates) {
  const note = buildNote(t);
  if (!note) {
    skippedEmpty++;
    continue;
  }
  const filename = uniqueFilename(note.filenameBase, used);
  const fullPath = path.join(DEST, filename);
  const contents = renderNote(filename, note.iso, note.body, note.url);

  if (mode === "dry") {
    if (written < previewMax) {
      console.log(`\n=== ${filename}`);
      console.log(contents);
    }
    written++;
  } else {
    writeFileSync(fullPath, contents);
    written++;
  }
}

console.log(
  `\n${mode === "dry" ? "would write" : "wrote"} ${written} notes` +
    (skippedEmpty ? ` (skipped ${skippedEmpty} empty)` : ""),
);
