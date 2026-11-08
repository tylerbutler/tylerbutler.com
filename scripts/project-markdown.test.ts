import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

test("disabled Mermaid examples do not consume the remaining project Markdown", () => {
  const source = readFileSync(
    new URL(
      "../src/content/projects/markdown-test-project.md",
      import.meta.url,
    ),
    "utf8",
  ).replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
  const tree = unified().use(remarkParse).use(remarkGfm).parse(source);

  assert.equal(
    tree.children.filter(
      (node) => node.type === "html" && node.value.startsWith("<pre hidden>"),
    ).length,
    3,
  );
  assert.equal(tree.children.filter((node) => node.type === "table").length, 4);
  assert.ok(
    tree.children.some(
      (node) =>
        node.type === "code" &&
        node.lang === "json" &&
        node.value.includes('"server"'),
    ),
  );
  assert.ok(
    !tree.children.some(
      (node) => node.type === "code" && node.lang === "mermaid",
    ),
  );
});
