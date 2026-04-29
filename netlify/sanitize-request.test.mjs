import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizeRequest } from "./sanitize-request.js";

const URL_MICROPUB = "https://tylerbutler.com/micropub";

test("strips access_token from urlencoded body when Bearer header is present", async () => {
  const body = new URLSearchParams({
    access_token: "abc123",
    h: "entry",
    content: "hello world",
  });
  const req = new Request(URL_MICROPUB, {
    method: "POST",
    headers: {
      authorization: "Bearer abc123",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const out = await sanitizeRequest(req);
  const form = await out.formData();

  assert.equal(form.get("access_token"), null);
  assert.equal(form.get("h"), "entry");
  assert.equal(form.get("content"), "hello world");
  assert.equal(out.headers.get("authorization"), "Bearer abc123");
  assert.equal(out.method, "POST");
  assert.equal(out.url, URL_MICROPUB);
});

test("strips access_token from multipart body when Bearer header is present", async () => {
  const fd = new FormData();
  fd.set("access_token", "abc123");
  fd.set("h", "entry");
  fd.set("content", "hello multipart");

  const req = new Request(URL_MICROPUB, {
    method: "POST",
    headers: { authorization: "Bearer abc123" },
    body: fd,
  });

  const out = await sanitizeRequest(req);
  const form = await out.formData();

  assert.equal(form.get("access_token"), null);
  assert.equal(form.get("h"), "entry");
  assert.equal(form.get("content"), "hello multipart");
});

test("preserves multipart file uploads while stripping access_token", async () => {
  const fd = new FormData();
  fd.set("access_token", "abc123");
  fd.set("h", "entry");
  const file = new File([new Uint8Array([1, 2, 3, 4])], "tiny.bin", {
    type: "application/octet-stream",
  });
  fd.set("file", file);

  const req = new Request("https://tylerbutler.com/media", {
    method: "POST",
    headers: { authorization: "Bearer abc123" },
    body: fd,
  });

  const out = await sanitizeRequest(req);
  const form = await out.formData();

  assert.equal(form.get("access_token"), null);
  assert.equal(form.get("h"), "entry");
  const got = form.get("file");
  assert.ok(got instanceof File, "file entry preserved as File");
  assert.equal(got.name, "tiny.bin");
  const bytes = new Uint8Array(await got.arrayBuffer());
  assert.deepEqual(Array.from(bytes), [1, 2, 3, 4]);
});

test("strips access_token from JSON body when Bearer header is present", async () => {
  const req = new Request(URL_MICROPUB, {
    method: "POST",
    headers: {
      authorization: "Bearer abc123",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      access_token: "abc123",
      type: ["h-entry"],
      properties: { content: ["hi"] },
    }),
  });

  const out = await sanitizeRequest(req);
  const json = await out.json();

  assert.equal(json.access_token, undefined);
  assert.deepEqual(json.type, ["h-entry"]);
  assert.deepEqual(json.properties, { content: ["hi"] });
});

test("returns request unchanged when only Bearer header is present (urlencoded)", async () => {
  const body = new URLSearchParams({ h: "entry", content: "no body token" });
  const req = new Request(URL_MICROPUB, {
    method: "POST",
    headers: {
      authorization: "Bearer abc123",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const out = await sanitizeRequest(req);
  const form = await out.formData();

  assert.equal(form.get("access_token"), null);
  assert.equal(form.get("h"), "entry");
  assert.equal(form.get("content"), "no body token");
});

test("returns request unchanged when access_token is only in body (no Bearer header)", async () => {
  const body = new URLSearchParams({
    access_token: "abc123",
    h: "entry",
    content: "body only",
  });
  const req = new Request(URL_MICROPUB, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const out = await sanitizeRequest(req);
  const form = await out.formData();

  // Body token must be preserved when there is no header — that is the
  // sole authentication mechanism in this case.
  assert.equal(form.get("access_token"), "abc123");
  assert.equal(form.get("h"), "entry");
  assert.equal(form.get("content"), "body only");
});

test("returns GET request unchanged even with Bearer header", async () => {
  const req = new Request(`${URL_MICROPUB}?q=config`, {
    method: "GET",
    headers: { authorization: "Bearer abc123" },
  });

  const out = await sanitizeRequest(req);

  assert.equal(out.method, "GET");
  assert.equal(out.url, `${URL_MICROPUB}?q=config`);
  assert.equal(out.headers.get("authorization"), "Bearer abc123");
});

test("ignores non-Bearer authorization schemes", async () => {
  const body = new URLSearchParams({ access_token: "abc123", h: "entry" });
  const req = new Request(URL_MICROPUB, {
    method: "POST",
    headers: {
      authorization: "Basic dXNlcjpwYXNz",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const out = await sanitizeRequest(req);
  const form = await out.formData();

  assert.equal(form.get("access_token"), "abc123");
});
