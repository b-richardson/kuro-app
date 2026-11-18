import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

// Define a type for callout types
type CalloutType =
  | "note"
  | "abstract"
  | "info"
  | "todo"
  | "tip"
  | "success"
  | "question"
  | "warning"
  | "failure"
  | "danger"
  | "bug"
  | "example"
  | "quote";

// Define the structure of callout info
interface CalloutInfo {
  color: string;
  icon: string;
}

// Regex to match Obsidian callout syntax: > [!TYPE] Content
const CALLOUT_REGEX = /^>\s*\[!([\w-]+)\]\s*(.*)$/gm;

// Callout types and their corresponding colors/icons
const CALLOUT_TYPES: Record<CalloutType, CalloutInfo> = {
  note: { color: "#448aff", icon: "ℹ️" },
  abstract: { color: "#00b0ff", icon: "📝" },
  info: { color: "#00b8d4", icon: "ℹ️" },
  todo: { color: "#00bfa5", icon: "✓" },
  tip: { color: "#00c853", icon: "💡" },
  success: { color: "#14ae5c", icon: "✅" },
  question: { color: "#64dd17", icon: "❓" },
  warning: { color: "#ff9100", icon: "⚠️" },
  failure: { color: "#ff5252", icon: "❌" },
  danger: { color: "#ff1744", icon: "⚡" },
  bug: { color: "#f50057", icon: "🐞" },
  example: { color: "#7c4dff", icon: "📋" },
  quote: { color: "#9e9e9e", icon: "💬" },
};

export const ObsidianCallout = Extension.create({
  name: "obsidianCallout",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("obsidianCallout"),
        props: {
          decorations: (state) => {
            const { doc } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const text = node.text || "";
              let match;

              // Find all callout matches in the text
              while ((match = CALLOUT_REGEX.exec(text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                const calloutType = match[1].toLowerCase() as string;
                const calloutContent = match[2];

                // Use type assertion to handle any callout type
                const typeInfo =
                  (CALLOUT_TYPES as Record<string, CalloutInfo>)[calloutType] ||
                  CALLOUT_TYPES.note;

                // Add decoration for the callout
                decorations.push(
                  Decoration.inline(start, end, {
                    class: `obsidian-callout obsidian-callout-${calloutType}`,
                    style: `
                      display: block;
                      border-left: 4px solid ${typeInfo.color};
                      background-color: rgba(${hexToRgb(typeInfo.color)}, 0.1);
                      padding: 0.5em;
                      margin: 1em 0;
                      border-radius: 0 4px 4px 0;
                    `,
                    "data-callout-type": calloutType,
                    "data-callout-icon": typeInfo.icon,
                  })
                );
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, "");

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}
