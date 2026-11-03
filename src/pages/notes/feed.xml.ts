import type { APIContext } from "astro";
import { MICROBLOG_RSS_FEED } from "../../lib/microblog-notes.ts";

export const prerender = false;
export function GET(context: APIContext) {
  context.cache.set(false);
  return new Response(null, {
    status: 302,
    headers: { Location: MICROBLOG_RSS_FEED, "Cache-Control": "no-store" },
  });
}
