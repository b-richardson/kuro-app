<template>
  <div class="markdown-preview">
    <!-- Main content area -->
    <div
      class="markdown-preview__content"
      :class="{ 'dark-content': isDarkTheme, 'light-content': !isDarkTheme }"
    >
      <!-- Loading indicator -->
      <div v-if="isGenerating" class="markdown-preview__loading">
        <div class="spinner"></div>
        <p>Generating preview...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="sections.length === 0" class="markdown-preview__empty">
        <i class="fas fa-file-alt empty-icon"></i>
        <p>Add sections to see your template preview</p>
      </div>

      <!-- Source view (Markdown or Source mode) -->
      <div v-else-if="showSource" class="markdown-preview__source">
        <pre><code v-if="showTemplaterSyntax || showDataviewSyntax || showKanbanSyntax" v-html="highlightSyntax(markdownText)"></code>
        <code v-else>{{ markdownText }}</code></pre>
      </div>

      <!-- Rendered view -->
      <div
        v-else
        class="markdown-preview__rendered"
        v-html="renderedMarkdown"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, inject } from "vue";
import MarkdownIt from "markdown-it";
import { TemplateSection } from "@/types/TemplateSection";
import { ExportProfile, ViewMode } from "@/types/Editor";
import { generateMarkdown } from "@/utils/markdownUtils";

// Define props
const props = defineProps<{
  sections: TemplateSection[];
  exportProfile?: ExportProfile;
  viewMode?: ViewMode;
  templaterSyntax?: boolean;
  dataviewSyntax?: boolean;
  kanbanSyntax?: boolean;
}>();

// Define emits
const emit = defineEmits([
  "update:exportProfile",
  "update:viewMode",
  "generation-start",
  "generation-complete",
]);

// Get theme from parent component (injected)
const isDarkTheme = inject("theme", ref(true));

// View state variables
const isGenerating = ref(false);
const showSource = computed(() => {
  return props.viewMode === "Markdown" || props.viewMode === "Source";
});

// Plugin syntax toggle options computed from props with fallback to defaults
const showTemplaterSyntax = computed(() => props.templaterSyntax ?? false);
const showDataviewSyntax = computed(() => props.dataviewSyntax ?? false);
const showKanbanSyntax = computed(() => props.kanbanSyntax ?? false);

// Initialize markdown-it with proper options
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str: string, lang: string) {
    // Custom syntax highlighting for code blocks could be added here
    return `<pre class="language-${lang}"><code>${str}</code></pre>`;
  },
});

// Use provided export profile or default to full
const exportProfile = computed(() => {
  return props.exportProfile || "full";
});

// Generate markdown text from sections with current export profile
const generateMarkdownContent = () => {
  try {
    isGenerating.value = true;
    emit("generation-start");
    
    // Generate markdown immediately without artificial timeout
    markdownText.value = generateMarkdown(
      props.sections,
      exportProfile.value
    );
    
    isGenerating.value = false;
    emit("generation-complete");
  } catch (error) {
    console.error("Error generating markdown:", error);
    isGenerating.value = false;
    emit("generation-complete");
  }
};

// Store the markdown text to avoid recalculating it too often
const markdownText = ref("");

// Watch for changes that require regenerating the markdown
watch(
  () => [props.sections, exportProfile.value],
  () => {
    generateMarkdownContent();
  },
  { deep: true }
);

// Initialize on mount
generateMarkdownContent();

