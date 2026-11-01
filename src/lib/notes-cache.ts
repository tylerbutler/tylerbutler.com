import type { APIContext } from "astro";

export function cacheNotes(
  context: Pick<APIContext, "cache" | "request">,
): void {
  if (
    import.meta.env?.DEV ||
    process.env.SHOW_DRAFTS === "1" ||
    context.request.headers.has("authorization")
  )
    context.cache.set(false);
  else context.cache.set({ maxAge: 30, swr: 0, tags: ["notes"] });
}
