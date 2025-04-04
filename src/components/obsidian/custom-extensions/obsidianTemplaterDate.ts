import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import RenderTemplaterDate from "./RenderTemplaterDate.vue";

export const ObsidianTemplaterDate = Node.create({
  name: "obsidianTemplaterDate",

  group: "inline",
  inline: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      // Store the original templater code
      originalCode: {
        default: "<% tp.date.now() %>",
        parseHTML: (element) => {
          return (
            element.getAttribute("data-code") ||
            element.textContent ||
            "<% tp.date.now() %>"
          );
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span.templater-date",
        getAttrs: (node) => {
          if (typeof node === "string") return {};
          const element = node as HTMLElement;
          const code = element.getAttribute("data-code") || element.textContent;
          return { originalCode: code };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(
        { class: "templater-date", "data-code": HTMLAttributes.originalCode },
        HTMLAttributes
      ),
      HTMLAttributes.originalCode || "<% tp.date.now() %>",
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(RenderTemplaterDate as any);
  },

  // Custom markdown serialization to preserve templater syntax
  addStorage() {
    return {
      markdown: {
        serialize: (state: any, node: any) => {
          // Output the original templater code
          state.write(node.attrs.originalCode || "<% tp.date.now() %>");
        },
      },
    };
  },
});
