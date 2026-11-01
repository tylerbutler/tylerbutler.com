import type { APIContext } from "astro";
import { publicNotes } from "../../lib/live-notes";
import { getNotePathParts, getNoteUrl } from "../../lib/note-utils";
import { cacheNotes } from "../../lib/notes-cache";
import { noteModified } from "../../lib/render-note";

export const prerender = false;
export async function GET(context: APIContext) {
  try {
    const notes = await publicNotes();
    const origin = (context.site || new URL("https://tylerbutler.com")).origin;
    const archives = new Set(["/notes/"]);
    for (const note of notes) {
      const { year, month } = getNotePathParts(note);
      archives.add(`/notes/${year}/`);
      archives.add(`/notes/${year}/${month}/`);
    }
    for (let page = 2; page <= Math.ceil(notes.length / 20); page++)
      archives.add(`/notes/${page}/`);
    const escapeXml = (value: string) =>
      value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const urls = [...archives].map(
      (path) => `<url><loc>${escapeXml(origin + path)}</loc></url>`,
    );
    urls.push(
      ...notes.map(
        (note) =>
          `<url><loc>${escapeXml(`${origin}${getNoteUrl(note)}/`)}</loc><lastmod>${noteModified(note).toISOString()}</lastmod></url>`,
      ),
    );
    cacheNotes(context);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`,
      { headers: { "Content-Type": "application/xml; charset=utf-8" } },
    );
  } catch {
    context.cache.set(false);
    return new Response("Notes sitemap unavailable.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
