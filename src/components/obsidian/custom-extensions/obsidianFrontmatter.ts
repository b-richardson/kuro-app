import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import { InputRule } from "@tiptap/core";
import RenderFrontmatter from "./RenderFrontmatter.vue";

interface MarkdownSerializerState {
  write: (content: string) => void;
}

interface MarkdownNode {
  attrs: {
    yaml?: string;
    [key: string]: any;
  };
}

export const ObsidianFrontmatter = Node.create({
  name: "obsidianFrontmatter",

  // Allow inline content to be parsed within this node
  group: "block",
  content: "inline*",

  onCreate() {
    console.log("ObsidianFrontmatter extension created");
  },

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^---\n([\s\S]*?)\n---$/m,
        handler: ({
          state,
          range,
          match,
        }: {
          state: any;
          range: { from: number; to: number };
          match: string[];
        }) => {
          const yamlContent = match[1];

          const { tr } = state;
          const start = range.from;
          const end = range.to;

          if (yamlContent) {
            tr.replaceWith(
              start,
              end,
              this.type.create({ yaml: `---\n${yamlContent}---` })
            );

            return tr;
          }

          return null;
        },
      }),
    ];
  },

  addAttributes() {
    return {
      yaml: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-yaml") || "",
      },
    };
  },

  parseHTML() {
    console.log("Attempting to parse frontmatter");
    return [
      {
        tag: "div.obsidian-frontmatter",
        getAttrs: (node) => {
          if (typeof node === "string") return {};
          const element = node as HTMLElement;
          console.log("Found frontmatter element:", element);
          return {
            yaml: element.getAttribute("data-yaml") || "",
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    console.log("Rendering frontmatter HTML:", HTMLAttributes);
    return [
      "div",
      mergeAttributes(
        { class: "obsidian-frontmatter", "data-yaml": HTMLAttributes.yaml },
        HTMLAttributes
      ),
      0,
    ];
  },

  addNodeView() {
    console.log("Adding node view for ObsidianFrontmatter");
    return VueNodeViewRenderer(RenderFrontmatter);
  },

  // Custom markdown serialization
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: MarkdownNode) => {
          const yaml = node.attrs.yaml || "";

          const match = yaml.match(/---\n([\s\S]*?)---/);

          if (match) {
            state.write(`---\n${match[1]}---\n\n`);
          } else {
            state.write(yaml);
          }
        },
      },
    };
  },
});
