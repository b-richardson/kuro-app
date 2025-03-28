<template>
  <div class="markdown-preview">
    <!-- Main content area -->
    <div
      class="markdown-preview__content"
      :class="{ 'dark-content': isDarkTheme, 'light-content': !isDarkTheme }"
    >
      <!-- Empty state -->
      <div v-if="sections.length === 0" class="markdown-preview__empty">
        <i class="fas fa-file-alt empty-icon"></i>
        <p>Add sections to see your template preview</p>
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
import { computed, ref, watch, inject } from "vue";
import { TemplateModule } from "@/types/TemplateModule";
import { ViewMode } from "@/types/Editor";
import { generateMarkdown } from "@/utils/markdownUtils";
import ObsidianEditor from "@/components/obsidian/ObsidianEditor.vue";

// Define props
const props = defineProps<{
  sections: TemplateModule[];
  viewMode?: ViewMode;
}>();

// Define emits
const emit = defineEmits([
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

// Generate markdown text from sections
const generateMarkdownContent = () => {
  try {
    isGenerating.value = true;
    emit("generation-start");

    // Generate markdown immediately
    markdownText.value = generateMarkdown(props.sections);

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
  () => props.sections,
  () => {
    generateMarkdownContent();
  },
  { deep: true }
);

// Initialize on mount
generateMarkdownContent();
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
  background-color: rgba(255, 255, 255, 0.98);
  color: rgba(51, 65, 85, 0.95);
  border: 1px solid rgba(230, 235, 245, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.dark-content {
  background-color: rgba(26, 27, 38, 0.98);
  color: rgba(192, 202, 245, 0.95);
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
  font-size: 0.875rem;
  line-height: 1.6;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .markdown-preview__content {
    padding: var(--spacing-md);
  }
}
</style>