// Process Templater, Dataview, and Kanban syntax based on toggle states
const processedMarkdownText = computed(() => {
  let processedText = markdownText.value;

  // Process Templater syntax if the toggle is off
  if (!showTemplaterSyntax.value) {
    // Replace Templater script blocks (<%* ... %>)
    processedText = processedText.replace(/<%\*[\s\S]*?%>/g, (match) => {
      return '<span class="templater-script-placeholder">Custom JavaScript</span>';
    });

    // Replace standard Templater fields (<% ... %>)
    processedText = processedText.replace(/<%[\s\S]*?%>/g, (match) => {
      // Try to extract meaningful info from the Templater syntax
      const content = match.slice(2, -2).trim();

      // Handle common Templater functions
      if (content.startsWith("tp.date.now")) {
        return '<span class="templater-field-placeholder">Date</span>';
      } else if (content.startsWith("tp.file.title")) {
        return '<span class="templater-field-placeholder">File Title</span>';
      } else if (content.startsWith("tp.file.creation_date")) {
        return '<span class="templater-field-placeholder">Creation Date</span>';
      } else if (content.startsWith("tp.system.prompt")) {
        return '<span class="templater-field-placeholder">User Input</span>';
      } else if (content.startsWith("tp.file.cursor")) {
        return '<span class="templater-cursor-placeholder">⏐</span>';
      } else if (content.includes("tp.")) {
        // Generic Templater field
        const functionName =
          content.match(/tp\.\w+\.\w+/)?.[0]?.split(".")?.[2] || "field";
        return `<span class="templater-field-placeholder">${functionName}</span>`;
      }

      // Fallback for unrecognized syntax
      return '<span class="templater-field-placeholder">Dynamic Content</span>';
    });
  }

  // Process Dataview syntax if the toggle is off
  if (!showDataviewSyntax.value) {
    // Replace Dataview code blocks with placeholders
    processedText = processedText.replace(
      /```dataview\s*([\s\S]*?)```/g,
      (match, content) => {
        // Determine query type
        let queryType = "LIST";
        let title = "Dynamic List";
        let icon = "fas fa-list";

        if (content.trim().startsWith("TABLE")) {
          queryType = "TABLE";
          title = "Data Table";
          icon = "fas fa-table";
        } else if (content.trim().startsWith("TASK")) {
          queryType = "TASK";
          title = "Task List";
          icon = "fas fa-tasks";
        } else if (content.trim().startsWith("CALENDAR")) {
          queryType = "CALENDAR";
          title = "Calendar View";
          icon = "fas fa-calendar-alt";
        }

        // Extract source if possible
        let source = "";
        const fromMatch = content.match(/FROM\s+([^WHERE\s]+)/i);
        if (fromMatch && fromMatch[1]) {
          source = fromMatch[1].trim();
          if (source.startsWith('"') && source.endsWith('"')) {
            source = source.slice(1, -1);
          }
          if (source) {
            source = ` from ${source}`;
          }
        }

        return `<div class="dataview-query-placeholder dataview-query-${queryType.toLowerCase()}">
          <div class="dataview-query-placeholder__header">
            <i class="${icon}"></i> ${title}${source}
          </div>
          <div class="dataview-query-placeholder__content">
            <p>This would display a ${queryType.toLowerCase()} of data when opened in Obsidian with the Dataview plugin.</p>
          </div>
        </div>`;
      }
    );

    // Replace inline Dataview syntax with placeholders
    processedText = processedText.replace(
      /`\$\{dv\.(table|list|task|calendar)[\s\S]*?\}`/gi,
      (match, type) => {
        const queryType = type.toUpperCase();
        const title =
          queryType === "TABLE"
            ? "Inline Table"
            : queryType === "TASK"
            ? "Inline Tasks"
            : queryType === "CALENDAR"
            ? "Inline Calendar"
            : "Inline List";

        return `<span class="dataview-inline-placeholder">${title}</span>`;
      }
    );
  }

  // Process Kanban syntax if the toggle is off
  if (!showKanbanSyntax.value) {
    // We'll need to detect and replace the kanban board structure
    // This is a complex pattern that spans multiple lines

    // First, identify potential kanban boards by looking for YAML frontmatter with kanban settings
    const lines = processedText.split("\n");
    let kanbanBoardSections = [];
    let inYamlFrontmatter = false;
    let yamlStart = -1;
    let yamlEnd = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Track YAML frontmatter
      if (line === "---") {
        if (!inYamlFrontmatter) {
          yamlStart = i;
          inYamlFrontmatter = true;
        } else {
          yamlEnd = i;
          inYamlFrontmatter = false;

          // Check if this YAML block contains kanban settings
          let isKanbanBoard = false;
          for (let j = yamlStart + 1; j < yamlEnd; j++) {
            if (lines[j].includes("kanban-plugin:")) {
              isKanbanBoard = true;
              break;
            }
          }

          if (isKanbanBoard) {
            // Find where this kanban board ends (next YAML block or end of content)
            let boardEnd = lines.length - 1;
            for (let j = yamlEnd + 1; j < lines.length; j++) {
              if (lines[j].trim() === "---") {
                boardEnd = j - 1;
                break;
              }
            }

            kanbanBoardSections.push({
              start: yamlStart,
              end: boardEnd,
            });
          }
        }
      }
    }

    // Now replace each kanban board with a placeholder
    for (let i = kanbanBoardSections.length - 1; i >= 0; i--) {
      const section = kanbanBoardSections[i];
      const boardContent = lines.slice(section.start, section.end + 1);

      // Count lanes and cards
      let laneCount = 0;
      let cardCount = 0;
      let boardStyle = "basic";

      // Determine board style
      for (let j = 0; j < boardContent.length; j++) {
        const line = boardContent[j].trim();
        if (line.startsWith("kanban-plugin:")) {
          boardStyle = line.includes("basic") ? "basic" : "detailed";
        } else if (line.startsWith("## ")) {
          laneCount++;
        } else if (line.startsWith("- [") && line.includes("]")) {
          cardCount++;
        }
      }

      // Create the placeholder HTML
      const placeholder = `<div class="kanban-board-placeholder kanban-board-${boardStyle}">
        <div class="kanban-board-placeholder__header">
          <i class="fas fa-columns"></i> Kanban Board
        </div>
        <div class="kanban-board-placeholder__content">
          <p>This would display a kanban board with ${laneCount} lanes and ${cardCount} cards when opened in Obsidian with the Kanban plugin.</p>
        </div>
      </div>`;

      // Replace the board in the original text
      lines.splice(section.start, section.end - section.start + 1, placeholder);
    }

    // Join the lines back together
    processedText = lines.join("\n");
  }

  return processedText;
});

