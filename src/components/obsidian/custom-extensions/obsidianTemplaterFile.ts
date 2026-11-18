// obsidianTemplaterFile.ts
import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import RenderTemplaterFile from "./RenderTemplaterFile.vue";

export const ObsidianTemplaterFile = Node.create({
  name: "obsidianTemplaterFile",

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
        default: "<% tp.file.path() %>",
        parseHTML: (element) => {
          return (
            element.getAttribute("data-code") ||
            element.textContent ||
            "<% tp.file.path() %>"
          );
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span.templater-file",
        getAttrs: (node) => {
          if (typeof node === "string") return {};
          const element = node as HTMLElement;
          const code =
            element.getAttribute("data-code") || element.textContent || "";

          // Skip if this is a date-related property (let the date extension handle it)
          if (
            code.includes("tp.file.creation_date") ||
            code.includes("tp.file.last_modified_date")
          ) {
            return false;
          }

          return { originalCode: code };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(
        { class: "templater-file", "data-code": HTMLAttributes.originalCode },
        HTMLAttributes
      ),
      HTMLAttributes.originalCode || "<% tp.file.path() %>",
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(RenderTemplaterFile as any);
  },

  // Custom markdown serialization to preserve templater syntax
  addStorage() {
    return {
      markdown: {
        serialize: (state: any, node: any) => {
          // Output the original templater code
          state.write(node.attrs.originalCode || "<% tp.file.path() %>");
        },
      },
    };
  },
});
