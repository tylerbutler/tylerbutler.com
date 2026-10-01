declare module "remark-mermaid";
declare module "astro-broken-links-checker";
declare module "sanitize-html";
declare module "subset-font" {
  interface SubsetOptions {
    targetFormat?: "sfnt" | "woff" | "woff2";
  }

  export default function subsetFont(
    font: Buffer,
    text: string,
    options?: SubsetOptions,
  ): Promise<Buffer>;
}
