import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

export function rehypeCodeFold() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (
        node.tagName !== "div" ||
        !Array.isArray(node.properties?.className) ||
        !node.properties.className.includes("expressive-code") ||
        !parent ||
        index === undefined
      ) {
        return;
      }

      const foldPanel: Element = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["ec-fold-panel"],
          ariaHidden: "true",
        },
        children: [],
      };

      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["ec-fold-wrapper"],
        },
        children: [node, foldPanel],
      };

      parent.children[index] = wrapper;
    });
  };
}
