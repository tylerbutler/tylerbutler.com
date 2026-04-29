// Quill (and some other Micropub clients) send the access token in both the
// `Authorization: Bearer …` header and as an `access_token` field in the
// request body. RFC 6750 §2 forbids that, and `@benjifs/micropub` rejects it
// with HTTP 400. We pre-process the request to drop the body token when a
// Bearer header is present so spec-strict server behavior does not break
// real-world clients.

const hasBearer = (/** @type {Request} */ req) => {
  const auth = req.headers.get("authorization");
  return !!auth && auth.toLowerCase().startsWith("bearer ");
};

const stripJson = async (/** @type {Request} */ req) => {
  const data = await req.json();
  if (data && typeof data === "object" && "access_token" in data) {
    delete data.access_token;
  }
  const headers = new Headers(req.headers);
  headers.delete("content-length");
  headers.set("content-type", "application/json");
  return new Request(req.url, {
    method: req.method,
    headers,
    body: JSON.stringify(data ?? {}),
  });
};

const stripUrlEncoded = async (/** @type {Request} */ req) => {
  const form = await req.formData();
  form.delete("access_token");
  const params = new URLSearchParams();
  for (const [key, value] of form.entries()) {
    params.append(key, typeof value === "string" ? value : "");
  }
  const headers = new Headers(req.headers);
  headers.delete("content-length");
  headers.set("content-type", "application/x-www-form-urlencoded");
  return new Request(req.url, {
    method: req.method,
    headers,
    body: params.toString(),
  });
};

const stripMultipart = async (/** @type {Request} */ req) => {
  const form = await req.formData();
  form.delete("access_token");
  // Drop content-type/length so the new Request derives a fresh boundary.
  const headers = new Headers(req.headers);
  headers.delete("content-type");
  headers.delete("content-length");
  return new Request(req.url, {
    method: req.method,
    headers,
    body: form,
  });
};

export const sanitizeRequest = async (/** @type {Request} */ req) => {
  if (req.method === "GET" || req.method === "HEAD") return req;
  if (!hasBearer(req)) return req;

  const ct = (req.headers.get("content-type") || "").toLowerCase();

  if (ct.startsWith("application/json")) return stripJson(req);
  if (ct.startsWith("application/x-www-form-urlencoded"))
    return stripUrlEncoded(req);
  if (ct.startsWith("multipart/form-data")) return stripMultipart(req);

  return req;
};
