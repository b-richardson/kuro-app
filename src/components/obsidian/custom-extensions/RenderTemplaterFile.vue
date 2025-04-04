<template>
  <node-view-wrapper class="templater-file-wrapper">
    <span
      class="templater-file-result"
      :class="`templater-file-${propertyType}`"
    >
      <span v-if="isLoading" class="loading-indicator">Loading...</span>
      <span v-else-if="error" class="error-message">{{ error }}</span>
      <span v-else>{{ displayValue }}</span>
    </span>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/vue-3";
import dayjs from "dayjs";
import { obsidianApiService } from "@/services/obsidian";
import { debounce } from "lodash-es";

const props = defineProps<NodeViewProps>();

// State
const displayValue = ref("");
const isLoading = ref(false);
const error = ref("");

// Extract property type from node attributes
const propertyType = computed(() => {
  const code = props.node.attrs.originalCode || "";

  if (code.includes("tp.file.title")) return "title";
  if (code.includes("tp.file.folder")) return "folder";
  if (code.includes("tp.file.path")) return "path";
  if (code.includes("tp.file.creation_date")) return "creation";
  if (code.includes("tp.file.last_modified_date")) return "modified";
  if (code.includes("tp.file.content")) {
    if (code.includes("split")) return "wordCount";
    return "charCount";
  }
  if (code.includes("tp.file.size")) return "size";

  return "unknown";
});

// Get file property from Obsidian API
const getFileProperty = async () => {
  const code = props.node.attrs.originalCode;

  // Skip if code is empty
  if (!code) return;

  try {
    isLoading.value = true;
    error.value = "";

    // Get the active file content and metadata
    const activeFile = await obsidianApiService.getActiveFile(true);

    if (typeof activeFile === "string") {
      // If we got a string instead of a JSON object, parse it to extract what we need
      handleString(activeFile, code);
      return;
    }

    // Now we have the note JSON with content, path, and metadata
    const note = activeFile;

    // Different properties based on the template code
    switch (propertyType.value) {
      case "title": {
        const includeExt = code.includes("title(true)");
        const path = note.path;
        const filename = path.split("/").pop() || "";

        if (includeExt) {
          displayValue.value = filename;
        } else {
          // Remove extension
          displayValue.value = filename.replace(/\.[^.]+$/, "");
        }
        break;
      }

      case "folder": {
        const fullPath = code.includes("folder(true)");
        const path = note.path;
        const segments = path.split("/");
        segments.pop(); // Remove filename

        if (fullPath) {
          displayValue.value = segments.join("/");
        } else {
          // Just the direct parent folder
          displayValue.value = segments.pop() || "";
        }
        break;
      }

      case "path": {
        const fullPath = code.includes("path(true)");
        const path = note.path;

        if (fullPath) {
          displayValue.value = path;
        } else {
          // Relative path without vault prefix
          displayValue.value = path;
        }
        break;
      }

      case "creation": {
        const formatMatch = code.match(/creation_date\(["']([^"']+)["']\)/);
        const format = formatMatch ? formatMatch[1] : "YYYY-MM-DD";

        // Convert timestamp to formatted date
        if (note.stat && note.stat.ctime) {
          displayValue.value = dayjs(note.stat.ctime).format(format);
        } else {
          displayValue.value = dayjs().format(format);
        }
        break;
      }

      case "modified": {
        const formatMatch = code.match(
          /last_modified_date\(["']([^"']+)["']\)/
        );
        const format = formatMatch ? formatMatch[1] : "YYYY-MM-DD";

        // Convert timestamp to formatted date
        if (note.stat && note.stat.mtime) {
          displayValue.value = dayjs(note.stat.mtime).format(format);
        } else {
          displayValue.value = dayjs().format(format);
        }
        break;
      }

      case "wordCount": {
        // Count words in content
        const content = note.content || "";
        const wordCount = content
          .split(/\s+/)
          .filter((word) => word.length > 0).length;
        displayValue.value = wordCount.toString();
        break;
      }

      case "charCount": {
        // Count characters in content
        const content = note.content || "";
        displayValue.value = content.length.toString();
        break;
      }

      case "size": {
        const humanReadable = code.includes("size(true)");

        if (note.stat && note.stat.size) {
          if (humanReadable) {
            // Format size as KB, MB, etc.
            displayValue.value = formatFileSize(note.stat.size);
          } else {
            displayValue.value = note.stat.size.toString();
          }
        } else {
          displayValue.value = humanReadable ? "0 KB" : "0";
        }
        break;
      }

      default:
        displayValue.value = "Unsupported property";
    }
  } catch (err) {
    console.error("Error fetching file property:", err);
    error.value = err.message || "Error fetching file property";

    // Fall back to placeholder data on error
    provideFallbackData();
  } finally {
    isLoading.value = false;
  }
};

