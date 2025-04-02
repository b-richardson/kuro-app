<template>
  <div class="markdown-preview">
    <!-- Main content area -->
    <div
      class="markdown-preview__content"
      :class="{ 'dark-content': isDarkTheme, 'light-content': !isDarkTheme }"
    >
      <!-- Empty state -->
      <div
        v-if="!modules || modules.length === 0"
        class="markdown-preview__empty"
      >
        <i class="fas fa-file-alt empty-icon"></i>
        <p>Add modules to see your template preview</p>
      </div>

      <!-- Source view (Markdown or Source mode) -->
      <div v-else-if="showSource" class="markdown-preview__source">
        <pre><code>{{ markdownText }}</code></pre>
      </div>

      <!-- Rendered view with Obsidian Editor -->
      <div v-else class="markdown-preview__rendered">
        <ObsidianEditor 
          :content="markdownText" 
          :read-only="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, inject, provide } from "vue";
import { TemplateModule } from "@/types/TemplateModule";
import { ViewMode } from "@/types/Editor";
import { generateMarkdown } from "@/utils/markdownUtils";
import ObsidianEditor from "@/components/obsidian/ObsidianEditor.vue";

// Define props with defaults
const props = withDefaults(
  defineProps<{
    modules?: TemplateModule[];
    viewMode?: ViewMode;
  }>(),
  {
    modules: () => [], // Default to empty array
  }
);

// Define emits
const emit = defineEmits([
  "update:viewMode",
  "generation-start",
  "generation-complete",
]);

// Get theme from parent component (injected)
const isDarkTheme = inject("theme", ref(true));

// Make theme available to child components
provide("theme", isDarkTheme);

// View state variables
const isGenerating = ref(false);
const showSource = computed(() => {
  return props.viewMode === "Markdown" || props.viewMode === "Source";
});

// Generate markdown text from modules
const generateMarkdownContent = () => {
  if (!props.modules) {
    markdownText.value = "";
    return;
  }

  try {
    isGenerating.value = true;
    emit("generation-start");

    // Generate markdown immediately
    markdownText.value = generateMarkdown(props.modules);

    isGenerating.value = false;
    emit("generation-complete");
  } catch (error) {
    console.error("Error generating markdown:", error);
    isGenerating.value = false;
    emit("generation-complete");
    markdownText.value = ""; // Reset on error
  }
};

// Store the markdown text to avoid recalculating it too often
const markdownText = ref("");

// Watch for changes that require regenerating the markdown
watch(
  () => props.modules,
  () => {
    generateMarkdownContent();
  },
  { deep: true }
);

// Initialize on mount
generateMarkdownContent();
</script>

<!-- Obsidian theme is imported in main.ts and doesn't need to be imported here -->

<style scoped>
.markdown-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.markdown-preview__content {
  flex: 1;
  overflow: auto;
}

.markdown-preview__empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.markdown-preview__source {
  padding: 1rem;
  white-space: pre-wrap;
  font-family: "Fira Code", monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

.markdown-preview__rendered {
  height: 100%;
  width: 100%;
  position: relative;
}

.markdown-preview__rendered .obsidian-editor {
  width: 100%;
  height: 100%;
}

/* Theme classes - just container styling, actual content styling is in obsidian-theme.css */
.dark-content {
  /* Dark theme styling */
  background-color: var(--obsidian-background, var(--color-bg));
  color: var(--obsidian-text-normal, var(--color-text));
}

.light-content {
  /* Light theme styling */
  background-color: var(--obsidian-background, #f5f5f5);
  color: var(--obsidian-text-normal, #333333);
}

/* Add margin around editor content in preview */
.markdown-preview .obsidian-editor .ProseMirror {
  padding: 20px 30px;
}

/* Remove all styling that affects ObsidianEditor content */
</style>
