import assert from "node:assert/strict";
import { test } from "node:test";
import type { APIContext } from "astro";
import {
  githubTree,
  NOTES_DIR,
  parseNote,
  readNotes,
} from "../src/lib/github-notes.ts";
import {
  hydrateMicroblogNotes,
  MICROBLOG_JSON_FEED,
  MICROBLOG_ORIGIN,
  MICROBLOG_RSS_FEED,
  mergeMicroblogNotes,
  readMicroblogSnapshot,
} from "../src/lib/microblog-notes.ts";
import {
  createMicropub,
  publishCommitMessage,
} from "../src/lib/micropub/config.ts";
import { publish } from "../src/lib/micropub/handler.ts";
import { getNoteCounts } from "../src/lib/note-counts.ts";
import { noteRoute } from "../src/lib/note-route.ts";
import { includeNote } from "../src/lib/note-schema.ts";
import { getNotePhotos, getNoteUrl } from "../src/lib/note-utils.ts";
import { cacheNotes } from "../src/lib/notes-cache.ts";
import { onRequest } from "../src/middleware.ts";
import { GET as jsonFeed } from "../src/pages/notes/feed.json.ts";
import { GET as rssFeed } from "../src/pages/notes/feed.xml.ts";
import { GET as upload } from "../src/pages/uploads/[...path].ts";

const markdown = (body: string, extra = "") =>
  `---\ndate: 2026-11-01T00:30:00Z\n${extra}---\n${body}`;
const fixture = parseNote(
  `${NOTES_DIR}2026-11-01-fixture.md`,
  markdown("Baseline"),
);

const sourcePost = {
  id: `${MICROBLOG_ORIGIN.replace("https:", "http:")}/2026/10/31/source.html`,
  url: `${MICROBLOG_ORIGIN}/2026/10/31/source.html`,
  date_published: fixture.data.date,
  content_html: "<p>Current <em>source</em> &amp; content.</p>",
};

test("Micro.blog edits and deletion override imported snapshots without changing legacy notes or stable URLs", () => {
  for (const originalUrl of [
    sourcePost.url,
    sourcePost.id,
    "/2026/10/31/source.html",
  ]) {
    const imported = parseNote(
      `${NOTES_DIR}2026-11-01-imported.md`,
      markdown(
        "Stale backup",
        `originalUrl: "${originalUrl}"\nslug: retained\ntags: [backup]\ntitle: Stale title\nphoto: ["/uploads/stale.jpg"]\nin-reply-to: ["https://example.com/stale"]\ndraft: true\n`,
      ),
    );
    const hiddenLegacy = parseNote(
      `${NOTES_DIR}2026-11-01-draft.md`,
      markdown("Hidden legacy", "draft: true\n"),
    );
    const storedBody = imported.body;
    const source = { archive: [sourcePost], recent: [sourcePost] };
    const notes = mergeMicroblogNotes(
      [imported, fixture, hiddenLegacy],
      source,
    );
    assert.equal(notes.length, 2);
    const live = notes.find((note) => note.sourceUrl);
    assert.ok(live);
    assert.equal(live.id, imported.id);
    assert.equal(getNoteUrl(live), getNoteUrl(imported));
    assert.equal(live.body, "Current source & content.");
    assert.match(live.html ?? "", /<em>source<\/em>/);
    assert.deepEqual(live.data.tags, ["backup"]);
    assert.equal(live.data.title, undefined);
    assert.ok(!live.data.photos?.length);
    assert.ok(!live.data.replyTo?.length);
    assert.equal(imported.body, storedBody);
    assert.deepEqual(
      mergeMicroblogNotes([imported, fixture, hiddenLegacy], {
        archive: [],
        recent: [],
      }),
      [fixture],
    );
  }
  const unimported = mergeMicroblogNotes([], {
    archive: [sourcePost],
    recent: [sourcePost],
  })[0];
  const imported = parseNote(
    `${NOTES_DIR}2026-11-01-source.md`,
    markdown("Later snapshot", `originalUrl: "${sourcePost.url}"\n`),
  );
  const afterImport = mergeMicroblogNotes([imported], {
    archive: [sourcePost],
    recent: [sourcePost],
  });
  assert.equal(afterImport.length, 1);
  assert.equal(getNoteUrl(afterImport[0]), getNoteUrl(unimported));
});

