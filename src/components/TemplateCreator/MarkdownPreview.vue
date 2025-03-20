<template>
  <div class="markdown-preview">
    <div class="markdown-preview__header">
      <h2 class="markdown-preview__title">Preview</h2>
      <div class="markdown-preview__toggle">
        <button 
          class="markdown-preview__toggle-btn"
          :class="{ 'markdown-preview__toggle-btn--active': !showSource }"
          @click="showSource = false"
        >
          <i class="fas fa-eye"></i> Rendered
        </button>
        <button 
          class="markdown-preview__toggle-btn"
          :class="{ 'markdown-preview__toggle-btn--active': showSource }"
          @click="showSource = true"
        >
          <i class="fas fa-code"></i> Source
        </button>
      </div>
    </div>
    
    <div class="markdown-preview__content">
      <div v-if="sections.length === 0" class="markdown-preview__empty">
        <p>Your template preview will appear here</p>
      </div>
      
      <div v-else-if="showSource" class="markdown-preview__source">
        <pre><code>{{ markdownText }}</code></pre>
      </div>
      
      <div v-else class="markdown-preview__rendered" v-html="renderedMarkdown"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import { TemplateSection } from '@/types/TemplateSection';
import { generateMarkdown } from '@/utils/markdownUtils';

// Define props
const props = defineProps<{
  sections: TemplateSection[]
}>();

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});

// Toggle between rendered and source view
const showSource = ref(false);

// Generate markdown text from sections
const markdownText = computed(() => {
  return generateMarkdown(props.sections);
});

// Render markdown to HTML
const renderedMarkdown = computed(() => {
  return md.render(markdownText.value);
});
</script>

<style scoped>
.markdown-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.markdown-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.markdown-preview__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.markdown-preview__toggle {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.markdown-preview__toggle-btn {
  border: none;
  background: white;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.markdown-preview__toggle-btn--active {
  background-color: #f0f0f0;
  font-weight: 500;
}

.markdown-preview__content {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: auto;
  padding: 1rem;
  background-color: white;
}

.markdown-preview__empty {
  color: #888;
  text-align: center;
  padding: 2rem;
}

.markdown-preview__source {
  font-family: monospace;
  white-space: pre-wrap;
  font-size: 0.875rem;
  line-height: 1.5;
}

.markdown-preview__rendered {
  font-size: 0.875rem;
  line-height: 1.6;
}

.markdown-preview__rendered :deep(h1) {
  font-size: 1.75rem;
  margin-top: 0;
  margin-bottom: 1rem;
}

.markdown-preview__rendered :deep(h2) {
  font-size: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-preview__rendered :deep(h3) {
  font-size: 1.25rem;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.markdown-preview__rendered :deep(h4) {
  font-size: 1.125rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-preview__rendered :deep(h5) {
  font-size: 1rem;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

.markdown-preview__rendered :deep(h6) {
  font-size: 0.875rem;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

.markdown-preview__rendered :deep(p) {
  margin-top: 0;
  margin-bottom: 1rem;
}

.markdown-preview__rendered :deep(ul), 
.markdown-preview__rendered :deep(ol) {
  margin-top: 0;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-preview__rendered :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1rem;
}

.markdown-preview__rendered :deep(th), 
.markdown-preview__rendered :deep(td) {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}

.markdown-preview__rendered :deep(th) {
  background-color: #f5f5f5;
  font-weight: 600;
}

.markdown-preview__rendered :deep(code) {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
}

.markdown-preview__rendered :deep(pre) {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  overflow: auto;
}

.markdown-preview__rendered :deep(input[type="checkbox"]) {
  margin-right: 0.5rem;
}
</style>