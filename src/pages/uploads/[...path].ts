import type { APIContext } from "astro";
import {
  githubBytes,
  githubTree,
  UPLOADS_DIR,
} from "../../lib/github-notes.ts";
import { cacheNotes } from "../../lib/notes-cache.ts";

export const prerender = false;
const types: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
};
export async function GET(context: APIContext) {
  const path = context.params.path;
  if (
    !path ||
    path.includes("\\") ||
    path.includes("\0") ||
    path.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    return new Response("Invalid upload path.", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
  try {
    const file = (await githubTree()).find(
      (file) => file.type === "blob" && file.path === UPLOADS_DIR + path,
    );
    if (!file)
      return new Response("Upload not found.", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    const etag = `"${file.sha}"`;
    cacheNotes(context);
    if (context.request.headers.get("if-none-match") === etag)
      return new Response(null, { status: 304, headers: { ETag: etag } });
    const type = types[path.split(".").pop()?.toLowerCase() ?? ""];
    return new Response(await githubBytes(file.sha), {
      headers: {
        "Content-Type": type ?? "application/octet-stream",
        ETag: etag,
        "X-Content-Type-Options": "nosniff",
        ...(type ? {} : { "Content-Disposition": "attachment" }),
      },
    });
  } catch {
    context.cache.set(false);
    return new Response("Upload unavailable.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