// Render markdown to HTML
const renderedMarkdown = computed(() => {
  return md.render(processedMarkdownText.value);
});

/**
 * Highlights Templater, Dataview, and Kanban syntax in the source view for better visibility
 */
const highlightSyntax = (text: string): string => {
  if (!text) return "";

  // Escape HTML to prevent XSS
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Escape the entire text first
  let escapedText = escapeHtml(text);

  // Handle different syntax highlighting based on active toggles
  if (showTemplaterSyntax.value) {
    // Split the text into parts for more controlled highlighting of Templater syntax
    const parts = escapedText.split(
      /(&lt;%\*[\s\S]*?%&gt;|&lt;%[\s\S]*?%&gt;)/g
    );

    // Process each part
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      // Skip empty parts
      if (!part) continue;

      // Check if it's a script block
      if (part.startsWith("&lt;%*")) {
        parts[
          i
        ] = `<span class="templater-syntax templater-script">${part}</span>`;
      }
      // Check if it's a standard field block
      else if (part.startsWith("&lt;%")) {
        parts[
          i
        ] = `<span class="templater-syntax templater-field">${part}</span>`;
      }
      // Otherwise, leave as is
    }

    // Join the parts back together
    escapedText = parts.join("");
  }

  if (showDataviewSyntax.value) {
    // Highlight Dataview code blocks
    escapedText = escapedText.replace(
      /(```dataview[\s\S]*?```)/g,
      '<span class="dataview-syntax dataview-block">$1</span>'
    );

    // Highlight inline Dataview syntax
    escapedText = escapedText.replace(
      /(`\$\{dv\.(table|list|task|calendar)[\s\S]*?\}`)/gi,
      '<span class="dataview-syntax dataview-inline">$1</span>'
    );
  }

  if (showKanbanSyntax.value) {
    // Kanban highlighting requires a different approach since it spans multiple lines
    // and has a more complex structure

    // Split text into lines for processing
    const lines = escapedText.split("\n");
    let inKanbanYaml = false;
    let kanbanYamlStart = -1;

    // First, find and highlight the YAML frontmatter containing kanban settings
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim() === "---") {
        if (!inKanbanYaml) {
          kanbanYamlStart = i;
          inKanbanYaml = true;
        } else {
          // End of YAML block, check if it was a kanban block
          let isKanbanBlock = false;
          for (let j = kanbanYamlStart + 1; j < i; j++) {
            if (lines[j].includes("kanban-plugin:")) {
              isKanbanBlock = true;
              break;
            }
          }

          if (isKanbanBlock) {
            // Highlight the entire YAML block
            for (let j = kanbanYamlStart; j <= i; j++) {
              // Special highlighting for specific kanban settings
              if (lines[j].includes("kanban-plugin:")) {
                lines[
                  j
                ] = `<span class="kanban-syntax kanban-setting-primary">${lines[j]}</span>`;
              } else if (
                lines[j].includes("date-format:") ||
                lines[j].includes("hide-tags-in-title:") ||
                lines[j].includes("lane-width:")
              ) {
                lines[
                  j
                ] = `<span class="kanban-syntax kanban-setting">${lines[j]}</span>`;
              } else {
                lines[
                  j
                ] = `<span class="kanban-syntax kanban-yaml">${lines[j]}</span>`;
              }
            }
          }

          inKanbanYaml = false;
        }
      } else if (inKanbanYaml && line.includes("kanban-plugin:")) {
        // Mark this as confirmed kanban YAML
        lines[
          i
        ] = `<span class="kanban-syntax kanban-setting-primary">${line}</span>`;
      }
    }

    // Now highlight lane headers and card items
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Highlight lane headers
      if (line.trim().startsWith("## ")) {
        lines[i] = `<span class="kanban-syntax kanban-lane">${line}</span>`;
      }
      // Highlight cards
      else if (line.trim().match(/^- \[[x ]\]/i)) {
        // Further highlight checked vs unchecked items
        if (line.includes("- [x]") || line.includes("- [X]")) {
          lines[
            i
          ] = `<span class="kanban-syntax kanban-card kanban-card-checked">${line}</span>`;
        } else {
          lines[i] = `<span class="kanban-syntax kanban-card">${line}</span>`;
        }
      }
    }

    // Join back into a string
    escapedText = lines.join("\n");
  }

  return escapedText;
};
</script>

