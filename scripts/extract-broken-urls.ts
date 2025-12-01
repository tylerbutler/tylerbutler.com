#!/usr/bin/env tsx
/**
 * Extracts broken URLs from a broken.txt file (e.g., from a link checker).
 * Outputs unique URLs as JSON that can be added to src/data/broken-links.json.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const inputFile = process.argv[2] || "broken.txt";
const filePath = resolve(process.cwd(), inputFile);

const content = readFileSync(filePath, "utf-8");
const lines = content.split("\n");

const brokenUrls = new Set<string>();

// Pattern for broken link entries: - (line:col) 'text..' => URL (error reason)
const brokenLinkPattern = /^- \(\d+:\d+\) .+ => (.+?) \(.+\)$/;

// Pattern for robots.txt blocked URLs: - http(s)://...
const robotsBlockedPattern = /^- (https?:\/\/.+)$/;

// Pattern for redirect path entries:     - URL (status)
const redirectPathPattern = /^\s+- (https?:\/\/[^\s]+) \(\d+\)$/;

for (const line of lines) {
  // Skip empty lines and section headers
  if (!line.trim() || line.startsWith("Crawling") || line.startsWith("Stats:")) {
    continue;
  }

  // Check for broken link entries
  let match = line.match(brokenLinkPattern);
  if (match) {
    brokenUrls.add(match[1]);
    continue;
  }

  // Check for robots.txt blocked URLs
  match = line.match(robotsBlockedPattern);
  if (match) {
    brokenUrls.add(match[1]);
    continue;
  }

  // Check for redirect path entries (optional - these are usually duplicates)
  match = line.match(redirectPathPattern);
  if (match) {
    // Skip redirect path entries as they're typically intermediate redirects
    continue;
  }
}

// Output as JSON array
const sortedUrls = Array.from(brokenUrls).sort();
console.log(JSON.stringify(sortedUrls, null, 2));
