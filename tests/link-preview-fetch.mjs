const fetch = globalThis.fetch;
const previews = new Map([
  [
    "https://priceonomics.com/the-invention-of-the-aeropress/",
    `<html><head>
      <meta property="og:title" content="A source title for the link preview">
      <meta property="og:description" content="The source description provides context before the reader opens the original article.">
      <meta property="og:image" content="https://tylerbutler.com/bg-hq.webp">
      <meta property="og:image:alt" content="A painted sky">
    </head></html>`,
  ],
  [
    "https://blog.codinghorror.com/nobody-hates-software-more-than-software-developers/",
    "<html><head><title>A source without an image</title></head></html>",
  ],
  [
    "https://engineer.readthedocs.org/",
    `<html><head>
      <meta property="og:title" content="Engineer documentation">
      <meta property="og:description" content="Read the Engineer installation and publishing guide.">
      <meta property="og:image" content="https://tylerbutler.com/bg-hq.webp">
    </head></html>`,
  ],
  [
    "https://shelf.tylerbutler.com/",
    "<html><head><title>Shelf website</title></head></html>",
  ],
  [
    "https://hexdocs.pm/shelf",
    "<html><head><title>Shelf API documentation</title></head></html>",
  ],
]);

/** @type {typeof globalThis.fetch} */
const previewFetch = async (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (
    url === "https://paulgraham.com/bubble.html" ||
    url === "https://trellis.tylerbutler.com/"
  ) {
    return new Response("Unavailable", { status: 503 });
  }
  const html = previews.get(url);
  return html === undefined
    ? fetch(input, init)
    : new Response(html, { headers: { "content-type": "text/html" } });
};

globalThis.fetch = previewFetch;
