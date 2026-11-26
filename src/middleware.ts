import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware((context, next) => {
  const { request, url, isPrerendered } = context;
  // Check isPrerendered before reading headers: header access during prerender logs a warning.
  if (
    isPrerendered ||
    ["GET", "HEAD", "OPTIONS"].includes(request.method) ||
    ["/micropub", "/media"].includes(url.pathname.replace(/\/$/, ""))
  )
    return next();
  const contentType = request.headers.get("content-type")?.toLowerCase();
  const formLike =
    contentType === undefined ||
    [
      "application/x-www-form-urlencoded",
      "multipart/form-data",
      "text/plain",
    ].some((type) => contentType.includes(type));
  if (formLike && request.headers.get("origin") !== url.origin) {
    return new Response("Cross-site form submissions are forbidden.", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }
  return next();
});