test("older Micro.blog posts leaving the recent feed hydrate only when selected and never reuse stale URL bodies", async (t) => {
  const older = {
    ...sourcePost,
    url: `${MICROBLOG_ORIGIN}/2026/10/31/older.html`,
    id: "older",
    content_html: undefined,
  };
  const snapshot = { archive: [sourcePost, older], recent: [sourcePost] };
  let body =
    '<p>Older <em>formatted</em> content. <a href="../related.html">Related</a><img src="../photo.jpg" alt="Source alt text" onerror="alert(1)"></p><script>alert(1)</script><a href="javascript:alert(1)">Unsafe</a>';
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (input, options) => {
    calls++;
    assert.equal(String(input), older.url);
    assert.equal(options?.cache, "no-store");
    assert.equal(options?.redirect, "error");
    return new Response(
      `<nav>Exclude navigation</nav><article class="post h-entry"><header>Exclude header</header><section class="post-content e-content">${body}</section></article>`,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  });
  let notes = mergeMicroblogNotes([], snapshot);
  await hydrateMicroblogNotes(
    notes.filter((note) => note.sourceUrl === sourcePost.url),
  );
  assert.equal(calls, 0);
  let old = notes.find((note) => note.sourceUrl === older.url);
  assert.ok(old);
  assert.equal(old.html, undefined);
  await hydrateMicroblogNotes([old]);
  assert.equal(calls, 1);
  assert.match(old.html ?? "", /<em>formatted<\/em>/);
  assert.match(
    old.html ?? "",
    /href="https:\/\/tylerbutler.micro.blog\/2026\/10\/related.html"/,
  );
  assert.match(
    old.html ?? "",
    /src="https:\/\/tylerbutler.micro.blog\/2026\/10\/photo.jpg" alt="Source alt text"/,
  );
  assert.doesNotMatch(old.html ?? "", /<script|onerror|javascript:|Exclude/);
  assert.equal(old.data.postType, "photo");
  body = "<p>Edited after import.</p>";
  notes = mergeMicroblogNotes([], snapshot);
  old = notes.find((note) => note.sourceUrl === older.url);
  assert.ok(old);
  await hydrateMicroblogNotes([old]);
  assert.equal(calls, 2);
  assert.equal(old.body, "Edited after import.");
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response("Missing e-content", {
        headers: { "Content-Type": "text/html" },
      }),
  );
  await assert.rejects(
    hydrateMicroblogNotes(mergeMicroblogNotes([], snapshot)),
    /content unavailable/,
  );
});

test("Micro.blog publication inventory completes pagination and rejects incomplete, untrusted, malformed or inconsistent sources", async (t) => {
  const archiveUrl = `${MICROBLOG_ORIGIN}/archive/index.json`;
  const nextUrl = `${archiveUrl}?page=2`;
  const older = {
    ...sourcePost,
    id: "older",
    url: `${MICROBLOG_ORIGIN}/2026/10/31/older.html`,
    content_html: undefined,
    content_text: "Archive preview",
  };
  const feed = (items, next_url?) => ({
    version: "https://jsonfeed.org/version/1",
    home_page_url: `${MICROBLOG_ORIGIN}/`,
    items,
    next_url,
  });
  let mode = "valid";
  const requests: string[] = [];
  t.mock.method(globalThis, "fetch", async (input) => {
    const url = String(input);
    requests.push(url);
    assert.ok(url.startsWith(MICROBLOG_ORIGIN));
    if (url === MICROBLOG_JSON_FEED) return Response.json(feed([sourcePost]));
    if (url === nextUrl) {
      if (mode === "unavailable")
        return new Response("Unavailable", { status: 503 });
      return Response.json(feed([sourcePost]));
    }
    assert.equal(url, archiveUrl);
    if (mode === "inconsistent") return Response.json(feed([]));
    if (mode === "malformed") return Response.json({ items: [] });
    if (mode === "date")
      return Response.json(feed([{ ...older, date_published: null }]));
    if (mode === "untrusted")
      return Response.json(feed([older], "https://example.com/archive.json"));
    if (mode === "duplicate") return Response.json(feed([sourcePost], nextUrl));
    return Response.json(feed([older], nextUrl));
  });
  const result = await readMicroblogSnapshot();
  assert.equal(result.archive.length, 2);
  assert.equal(result.recent.length, 1);
  assert.ok(requests.includes(nextUrl));
  for (mode of [
    "unavailable",
    "inconsistent",
    "malformed",
    "date",
    "untrusted",
    "duplicate",
  ]) {
    await assert.rejects(readMicroblogSnapshot());
  }
});