// Handle string response (fallback if JSON parsing fails)
const handleString = (content: string, code: string) => {
  try {
    // We got the file as a string, do basic processing
    switch (propertyType.value) {
      case "title": {
        // Extract filename from frontmatter or try to guess
        const filenameMatch = content.match(/title:\s*["']?([^"'\r\n]+)["']?/i);
        const filename = filenameMatch ? filenameMatch[1] : "Untitled";
        displayValue.value = filename;
        break;
      }

      case "wordCount": {
        // Count words in content
        const wordCount = content
          .split(/\s+/)
          .filter((word) => word.length > 0).length;
        displayValue.value = wordCount.toString();
        break;
      }

      case "charCount": {
        // Count characters in content
        displayValue.value = content.length.toString();
        break;
      }

      default:
        // For other types, we need the JSON response, so fall back
        provideFallbackData();
    }
  } catch (e) {
    console.error("Error processing string content:", e);
    provideFallbackData();
  }
};

// Format file size in human readable format
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
};

// Provide fallback data when API call fails
const provideFallbackData = () => {
  switch (propertyType.value) {
    case "title":
      displayValue.value = "Untitled";
      break;
    case "folder":
    case "path":
      displayValue.value = "Unknown location";
      break;
    case "creation":
    case "modified":
      displayValue.value = dayjs().format("YYYY-MM-DD");
      break;
    case "wordCount":
      displayValue.value = "0";
      break;
    case "charCount":
      displayValue.value = "0";
      break;
    case "size":
      displayValue.value = "0 KB";
      break;
    default:
      displayValue.value = "Unknown property";
  }
};

// Create debounced version of getFileProperty
const debouncedGetFileProperty = debounce(getFileProperty, 300);

// Initial load
onMounted(() => {
  debouncedGetFileProperty();
});

// Watch for changes to the original code
watch(
  () => props.node.attrs.originalCode,
  () => {
    debouncedGetFileProperty();
  }
);
</script>

<style>
.templater-file-wrapper {
  display: inline;
}

.templater-file-result {
  display: inline;
  color: #60a5fa;
  font-weight: 500;
  background-color: rgba(96, 165, 250, 0.1);
  border-radius: 3px;
  padding: 2px 4px;
  white-space: nowrap;
}

.loading-indicator {
  color: #94a3b8;
  font-style: italic;
  font-size: 0.9em;
}

.error-message {
  color: #ef4444;
  font-size: 0.9em;
}

/* Different styling for different property types */
.templater-file-title {
  color: #60a5fa;
}

.templater-file-folder,
.templater-file-path {
  color: #a78bfa;
  background-color: rgba(167, 139, 250, 0.1);
}

.templater-file-creation,
.templater-file-modified {
  color: #34d399;
  background-color: rgba(52, 211, 153, 0.1);
}

.templater-file-wordCount,
.templater-file-charCount,
.templater-file-size {
  color: #fbbf24;
  background-color: rgba(251, 191, 36, 0.1);
}

/* Hover effect */
.templater-file-result:hover {
  background-color: rgba(96, 165, 250, 0.2);
}

/* Dark mode support */
:global(.dark-theme) .templater-file-title {
  color: #3b82f6;
}

:global(.dark-theme) .templater-file-folder,
:global(.dark-theme) .templater-file-path {
  color: #8b5cf6;
}

:global(.dark-theme) .templater-file-creation,
:global(.dark-theme) .templater-file-modified {
  color: #10b981;
}

:global(.dark-theme) .templater-file-wordCount,
:global(.dark-theme) .templater-file-charCount,
:global(.dark-theme) .templater-file-size {
  color: #f59e0b;
}
</style>
