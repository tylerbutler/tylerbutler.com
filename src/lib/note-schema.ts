import { z } from "astro/zod";
import { includeDraft } from "./draft-utils.ts";

const urls = z.union([z.string(), z.array(z.string())]).optional();
const photo = z.union([
  z.string(),
  z.object({ value: z.string(), alt: z.string().optional() }),
]);

export const noteSchema = z
  .object({
    date: z.coerce.date(),
    lastmod: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    slug: z.string().optional(),
    title: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    // Micropub updates can store singleton arrays.
    deleted: z
      .union([z.boolean(), z.tuple([z.boolean()])])
      .transform((value) => (Array.isArray(value) ? value[0] : value))
      .default(false),
    "post-status": z
      .union([z.string(), z.tuple([z.string()])])
      .transform((value) => (Array.isArray(value) ? value[0] : value))
      .optional(),
    summary: z.string().optional(),
    originalUrl: z.string().optional(),
    photo: z.union([photo, z.array(photo)]).optional(),
    "mp-photo-alt": urls,
    "in-reply-to": urls,
    "like-of": urls,
    "repost-of": urls,
    "bookmark-of": urls,
    "mp-syndicate-to": urls,
    syndication: urls,
    location: z.string().optional(),
    rsvp: z.enum(["yes", "no", "maybe", "interested"]).optional(),
    client_id: z.string().optional(),
  })
  .transform((data) => {
    const attachments = toArray(data.photo);
    const alt = toArray(data["mp-photo-alt"]);
    return {
      ...data,
      draft: data.draft || data["post-status"] === "draft",
      deleted: data.deleted || data["post-status"] === "deleted",
      source: data.originalUrl?.startsWith("https://twitter.com/")
        ? ("twitter" as const)
        : data.originalUrl?.startsWith("/")
          ? ("microblog" as const)
          : undefined,
      postType: derivePostType(data),
      photos: attachments?.map((p) => (typeof p === "string" ? p : p.value)),
      photoAlt: attachments?.map((p, i) =>
        typeof p === "string" ? (alt?.[i] ?? "") : (p.alt ?? ""),
      ),
      replyTo: toArray(data["in-reply-to"]),
      likeOf: toArray(data["like-of"]),
      repostOf: toArray(data["repost-of"]),
      bookmarkOf: toArray(data["bookmark-of"]),
      syndicateTo: toArray(data["mp-syndicate-to"]),
      syndicationUrls: toArray(data.syndication),
    };
  });

export type NoteData = z.output<typeof noteSchema>;
export interface Note {
  id: string;
  data: NoteData;
  body?: string;
  html?: string;
  sourceUrl?: string;
}

export function includeNote(data: NoteData): boolean {
  return !data.deleted && includeDraft(data);
}

function toArray<T>(value: T | T[] | undefined): T[] | undefined {
  return value === undefined
    ? undefined
    : Array.isArray(value)
      ? value
      : [value];
}

function derivePostType(data: {
  rsvp?: string;
  "in-reply-to"?: unknown;
  "repost-of"?: unknown;
  "like-of"?: unknown;
  "bookmark-of"?: unknown;
  photo?: unknown;
  title?: string;
}):
  | "rsvp"
  | "reply"
  | "repost"
  | "like"
  | "bookmark"
  | "photo"
  | "article"
  | "note" {
  if (data.rsvp && data["in-reply-to"]) return "rsvp";
  if (data["in-reply-to"]) return "reply";
  if (data["repost-of"]) return "repost";
  if (data["like-of"]) return "like";
  if (data["bookmark-of"]) return "bookmark";
  if (data.photo) return "photo";
  return data.title ? "article" : "note";
}
