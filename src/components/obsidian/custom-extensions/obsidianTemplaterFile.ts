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
        default: "<% tp.file.title() %>",
        parseHTML: (element) => {
          return (
            element.getAttribute("data-code") ||
            element.textContent ||
            "<% tp.file.title() %>"
          );
        },
      },
      // Store the property type for easier rendering
      propertyType: {
        default: "title",
        parseHTML: (element) => {
          return element.getAttribute("data-property-type") || "title";
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
          const code = element.getAttribute("data-code") || element.textContent;

          // Extract the property type from the code
          let propertyType = "title";

          if (code) {
            if (code.includes("tp.file.title")) propertyType = "title";
            else if (code.includes("tp.file.folder")) propertyType = "folder";
            else if (code.includes("tp.file.path")) propertyType = "path";
            else if (code.includes("tp.file.creation_date"))
              propertyType = "creation";
            else if (code.includes("tp.file.last_modified_date"))
              propertyType = "modified";
            else if (code.includes("tp.file.content")) propertyType = "content";
            else if (code.includes("tp.file.size")) propertyType = "size";
          }

          return {
            originalCode: code,
            propertyType,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(
        {
          class: "templater-file",
          "data-code": HTMLAttributes.originalCode,
          "data-property-type": HTMLAttributes.propertyType,
        },
        HTMLAttributes
      ),
      HTMLAttributes.originalCode || "<% tp.file.title() %>",
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
          state.write(node.attrs.originalCode || "<% tp.file.title() %>");
        },
      },
    };
  },
});
