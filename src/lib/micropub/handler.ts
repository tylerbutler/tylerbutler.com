import type { APIContext } from "astro";
import { getNoteUrl } from "../note-utils.ts";
import { createMicropub } from "./config.ts";
import { sanitizeRequest } from "./sanitize-request.js";

export async function publish(
  context: APIContext,
  media = false,
): Promise<Response> {
  context.cache.set(false);
  if (
    context.request.method === "POST" &&
    (import.meta.env?.DEV ||
      (process.env.CONTEXT && process.env.CONTEXT !== "production"))
  ) {
    return new Response("Publishing is disabled outside production.", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }
  try {
    const { store, endpoint } = createMicropub(async (url: string) => {
      const { currentNotes } = await import("../live-notes.ts");
      return (await currentNotes()).find((note) => getNoteUrl(note) === url);
    });
    const request = await sanitizeRequest(context.request);
    const response = await (media
      ? endpoint.mediaHandler(request)
      : endpoint.micropubHandler(request));
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    if (response.status === 201) {
      const location = headers.get("location");
      if (store.createdNote)
        headers.set(
          "Location",
          `https://tylerbutler.com${getNoteUrl(store.createdNote)}/`,
        );
      else if (location)
        headers.set(
          "Location",
          location.replace("/public/uploads/", "/uploads/"),
        );
    }
    let body = await response.text();
    if (
      media &&
      response.headers.get("content-type")?.includes("application/json")
    ) {
      const json = JSON.parse(body);
      if (Array.isArray(json.items)) {
        for (const item of json.items)
          if (typeof item.url === "string")
            item.url = item.url.replace("/public/uploads/", "/uploads/");
        body = JSON.stringify(json);
      }
    }
    if (response.ok && request.method === "POST") {
      try {
        await context.cache.invalidate({ tags: ["notes"] });
      } catch {
        console.warn(
          "Notes cache purge failed; cached responses expire after 30 seconds.",
        );
      }
    }
    return new Response(body || null, { status: response.status, headers });
  } catch {
    return new Response("Publishing request could not be processed.", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
