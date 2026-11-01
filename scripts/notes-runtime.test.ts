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
import { GET as upload } from "../src/pages/uploads/[...path].ts";

const markdown = (body: string, extra = "") =>
  `---\ndate: 2026-11-01T00:30:00Z\n${extra}---\n${body}`;
const fixture = parseNote(
  `${NOTES_DIR}2026-11-01-fixture.md`,
  markdown("Baseline"),
);

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
