import type { CollectionEntry } from "astro:content";
import assert from "node:assert/strict";
import { test } from "node:test";
import { getRelatedArticles } from "../src/lib/article-utils.ts";

function article(
  id: string,
  date: string,
  tags?: string[],
  draft = false,
): CollectionEntry<"articles"> {
  return {
    id,
    collection: "articles",
    data: {
      title: id,
      date: new Date(date),
      tags,
      draft,
      articleType: "standard",
    },
  };
}

test("related articles match any tag once and sort newest first", () => {
  const articles = [
    article("older", "2026-07-16", ["trellis"]),
    article("unrelated", "2026-10-01", ["git"]),
    article("newest", "2026-09-01", ["gleam", "trellis"]),
    article("untagged", "2026-09-15"),
    article("second-tag", "2026-08-01", ["gleam"]),
  ];
  const originalOrder = [...articles];

  assert.deepEqual(
    getRelatedArticles(articles, ["trellis", "gleam", "trellis"]).map(
      ({ id }) => id,
    ),
    ["newest", "second-tag", "older"],
  );
  assert.deepEqual(articles, originalOrder);
});

test("missing, empty, or unmatched project tags return no related articles", () => {
  const articles = [article("trellis", "2026-07-16", ["trellis"])];

  assert.deepEqual(getRelatedArticles(articles), []);
  assert.deepEqual(getRelatedArticles(articles, []), []);
  assert.deepEqual(getRelatedArticles(articles, ["unknown"]), []);
  assert.deepEqual(getRelatedArticles(articles, ["Trellis"]), []);
  assert.deepEqual(getRelatedArticles([], ["trellis"]), []);
});

test("related articles respect the draft preview flag", () => {
  const articles = [
    article("published", "2026-07-16", ["trellis"]),
    article("draft", "2026-09-01", ["trellis"], true),
  ];

  assert.deepEqual(
    getRelatedArticles(articles, ["trellis"]).map(({ id }) => id),
    process.env.SHOW_DRAFTS === "1" ? ["draft", "published"] : ["published"],
  );
});