test("old notes subscription URLs redirect directly to Micro.blog without generating or caching a second feed", () => {
  for (const [handler, url] of [
    [jsonFeed, MICROBLOG_JSON_FEED],
    [rssFeed, MICROBLOG_RSS_FEED],
  ] as const) {
    const calls: unknown[] = [];
    const response = handler({
      cache: { set: (value) => calls.push(value) },
    } as APIContext);
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), url);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(calls, [false]);
    assert.equal(response.body, null);
  }
});

test("token publishing accepts native clients while other form routes keep Origin protection", async () => {
  for (const [pathname, contentType, origin, expected] of [
    ["/micropub", "multipart/form-data", undefined, 200],
    ["/media/", "application/x-www-form-urlencoded", undefined, 200],
    ["/api/poll", "text/plain", undefined, 403],
    ["/api/poll", undefined, undefined, 403],
    ["/api/poll", "text/plain", "https://tylerbutler.com", 200],
    ["/api/poll", "application/json", undefined, 200],
    ["/micropub-other", "text/plain", undefined, 403],
  ] as const) {
    const url = new URL(pathname, "https://tylerbutler.com");
    const headers = new Headers();
    if (contentType) headers.set("content-type", contentType);
    if (origin) headers.set("origin", origin);
    const context = {
      url,
      request: new Request(url, { method: "POST", headers }),
      isPrerendered: false,
    } as APIContext;
    const response = await onRequest(
      context,
      async () => new Response("Allowed"),
    );
    assert.equal(response.status, expected);
  }
});

test("live inventory reuses baseline and merges immutable changes/removals beyond 1000 files", async (t) => {
  const oldToken = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = "fixture";
  t.after(() => {
    if (oldToken) process.env.GITHUB_TOKEN = oldToken;
    else delete process.env.GITHUB_TOKEN;
  });
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (input) => {
    calls++;
    assert.match(String(input), /git\/blobs\/changed-unique$/);
    return Response.json({
      encoding: "base64",
      content: Buffer.from(markdown("Changed")).toString("base64"),
    });
  });
  const baseline = Array.from({ length: 1002 }, (_, i) => ({
    ...fixture,
    id: `2026-11-01-${i}`,
  }));
  const hashes = Object.fromEntries(
    baseline.map((note) => [`${NOTES_DIR}${note.id}.md`, `sha-${note.id}`]),
  );
  const tree = baseline.slice(1).map((note) => ({
    path: `${NOTES_DIR}${note.id}.md`,
    sha: hashes[`${NOTES_DIR}${note.id}.md`],
    type: "blob",
  }));
  tree.push({
    path: `${NOTES_DIR}nested/2026-11-01-new.md`,
    sha: "changed-unique",
    type: "blob",
  });
  const notes = await readNotes(baseline, hashes, tree);
  assert.equal(notes.length, 1002);
  assert.equal(
    notes.some((note) => note.id === baseline[0].id),
    false,
  );
  assert.match(
    notes.find((note) => note.id.endsWith("-new"))?.body ?? "",
    /Changed/,
  );
  assert.equal(calls, 1);
  await readNotes(baseline, hashes, tree);
  assert.equal(calls, 1);
});

