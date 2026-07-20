import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSmartypants from "remark-smartypants";
import { unified } from "unified";

export const typographyProcessor = unified()
  .use(remarkParse)
  .use(remarkSmartypants)
  .use(remarkRehype)
  .use(rehypeStringify);

export async function formatTitle(title: string): Promise<string> {
  const result = await typographyProcessor.process(title);
  // Strip the wrapping <p> tag remark adds — titles are inline content.
  return result
    .toString()
    .replace(/^<p>/, "")
    .replace(/<\/p>\s*$/, "")
    .trim();
}