<style scoped>
.markdown-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* Loading indicator */
.markdown-preview__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  text-align: center;
  gap: var(--spacing-md);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-surface);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty state styling */
.markdown-preview__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
  text-align: center;
  gap: var(--spacing-md);
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.5;
}

.markdown-preview__empty p {
  font-size: 0.925rem;
  margin-top: var(--spacing-sm);
}

/* Main content area */
.markdown-preview__content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

/* Dark/Light mode styling for content */
.light-content {
  background-color: white;
  color: #334155;
  border: 1px solid rgba(230, 235, 245, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.dark-content {
  background-color: #1a1b26;
  color: #c0caf5;
  border: 1px solid rgba(30, 30, 46, 0.3);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* Source view styling */
.markdown-preview__source {
  font-family: "Fira Code", "Courier New", monospace;
  white-space: pre-wrap;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow: auto;
}

.light-content .markdown-preview__source {
  background-color: #f8fafc;
  color: #334155;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.dark-content .markdown-preview__source {
  background-color: #24283b;
  color: #c0caf5;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #32344a;
}

/* Rendered markdown styling */
.markdown-preview__rendered {
  font-size: 0.9375rem;
  line-height: 1.6;
}

/* Light mode styling for rendered markdown */
.light-content .markdown-preview__rendered :deep(h1) {
  font-size: 1.875rem;
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: #1e293b;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 0.5rem;
}

.light-content .markdown-preview__rendered :deep(h2) {
  font-size: 1.5rem;
  margin-top: 1.75rem;
  margin-bottom: 0.875rem;
  color: #1e293b;
}

.light-content .markdown-preview__rendered :deep(h3) {
  font-size: 1.25rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1e293b;
}

.light-content .markdown-preview__rendered :deep(h4) {
  font-size: 1.125rem;
  margin-top: 1.25rem;
  margin-bottom: 0.625rem;
  color: #1e293b;
}

.light-content .markdown-preview__rendered :deep(h5) {
  font-size: 1rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.light-content .markdown-preview__rendered :deep(h6) {
  font-size: 0.875rem;
  margin-top: 0.875rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.light-content .markdown-preview__rendered :deep(p) {
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: #334155;
}

.light-content .markdown-preview__rendered :deep(ul),
.light-content .markdown-preview__rendered :deep(ol) {
  margin-top: 0;
  margin-bottom: 1.25rem;
  padding-left: 1.75rem;
  color: #334155;
}

.light-content .markdown-preview__rendered :deep(li) {
  margin-bottom: 0.5rem;
}

.light-content .markdown-preview__rendered :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.light-content .markdown-preview__rendered :deep(th),
.light-content .markdown-preview__rendered :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  text-align: left;
}

.light-content .markdown-preview__rendered :deep(th) {
  background-color: #f8fafc;
  font-weight: 600;
  color: #334155;
}

.light-content .markdown-preview__rendered :deep(tr:nth-child(even)) {
  background-color: #f8fafc;
}

.light-content .markdown-preview__rendered :deep(code) {
  font-family: "Fira Code", "Courier New", monospace;
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.875em;
  color: #4f46e5;
}

.light-content .markdown-preview__rendered :deep(pre) {
  background-color: #f8fafc;
  padding: 1.25rem;
  border-radius: 8px;
  overflow: auto;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.light-content .markdown-preview__rendered :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: #334155;
}

.light-content .markdown-preview__rendered :deep(blockquote) {
  border-left: 4px solid #e2e8f0;
  padding-left: 1rem;
  margin-left: 0;
  color: #64748b;
}

.light-content .markdown-preview__rendered :deep(hr) {
  border: none;
  border-top: 2px solid #f1f5f9;
  margin: 2rem 0;
}

/* Dark mode styling for rendered markdown */
.dark-content .markdown-preview__rendered :deep(h1) {
  font-size: 1.875rem;
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: #c0caf5;
  border-bottom: 2px solid #24283b;
  padding-bottom: 0.5rem;
}

.dark-content .markdown-preview__rendered :deep(h2) {
  font-size: 1.5rem;
  margin-top: 1.75rem;
  margin-bottom: 0.875rem;
  color: #c0caf5;
}

.dark-content .markdown-preview__rendered :deep(h3) {
  font-size: 1.25rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #c0caf5;
}

.dark-content .markdown-preview__rendered :deep(h4) {
  font-size: 1.125rem;
  margin-top: 1.25rem;
  margin-bottom: 0.625rem;
  color: #c0caf5;
}

.dark-content .markdown-preview__rendered :deep(h5) {
  font-size: 1rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #c0caf5;
}

.dark-content .markdown-preview__rendered :deep(h6) {
  font-size: 0.875rem;
  margin-top: 0.875rem;
  margin-bottom: 0.5rem;
  color: #c0caf5;
}

.dark-content .markdown-preview__rendered :deep(p) {
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: #a9b1d6;
}

.dark-content .markdown-preview__rendered :deep(ul),
.dark-content .markdown-preview__rendered :deep(ol) {
  margin-top: 0;
  margin-bottom: 1.25rem;
  padding-left: 1.75rem;
  color: #a9b1d6;
}

.dark-content .markdown-preview__rendered :deep(li) {
  margin-bottom: 0.5rem;
}

.dark-content .markdown-preview__rendered :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.dark-content .markdown-preview__rendered :deep(th),
.dark-content .markdown-preview__rendered :deep(td) {
  border: 1px solid #32344a;
  padding: 0.75rem;
  text-align: left;
}

.dark-content .markdown-preview__rendered :deep(th) {
  background-color: #24283b;
  font-weight: 600;
  color: #c0caf5;
}

.dark-content .markdown-preview__rendered :deep(tr:nth-child(even)) {
  background-color: #24283b;
}

.dark-content .markdown-preview__rendered :deep(code) {
  font-family: "Fira Code", "Courier New", monospace;
  background-color: #32344a;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.875em;
  color: #7aa2f7;
}

.dark-content .markdown-preview__rendered :deep(pre) {
  background-color: #24283b;
  padding: 1.25rem;
  border-radius: 8px;
  overflow: auto;
  border: 1px solid #32344a;
  margin-bottom: 1.5rem;
}

.dark-content .markdown-preview__rendered :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: #a9b1d6;
}

.dark-content .markdown-preview__rendered :deep(blockquote) {
  border-left: 4px solid #32344a;
  padding-left: 1rem;
  margin-left: 0;
  color: #9aa5ce;
}

.dark-content .markdown-preview__rendered :deep(hr) {
  border: none;
  border-top: 2px solid #24283b;
  margin: 2rem 0;
}

/* Checkbox styling */
.markdown-preview__rendered :deep(input[type="checkbox"]) {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
}

.light-content .markdown-preview__rendered :deep(input[type="checkbox"]) {
  accent-color: #4f46e5;
}

.dark-content .markdown-preview__rendered :deep(input[type="checkbox"]) {
  accent-color: #7aa2f7;
}

/* Templater field placeholders */
.light-content .markdown-preview__rendered :deep(.templater-field-placeholder) {
  display: inline-flex;
  align-items: center;
  background-color: #ecfeff;
  color: #0891b2;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px dashed #a5f3fc;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 500;
  white-space: nowrap;
  margin: 0 0.125rem;
}

.dark-content .markdown-preview__rendered :deep(.templater-field-placeholder) {
  display: inline-flex;
  align-items: center;
  background-color: #164e63;
  color: #22d3ee;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px dashed #06b6d4;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 500;
  white-space: nowrap;
  margin: 0 0.125rem;
}

.markdown-preview__rendered :deep(.templater-field-placeholder)::before {
  content: "⚡";
  margin-right: 0.375rem;
  font-size: 0.75rem;
}

.light-content
  .markdown-preview__rendered
  :deep(.templater-script-placeholder) {
  display: inline-block;
  background-color: #f5f3ff;
  color: #7c3aed;
  font-size: 0.875rem;
  padding: 0.375rem 0.625rem;
  border-radius: 4px;
  border: 1px dashed #c4b5fd;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 500;
  margin: 0.5rem 0;
}

.dark-content .markdown-preview__rendered :deep(.templater-script-placeholder) {
  display: inline-block;
  background-color: #2e1065;
  color: #a78bfa;
  font-size: 0.875rem;
  padding: 0.375rem 0.625rem;
  border-radius: 4px;
  border: 1px dashed #7c3aed;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 500;
  margin: 0.5rem 0;
}

.markdown-preview__rendered :deep(.templater-script-placeholder)::before {
  content: "📝 ";
  margin-right: 0.25rem;
}

.light-content
  .markdown-preview__rendered
  :deep(.templater-cursor-placeholder) {
  display: inline-block;
  background-color: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  font-weight: bold;
  padding: 0 0.25rem;
  animation: cursor-blink 1s infinite;
}

.dark-content .markdown-preview__rendered :deep(.templater-cursor-placeholder) {
  display: inline-block;
  background-color: rgba(122, 162, 247, 0.2);
  color: #7aa2f7;
  font-weight: bold;
  padding: 0 0.25rem;
  animation: cursor-blink 1s infinite;
}

@keyframes cursor-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* Dataview query placeholders - Light mode */
.light-content .markdown-preview__rendered :deep(.dataview-query-placeholder) {
  background-color: #f0fdf4;
  border: 1px dashed #86efac;
  border-radius: 6px;
  margin: 1.5rem 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.light-content
  .markdown-preview__rendered
  :deep(.dataview-query-placeholder__header) {
  background-color: #dcfce7;
  padding: 0.75rem 1rem;
  color: #166534;
  font-weight: 600;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.9375rem;
  border-bottom: 1px dashed #86efac;
}

.light-content
  .markdown-preview__rendered
  :deep(.dataview-query-placeholder__content) {
  padding: 1rem;
  color: #374151;
  font-size: 0.875rem;
}

/* Dataview query placeholders - Dark mode */
.dark-content .markdown-preview__rendered :deep(.dataview-query-placeholder) {
  background-color: #132e1f;
  border: 1px dashed #22c55e;
  border-radius: 6px;
  margin: 1.5rem 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dark-content
  .markdown-preview__rendered
  :deep(.dataview-query-placeholder__header) {
  background-color: #14532d;
  padding: 0.75rem 1rem;
  color: #4ade80;
  font-weight: 600;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.9375rem;
  border-bottom: 1px dashed #22c55e;
}

.dark-content
  .markdown-preview__rendered
  :deep(.dataview-query-placeholder__content) {
  padding: 1rem;
  color: #a9b1d6;
  font-size: 0.875rem;
}

/* Table query variation - Light mode */
.light-content .markdown-preview__rendered :deep(.dataview-query-table) {
  background-color: #f0f9ff;
  border-color: #93c5fd;
}

.light-content
  .markdown-preview__rendered
  :deep(.dataview-query-table .dataview-query-placeholder__header) {
  background-color: #dbeafe;
  color: #1e40af;
  border-color: #93c5fd;
}

/* Table query variation - Dark mode */
.dark-content .markdown-preview__rendered :deep(.dataview-query-table) {
  background-color: #172554;
  border-color: #3b82f6;
}

.dark-content
  .markdown-preview__rendered
  :deep(.dataview-query-table .dataview-query-placeholder__header) {
  background-color: #1e3a8a;
  color: #60a5fa;
  border-color: #3b82f6;
}

/* Kanban board styles - Light mode */
.light-content .markdown-preview__rendered :deep(.kanban-board-placeholder) {
  background-color: #f5f3ff;
  border: 1px dashed #c4b5fd;
  border-radius: 6px;
  margin: 1.5rem 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.light-content
  .markdown-preview__rendered
  :deep(.kanban-board-placeholder__header) {
  background-color: #ede9fe;
  padding: 0.75rem 1rem;
  color: #6d28d9;
  font-weight: 600;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.9375rem;
  border-bottom: 1px dashed #c4b5fd;
}

.light-content
  .markdown-preview__rendered
  :deep(.kanban-board-placeholder__content) {
  padding: 1rem;
  color: #374151;
  font-size: 0.875rem;
}

/* Kanban board styles - Dark mode */
.dark-content .markdown-preview__rendered :deep(.kanban-board-placeholder) {
  background-color: #2e1065;
  border: 1px dashed #8b5cf6;
  border-radius: 6px;
  margin: 1.5rem 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dark-content
  .markdown-preview__rendered
  :deep(.kanban-board-placeholder__header) {
  background-color: #4c1d95;
  padding: 0.75rem 1rem;
  color: #a78bfa;
  font-weight: 600;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.9375rem;
  border-bottom: 1px dashed #8b5cf6;
}

.dark-content
  .markdown-preview__rendered
  :deep(.kanban-board-placeholder__content) {
  padding: 1rem;
  color: #a9b1d6;
  font-size: 0.875rem;
}

/* Syntax highlighting in source view - Light mode */
.light-content .markdown-preview__source pre code :deep(.templater-syntax) {
  color: #4f46e5;
  font-weight: 500;
}

.light-content .markdown-preview__source pre code :deep(.templater-script) {
  color: #7c3aed;
  background-color: rgba(245, 243, 255, 0.5);
  padding: 0 2px;
  border-radius: 2px;
}

.light-content .markdown-preview__source pre code :deep(.templater-field) {
  color: #0891b2;
  background-color: rgba(236, 254, 255, 0.5);
  padding: 0 2px;
  border-radius: 2px;
}

.light-content .markdown-preview__source pre code :deep(.dataview-syntax) {
  color: #15803d;
  font-weight: 500;
}

.light-content .markdown-preview__source pre code :deep(.dataview-block) {
  display: block;
  background-color: rgba(240, 253, 244, 0.5);
  border: 1px solid rgba(134, 239, 172, 0.3);
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0.5rem 0;
}

.light-content .markdown-preview__source pre code :deep(.dataview-inline) {
  background-color: rgba(240, 253, 244, 0.5);
  padding: 0 2px;
  border-radius: 2px;
}

.light-content .markdown-preview__source pre code :deep(.kanban-syntax) {
  color: #8b5cf6;
  font-weight: 500;
}

/* Syntax highlighting in source view - Dark mode */
.dark-content .markdown-preview__source pre code :deep(.templater-syntax) {
  color: #7aa2f7;
  font-weight: 500;
}

.dark-content .markdown-preview__source pre code :deep(.templater-script) {
  color: #bb9af7;
  background-color: rgba(122, 162, 247, 0.1);
  padding: 0 2px;
  border-radius: 2px;
}

.dark-content .markdown-preview__source pre code :deep(.templater-field) {
  color: #7dcfff;
  background-color: rgba(125, 207, 255, 0.1);
  padding: 0 2px;
  border-radius: 2px;
}

.dark-content .markdown-preview__source pre code :deep(.dataview-syntax) {
  color: #9ece6a;
  font-weight: 500;
}

.dark-content .markdown-preview__source pre code :deep(.dataview-block) {
  display: block;
  background-color: rgba(158, 206, 106, 0.1);
  border: 1px solid rgba(158, 206, 106, 0.2);
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0.5rem 0;
}

.dark-content .markdown-preview__source pre code :deep(.dataview-inline) {
  background-color: rgba(158, 206, 106, 0.1);
  padding: 0 2px;
  border-radius: 2px;
}

.dark-content .markdown-preview__source pre code :deep(.kanban-syntax) {
  color: #bb9af7;
  font-weight: 500;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .markdown-preview__content {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .markdown-preview__rendered :deep(h1) {
    font-size: 1.5rem;
  }

  .markdown-preview__rendered :deep(h2) {
    font-size: 1.25rem;
  }

  .markdown-preview__rendered :deep(table) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