test("truncated GitHub trees use complete subtrees, and source failures do not become empty success", async (t) => {
  const oldToken = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = "fixture";
  t.after(() => {
    if (oldToken) process.env.GITHUB_TOKEN = oldToken;
    else delete process.env.GITHUB_TOKEN;
  });
  t.mock.method(globalThis, "fetch", async (input) => {
    const url = String(input);
    if (url.endsWith("?recursive=1"))
      return Response.json({ sha: "root", truncated: true, tree: [] });
    const sha = url.split("/").pop();
    const tree =
      sha === "root"
        ? [{ path: "src", sha: "src", type: "tree" }]
        : sha === "src"
          ? [{ path: "content", sha: "content", type: "tree" }]
          : sha === "content"
            ? [{ path: "notes", sha: "notes", type: "tree" }]
            : [{ path: "2026-11-01-fixture.md", sha: "file", type: "blob" }];
    return Response.json({ truncated: false, tree });
  });
  assert.deepEqual(
    (await githubTree("main")).map((entry) => entry.path),
    [`${NOTES_DIR}2026-11-01-fixture.md`],
  );
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("", { status: 403 }),
  );
  await assert.rejects(githubTree(), /403/);
});

test("Pacific dates, fresh counts, pagination and publication state remain consistent", () => {
  assert.equal(getNoteUrl(fixture), "/notes/2026/10/31/fixture");
  assert.equal(
    getNoteUrl({ ...fixture, id: "nested/2026-11-01-nested" }),
    "/notes/2026/10/31/nested",
  );
  const notes = Array.from({ length: 21 }, (_, i) => ({
    ...fixture,
    id: `2026-11-01-${i}`,
  }));
  assert.equal(noteRoute("2", notes)?.kind, "stream");
  assert.equal(noteRoute("2026", notes)?.kind, "year");
  assert.equal(noteRoute("2026/10", notes)?.kind, "month");
  assert.equal(noteRoute("999", notes), undefined);
  assert.equal(getNoteCounts(notes).yearCounts.get("2026"), 21);
  assert.equal(getNoteCounts(notes.slice(1)).yearCounts.get("2026"), 20);
  assert.equal(
    includeNote(
      parseNote("draft.md", markdown("Hidden", "post-status: draft\n")).data,
    ),
    false,
  );
  assert.equal(
    includeNote(
      parseNote("deleted.md", markdown("Hidden", "deleted: true\n")).data,
    ),
    false,
  );
  assert.throws(() => parseNote("bad.md", "---\ndate: bad\n---\nbody"));
  assert.equal(
    includeNote(
      parseNote("deleted.md", markdown("Hidden", "deleted:\n  - true\n")).data,
    ),
    false,
  );
  assert.equal(
    includeNote(
      parseNote("restored.md", markdown("Visible", "deleted:\n  - false\n"))
        .data,
    ),
    true,
  );
  assert.equal(
    includeNote(
      parseNote("draft.md", markdown("Hidden", "post-status:\n  - draft\n"))
        .data,
    ),
    false,
  );
  const photo = parseNote(
    "photo.md",
    markdown(
      "Photo",
      'photo:\n  - value: "/uploads/one.png?a=1&b=2"\n    alt: "An image"\n',
    ),
  );
  assert.deepEqual(getNotePhotos(photo, ""), [
    { src: "/uploads/one.png?a=1&b=2", alt: "An image" },
  ]);
  assert.deepEqual(
    getNotePhotos(photo, '<img src="/uploads/one.png?a=1&amp;b=2">'),
    [],
  );
});

test("uploads preserve binary bytes, conditional requests, and uncached failures", async (t) => {
  const oldToken = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = "fixture";
  t.after(() => {
    if (oldToken) process.env.GITHUB_TOKEN = oldToken;
    else delete process.env.GITHUB_TOKEN;
  });
  const bytes = Uint8Array.from([0, 255, 128, 1]);
  let failed = false;
  t.mock.method(globalThis, "fetch", async (input) => {
    if (failed) return new Response(null, { status: 403 });
    return String(input).includes("/trees/")
      ? Response.json({
          tree: [
            { path: "public/uploads/new.png", type: "blob", sha: "photo" },
          ],
          truncated: false,
        })
      : Response.json({
          encoding: "base64",
          content: Buffer.from(bytes).toString("base64"),
        });
  });
  const policy: unknown[] = [];
  const context = {
    params: { path: "new.png" },
    request: new Request("https://tylerbutler.com/uploads/new.png"),
    cache: {
      set(value: unknown) {
        policy.push(value);
      },
    },
  } as unknown as APIContext;
  const response = await upload(context);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
  context.request.headers.set("if-none-match", '"photo"');
  assert.equal((await upload(context)).status, 304);
  context.params.path = "../private";
  assert.equal((await upload(context)).status, 404);
  context.params.path = "new.png";
  failed = true;
  assert.equal((await upload(context)).status, 503);
  assert.equal(policy.at(-1), false);
});

