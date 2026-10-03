import type { CollectionEntry } from "astro:content";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import type { APIContext } from "astro";
import type { createOgImage } from "../src/lib/og-image.ts";

const image = Buffer.from("test PNG");
const article: CollectionEntry<"articles"> = {
  id: "published-article",
  collection: "articles",
  data: {
    title: "Article title",
    subtitle: "Article subtitle",
    date: new Date("2026-10-02"),
    draft: false,
    articleType: "standard",
  },
};
const state = {
  getCollection: async (
    _name: string,
    filter: (entry: CollectionEntry<"articles">) => boolean,
  ) => [article].filter(filter),
  createOgImage: async (_options: Parameters<typeof createOgImage>[0]) => image,
};
const scope = globalThis as typeof globalThis & {
  __ogEndpointTest: typeof state;
};
scope.__ogEndpointTest = state;
const routeUrl = new URL("../src/pages/og/[slug].png.ts", import.meta.url);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      context.parentURL?.startsWith("file:") &&
      fileURLToPath(context.parentURL) === fileURLToPath(routeUrl)
    ) {
      if (specifier === "astro:content" || specifier === "../../lib/og-image") {
        const name =
          specifier === "astro:content" ? "getCollection" : "createOgImage";
        return {
          url: `data:text/javascript,${encodeURIComponent(`export const ${name} = (...args) => globalThis.__ogEndpointTest.${name}(...args);`)}`,
          shortCircuit: true,
        };
      }
      if (specifier === "../../lib/article-utils") {
        return nextResolve(new URL(`${specifier}.ts`, routeUrl).href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});
after(() => {
  hooks.deregister();
  Reflect.deleteProperty(scope, "__ogEndpointTest");
});
const { GET, prerender }: typeof import("../src/pages/og/[slug].png.ts") =
  await import(routeUrl.href);

function request(slug: string) {
  const context: Pick<APIContext, "params"> = { params: { slug } };
  return GET(context as APIContext);
}

test("on-demand route preserves article options and sets durable cache headers", async (t) => {
  assert.equal(prerender, false);
  const render = t.mock.method(state, "createOgImage");
  const response = await request(article.id);
  assert.equal(response.status, 200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), image);
  assert.equal(response.headers.get("Content-Type"), "image/png");
  assert.equal(
    response.headers.get("Cache-Control"),
    "public, max-age=0, must-revalidate",
  );
  assert.equal(
    response.headers.get("Netlify-CDN-Cache-Control"),
    "public, durable, max-age=31536000",
  );
  assert.deepEqual(render.mock.calls[0].arguments, [
    {
      title: article.data.title,
      subtitle: article.data.subtitle,
      date: article.data.date,
      kind: "ARTICLE",
    },
  ]);
});

test("guide and link kinds retain their precedence", async (t) => {
  const entry = {
    ...article,
    data: { ...article.data, type: "guide" as const },
  };
  t.mock.method(
    state,
    "getCollection",
    async (...[_name, filter]: Parameters<typeof state.getCollection>) =>
      [entry].filter(filter),
  );
  const render = t.mock.method(state, "createOgImage");
  await request(entry.id);
  assert.equal(render.mock.calls[0].arguments[0].kind, "GUIDE");
  entry.data.articleType = "link";
  await request(entry.id);
  assert.equal(render.mock.calls[1].arguments[0].kind, "LINK");
});

test("unknown and draft slugs return uncached 404s without rendering", async (t) => {
  const render = t.mock.method(state, "createOgImage");
  const draft = {
    ...article,
    id: "draft",
    data: { ...article.data, draft: true },
  };
  t.mock.method(
    state,
    "getCollection",
    async (...[_name, filter]: Parameters<typeof state.getCollection>) =>
      [article, draft].filter(filter),
  );
  for (const slug of ["unknown", draft.id, "../published-article"]) {
    const response = await request(slug);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(response.headers.get("Netlify-CDN-Cache-Control"), null);
  }
  assert.equal(render.mock.callCount(), 0);
});

test("render and collection failures are logged and return uncached 500s", async (t) => {
  const failure = new Error("Missing runtime asset");
  const log = t.mock.method(console, "error", () => {});
  t.mock.method(state, "createOgImage", async () => {
    throw failure;
  });
  const response = await request(article.id);
  assert.equal(response.status, 500);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("Netlify-CDN-Cache-Control"), null);
  assert.equal(log.mock.calls[0].arguments[1], failure);
  t.mock.method(state, "getCollection", async () => {
    throw failure;
  });
  assert.equal((await request(article.id)).status, 500);
  assert.equal(log.mock.callCount(), 2);
});
