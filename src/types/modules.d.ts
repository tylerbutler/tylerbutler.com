declare module "remark-mermaid";
declare module "astro-broken-links-checker";
declare module "sanitize-html";
declare module "subset-font" {
  export default function subsetFont(
    font: Buffer | Uint8Array | ArrayBuffer,
    text: string,
    options?: { targetFormat?: string },
  ): Promise<Uint8Array>;
}

declare module "@benjifs/github-store" {
  export default class GitHubStore {
    constructor(options?: { token?: string; user?: string; repo?: string });
    createFile(filename: string, content: string): Promise<unknown>;
  }
}

declare module "@benjifs/micropub" {
  export default class MicropubEndpoint {
    constructor(options?: Record<string, unknown>);
    micropubHandler(request: Request): Promise<Response>;
    mediaHandler(request: Request): Promise<Response>;
  }
}

declare module "hast" {
  export interface Element {
    type: "element";
    tagName: string;
    properties?: Record<string, unknown>;
    children?: unknown[];
  }

  export interface Root {
    type: "root";
    children: unknown[];
  }
}

declare module "https://unpkg.com/web-vitals@5/dist/web-vitals.attribution.js";
