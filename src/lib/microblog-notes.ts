import { z } from "astro/zod";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import sanitizeHtml from "sanitize-html";
import { unified } from "unified";
import { includeNote, type Note, noteSchema } from "./note-schema.ts";
import { noteSlug } from "./note-utils.ts";

export const MICROBLOG_ORIGIN = "https://tylerbutler.micro.blog";
export const MICROBLOG_JSON_FEED = `${MICROBLOG_ORIGIN}/feed.json`;
export const MICROBLOG_RSS_FEED = `${MICROBLOG_ORIGIN}/feed.xml`;
const ARCHIVE_URL = `${MICROBLOG_ORIGIN}/archive/index.json`;

const itemSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  date_published: z.string().datetime({ offset: true }).pipe(z.coerce.date()),
  date_modified: z
    .string()
    .datetime({ offset: true })
    .pipe(z.coerce.date())
    .optional(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  content_html: z.string().optional(),
  content_text: z.string().optional(),
});
const feedSchema = z.object({
  version: z.enum([
    "https://jsonfeed.org/version/1",
    "https://jsonfeed.org/version/1.1",
  ]),
  home_page_url: z.string().url(),
  items: z.array(itemSchema),
  next_url: z.string().url().optional(),
});
type SourceItem = z.output<typeof itemSchema>;
export interface MicroblogSnapshot {
  archive: SourceItem[];
  recent: SourceItem[];
}

const htmlProcessor = unified().use(rehypeRaw).use(rehypeStringify);
type HtmlRoot = Parameters<typeof htmlProcessor.stringify>[0];
type HtmlNode = HtmlRoot | HtmlRoot["children"][number];

export function microblogIdentity(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, MICROBLOG_ORIGIN);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    url.protocol = "https:";
    if (url.origin !== MICROBLOG_ORIGIN || url.username || url.password)
      return undefined;
    url.hash = "";
    url.search = "";
    return url.href.replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

function sourceUrl(value: string): string {
  const url = microblogIdentity(value);
  if (!url) throw new Error("Invalid Micro.blog source URL");
  return url;
}

async function fetchSource(url: string, accept: string): Promise<Response> {
  if (!microblogIdentity(url))
    throw new Error("Untrusted Micro.blog source URL");
  const requestUrl = new URL(url, MICROBLOG_ORIGIN);
  requestUrl.protocol = "https:";
  const response = await fetch(requestUrl, {
    headers: { Accept: accept },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok || (response.url && !microblogIdentity(response.url)))
    throw new Error("Micro.blog source unavailable");
  const contentType = response.headers.get("content-type") ?? "";
  if (
    accept === "text/html"
      ? !contentType.includes("text/html")
      : !/application\/(feed\+)?json\b/.test(contentType)
  )
    throw new Error("Invalid Micro.blog response type");
  return response;
}

async function readFeed(url: string) {
  const response = await fetchSource(url, "application/json");
  const feed = feedSchema.parse(await response.json());
  if (!microblogIdentity(feed.home_page_url))
    throw new Error("Invalid Micro.blog feed origin");
  const identities = new Set<string>();
  const ids = new Set<string>();
  for (const item of feed.items) {
    const identity = sourceUrl(item.url);
    if (identities.has(identity) || ids.has(item.id))
      throw new Error("Duplicate Micro.blog feed entry");
    identities.add(identity);
    ids.add(item.id);
  }
  return feed;
}

export async function readMicroblogSnapshot(): Promise<MicroblogSnapshot> {
  const archive = async () => {
    const items: SourceItem[] = [];
    const seen = new Set<string>();
    let url: string | undefined = ARCHIVE_URL;
    while (url) {
      if (seen.has(url) || seen.size >= 100)
        throw new Error("Invalid Micro.blog archive pagination");
      seen.add(url);
      const page = await readFeed(url);
      items.push(...page.items);
      url = page.next_url;
    }
    return items;
  };
  const [items, recent] = await Promise.all([
    archive(),
    readFeed(MICROBLOG_JSON_FEED),
  ]);
  const inventory = new Set<string>();
  const ids = new Set<string>();
  for (const item of items) {
    const identity = sourceUrl(item.url);
    if (inventory.has(identity) || ids.has(item.id))
      throw new Error("Duplicate Micro.blog archive entry");
    inventory.add(identity);
    ids.add(item.id);
  }
  if (
    recent.items.some(
      (item) =>
        !inventory.has(sourceUrl(item.url)) ||
        (item.content_html === undefined && item.content_text === undefined),
    )
  )
    throw new Error("Micro.blog sources are incomplete or inconsistent");
  return { archive: items, recent: recent.items };
}

function htmlTree(html: string): HtmlRoot {
  return htmlProcessor.runSync({
    type: "root",
    children: [{ type: "raw", value: html }],
  });
}

function hasClass(node: HtmlNode, name: string): boolean {
  const classes =
    node.type === "element" ? node.properties.className : undefined;
  return Array.isArray(classes) && classes.includes(name);
}

function findNode(
  node: HtmlNode,
  predicate: (node: HtmlNode) => boolean,
): HtmlNode | undefined {
  if (predicate(node)) return node;
  for (const child of "children" in node ? node.children : []) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
}

function textOf(node: HtmlNode): string {
  return node.type === "text"
    ? (node.value ?? "")
    : ("children" in node ? node.children : []).map(textOf).join(" ");
}

export function sanitizeMicroblogHtml(
  html: string,
  originalUrl: string,
): string {
  const base = sourceUrl(originalUrl);
  const resolve = (attributes: Record<string, string>, keys: string[]) => {
    const result = { ...attributes };
    for (const key of keys) {
      if (result[key]) {
        try {
          result[key] = new URL(result[key], base).href;
        } catch {
          delete result[key];
        }
      }
    }
    return result;
  };
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height", "loading"],
      code: ["class"],
      pre: ["class"],
      "*": ["id"],
    },
    transformTags: {
      a: (tagName: string, attributes: Record<string, string>) => ({
        tagName,
        attribs: resolve(attributes, ["href"]),
      }),
      img: (tagName: string, attributes: Record<string, string>) => ({
        tagName,
        attribs: { ...resolve(attributes, ["src"]), alt: attributes.alt ?? "" },
      }),
    },
  });
}