test("public caches expire after 30 seconds; authenticated and draft requests are not cached", (t) => {
  const original = process.env.SHOW_DRAFTS;
  delete process.env.SHOW_DRAFTS;
  t.after(() => {
    if (original === undefined) delete process.env.SHOW_DRAFTS;
    else process.env.SHOW_DRAFTS = original;
  });
  const values: unknown[] = [];
  const context = {
    request: new Request("https://tylerbutler.com/notes/"),
    cache: {
      set(value: unknown) {
        values.push(value);
      },
    },
  } as unknown as APIContext;
  cacheNotes(context);
  assert.deepEqual(values.at(-1), { maxAge: 30, swr: 0, tags: ["notes"] });
  context.request.headers.set("authorization", "Bearer fixture");
  cacheNotes(context);
  assert.equal(values.at(-1), false);
  context.request.headers.delete("authorization");
  process.env.SHOW_DRAFTS = "1";
  cacheNotes(context);
  assert.equal(values.at(-1), false);
});

test("publishing preserves canonical metadata, validates notes, and skips only note/media builds", async (t) => {
  t.mock.method(console, "log", () => {});
  t.mock.method(console, "error", () => {});
  t.mock.method(console, "warn", () => {});
  const oldToken = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = "fixture";
  t.after(() => {
    if (oldToken) process.env.GITHUB_TOKEN = oldToken;
    else delete process.env.GITHUB_TOKEN;
  });
  const writes: { content: string; message: string }[] = [];
  t.mock.method(globalThis, "fetch", async (input, init) => {
    if (String(input).includes("tokens.indieauth.com"))
      return Response.json({
        me: "https://tylerbutler.com/",
        scope: "create update delete undelete media",
        client_id: "https://micro.blog/",
      });
    if (init?.method === "PUT") {
      writes.push(JSON.parse(String(init.body)));
      return Response.json({ commit: { sha: "saved" } });
    }
    return new Response("", { status: 404 });
  });
  const { store } = createMicropub(async () => fixture);
  assert.equal(
    await store.storagePath("src/content/notes/2026/10/31/fixture.md"),
    `${NOTES_DIR}${fixture.id}.md`,
  );
  const request = new Request("https://tylerbutler.com/micropub", {
    method: "POST",
    headers: {
      Authorization: "Bearer fixture",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      h: "entry",
      content: "A note",
      published: "2026-11-01T00:30:00Z",
      "mp-slug": "canonical",
    }),
  });
  let purges = 0;
  const context = {
    request,
    cache: {
      set() {},
      async invalidate() {
        purges++;
        throw new Error("Unavailable");
      },
    },
  } as unknown as APIContext;
  const response = await publish(context);
  assert.equal(response.status, 201);
  assert.equal(
    response.headers.get("location"),
    "https://tylerbutler.com/notes/2026/10/31/canonical/",
  );
  assert.equal(purges, 1);
  assert.match(writes[0].message, /\[skip netlify\]/);
  assert.match(
    Buffer.from(writes[0].content, "base64").toString(),
    /slug: "canonical"/,
  );
  assert.equal(
    publishCommitMessage("src/content/articles/article.md", "add"),
    "add",
  );
  assert.equal(
    publishCommitMessage("public/uploads/photo.png", "upload"),
    "upload [skip netlify]",
  );
  await store.createFile(
    `${NOTES_DIR}2026-11-01-photo.md`,
    markdown(
      "Uploaded",
      "photo: https://tylerbutler.com/public/uploads/photo.png\n",
    ),
  );
  const uploadedNote = Buffer.from(
    writes.at(-1)?.content ?? "",
    "base64",
  ).toString();
  assert.match(uploadedNote, /https:\/\/tylerbutler.com\/uploads\/photo.png/);
  assert.doesNotMatch(uploadedNote, /\/public\/uploads\//);
  const before = writes.length;
  await assert.rejects(
    store.createFile(`${NOTES_DIR}invalid.md`, "---\ndate: bad\n---\nInvalid"),
  );
  assert.equal(writes.length, before);
});
