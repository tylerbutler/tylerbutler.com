import type { Element, Root } from "hast";
import { describe, expect, it } from "vitest";
import { rehypeCodeFold } from "../rehype-code-fold.ts";

function makeTree(className: string): Root {
  return {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "div",
        properties: { className: [className] },
        children: [
          {
            type: "element",
            tagName: "pre",
            properties: {},
            children: [],
          },
        ],
      } satisfies Element,
    ],
  };
}

describe("rehypeCodeFold", () => {
  it("wraps expressive-code div in fold wrapper with fold panel sibling", () => {
    const tree = makeTree("expressive-code");
    rehypeCodeFold()(tree);

    const wrapper = tree.children[0] as Element;
    expect(wrapper.tagName).toBe("div");
    expect(wrapper.properties.className).toContain("ec-fold-wrapper");
    expect(wrapper.children).toHaveLength(2);

    const codeBlock = wrapper.children[0] as Element;
    expect(codeBlock.properties.className).toContain("expressive-code");

    const foldPanel = wrapper.children[1] as Element;
    expect(foldPanel.tagName).toBe("div");
    expect(foldPanel.properties.className).toContain("ec-fold-panel");
    expect(foldPanel.properties.ariaHidden).toBe("true");
  });

  it("does not wrap non-expressive-code divs", () => {
    const tree = makeTree("something-else");
    rehypeCodeFold()(tree);

    const node = tree.children[0] as Element;
    expect(node.properties.className).not.toContain("ec-fold-wrapper");
  });

  it("preserves expressive-code children inside wrapper", () => {
    const tree = makeTree("expressive-code");
    rehypeCodeFold()(tree);

    const wrapper = tree.children[0] as Element;
    const codeBlock = wrapper.children[0] as Element;
    expect(codeBlock.children).toHaveLength(1);
    expect((codeBlock.children[0] as Element).tagName).toBe("pre");
  });
});