export function extractMicroblogHtml(
  document: string,
  originalUrl: string,
): string {
  const entry = findNode(htmlTree(document), (node) =>
    hasClass(node, "h-entry"),
  );
  const content =
    entry && findNode(entry, (node) => hasClass(node, "e-content"));
  if (!content || !("children" in content))
    throw new Error("Micro.blog post content unavailable");
  return sanitizeMicroblogHtml(
    htmlProcessor.stringify({
      type: "root",
      children: content.children ?? [],
    }),
    originalUrl,
  );
}

export function mergeMicroblogNotes(
  stored: readonly Note[],
  snapshot: MicroblogSnapshot,
): Note[] {
  const imported = new Map<string, Note>();
  const notes: Note[] = [];
  for (const note of stored) {
    const identity = microblogIdentity(note.data.originalUrl);
    if (identity) imported.set(identity, note);
    else if (includeNote(note.data)) notes.push(note);
  }
  const recent = new Map(
    snapshot.recent.map((item) => [sourceUrl(item.url), item]),
  );
  const seen = new Set<string>();
  for (const item of snapshot.archive) {
    const url = sourceUrl(item.url);
    if (seen.has(url)) throw new Error("Duplicate Micro.blog archive entry");
    seen.add(url);
    const existing = imported.get(url);
    const current = recent.get(url) ?? item;
    const slug = existing
      ? noteSlug(existing)
      : decodeURIComponent(
          new URL(url).pathname
            .split("/")
            .pop()
            ?.replace(/\.html$/, "") ?? "",
        );
    if (!slug || /[\/\\?#]/.test(slug) || [".", ".."].includes(slug))
      throw new Error("Invalid Micro.blog note slug");
    const data = noteSchema.parse({
      date: current.date_published,
      updated: current.date_modified,
      title: current.title?.trim() || undefined,
      slug,
      tags: [
        ...new Set([...(existing?.data.tags ?? []), ...(current.tags ?? [])]),
      ],
      originalUrl: url,
    });
    const html =
      current.content_html === undefined
        ? undefined
        : sanitizeMicroblogHtml(current.content_html, url);
    notes.push({
      id: existing?.id ?? `microblog:${url}`,
      data: { ...data, source: "microblog" },
      body:
        html === undefined
          ? (current.content_text ?? "")
          : textOf(htmlTree(html)).replace(/\s+/g, " ").trim(),
      html,
      sourceUrl: url,
    });
  }
  return notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function hydrateMicroblogNotes(
  notes: readonly Note[],
): Promise<void> {
  for (let start = 0; start < notes.length; start += 8) {
    await Promise.all(
      notes.slice(start, start + 8).map(async (note) => {
        if (!note.sourceUrl) return;
        if (note.html === undefined) {
          const response = await fetchSource(note.sourceUrl, "text/html");
          note.html = extractMicroblogHtml(
            await response.text(),
            note.sourceUrl,
          );
          note.body = textOf(htmlTree(note.html)).replace(/\s+/g, " ").trim();
        }
        if (!note.data.title && /<img\b/.test(note.html))
          note.data.postType = "photo";
      }),
    );
  }
}
