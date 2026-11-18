import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import { Plugin, PluginKey } from "prosemirror-state";
import RenderTemplaterUserInput from "./RenderTemplaterUserInput.vue";

export const ObsidianTemplaterUserInput = Node.create({
  name: "obsidianTemplaterUserInput",

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
        default: "<% await tp.system.prompt('Enter value') %>",
        parseHTML: (element) => {
          return element.getAttribute("data-code") || element.textContent;
        },
      },
      // Store the processed prompt text
      promptText: {
        default: "Enter value",
        parseHTML: (element) => {
          return element.getAttribute("data-prompt") || "Enter value";
        },
      },
      // Store the variable name if used
      variableName: {
        default: "",
        parseHTML: (element) => {
          return element.getAttribute("data-variable") || "";
        },
      },
      // Store the input type
      inputType: {
        default: "text",
        parseHTML: (element) => {
          return element.getAttribute("data-input-type") || "text";
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span.templater-user-input",
        getAttrs: (node) => {
          if (typeof node === "string") return {};
          const element = node as HTMLElement;
          return {
            originalCode:
              element.getAttribute("data-code") || element.textContent,
            promptText: element.getAttribute("data-prompt") || "Enter value",
            variableName: element.getAttribute("data-variable") || "",
            inputType: element.getAttribute("data-input-type") || "text",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { originalCode, promptText, variableName, inputType, ...otherAttrs } =
      HTMLAttributes;

    return [
      "span",
      mergeAttributes(
        {
          class: "templater-user-input",
          "data-code": originalCode,
          "data-prompt": promptText,
          "data-variable": variableName,
          "data-input-type": inputType,
        },
        otherAttrs
      ),
      originalCode,
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(RenderTemplaterUserInput as any);
  },

  // Add a plugin to detect and replace Templater user input syntax
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("templaterUserInputDetector"),
        appendTransaction: (transactions, oldState, newState) => {
          // Skip if no changes
          if (!transactions.some((tr) => tr.docChanged)) return null;

          const { tr } = newState;
          let modified = false;

          // Find text nodes containing Templater user input syntax
          newState.doc.descendants((node, pos) => {
            if (!node.isText) return true;

            const text = node.text || "";

            // Match different patterns for user input
            const patterns = [
              // Variable assignment with prompt
              /<%(.*?)tp\.user\.(\w+)\s*=\s*await\s*tp\.system\.prompt\(["']([^"']+)["'](.*?)%>/g,
              // Simple prompt without variable
              /<%(.*?)await\s*tp\.system\.prompt\(["']([^"']+)["'](.*?)%>/g,
              // Suggester (dropdown)
              /<%(.*?)(?:tp\.user\.(\w+)\s*=\s*)?await\s*tp\.system\.suggester\((.*?)%>/g,
              // Toggle (radio buttons)
              /<%(.*?)(?:tp\.user\.(\w+)\s*=\s*)?await\s*tp\.system\.toggle\((.*?)%>/g,
            ];

            for (const patternRegex of patterns) {
              let match;

              while ((match = patternRegex.exec(text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                const codeText = match[0];

                // Determine input type
                let inputType = "text";
                if (codeText.includes("tp.system.suggester")) {
                  inputType = "select-dropdown";
                } else if (codeText.includes("tp.system.toggle")) {
                  inputType = "select-radio";
                } else if (codeText.includes("multi: true")) {
                  inputType = "multiline";
                }

                // Extract prompt text
                let promptText = "Enter value";
                let variableName = "";

                // Parse variable name and prompt text based on the pattern
                if (codeText.includes("tp.user.")) {
                  // Extract variable name from assignment
                  const varMatch = codeText.match(/tp\.user\.(\w+)\s*=/);
                  if (varMatch) variableName = varMatch[1];
                }

                // Extract prompt text from each pattern type
                if (codeText.includes("tp.system.prompt")) {
                  const promptMatch = codeText.match(
                    /tp\.system\.prompt\(["']([^"']+)["']/
                  );
                  if (promptMatch) promptText = promptMatch[1];
                } else if (
                  codeText.includes("tp.system.suggester") ||
                  codeText.includes("tp.system.toggle")
                ) {
                  // For suggester, the prompt might be the last parameter
                  const promptMatch = codeText.match(
                    /,\s*["']([^"']+)["']\s*\)/
                  );
                  if (promptMatch) promptText = promptMatch[1];
                }

                // Replace with user input node
                tr.replaceWith(
                  start,
                  end,
                  newState.schema.nodes.obsidianTemplaterUserInput.create({
                    originalCode: codeText,
                    promptText: promptText,
                    variableName: variableName,
                    inputType: inputType,
                  })
                );

                modified = true;
              }
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },

  // Custom markdown serialization to preserve templater syntax
  addStorage() {
    return {
      markdown: {
        serialize: (state: any, node: any) => {
          // Output the original templater code
          state.write(node.attrs.originalCode);
        },
      },
    };
  },
});
