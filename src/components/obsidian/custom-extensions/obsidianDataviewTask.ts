import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import RenderDataviewTask from "./RenderDataviewTask.vue";

export const ObsidianDataviewTask = Node.create({
  name: "obsidianDataviewTask",

  group: "block",
  content: "text*",
  marks: "",
  code: true,
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      language: {
        default: "dataview",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
        getAttrs: (node) => {
          if (
            typeof node === "object" &&
            node !== null &&
            (node as HTMLElement).getAttribute("data-language") === "dataview"
          ) {
            const text = (node as HTMLElement).textContent || "";
            // Check for dataview TASK queries - need to check after removing the ```dataview part
            const lines = text.trim().split("\n");
            if (lines.length > 0 && lines[0].trim().startsWith("TASK")) {
              return { language: "dataview" };
            }
          }
          return false;
        },
      },
      {
        tag: "div.dataview-task-container",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "dataview-task-container" },
      ["pre", { "data-language": "dataview" }, ["code", {}, 0]],
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(RenderDataviewTask);
  },

  // Custom markdown serialization
  addStorage() {
    return {
      markdown: {
        serialize: (state: any, node: any) => {
          state.write("```dataview\n");
          state.text(node.textContent);
          state.write("\n```");
        },
      },
    };
  },
});
