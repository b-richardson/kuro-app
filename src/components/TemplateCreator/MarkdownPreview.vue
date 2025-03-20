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
  color: #4f46e5;
}

.markdown-preview__toggle {
  display: flex;
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

.markdown-preview__toggle-btn {
  border: none;
  background: white;
  padding: 0.625rem 0.875rem;
  font-size: 0.8125rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.325rem;
  color: #64748b;
  transition: all 0.2s;
}

.markdown-preview__toggle-btn:hover {
  background-color: #f8fafc;
  color: #334155;
}

.markdown-preview__toggle-btn--active {
  background-color: #f0f4ff;
  color: #4f46e5;
  font-weight: 500;
}

.markdown-preview__content {
  flex: 1;
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 10px;
  overflow: auto;
  padding: 1.5rem;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.markdown-preview__empty {
  color: #94a3b8;
  text-align: center;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.markdown-preview__empty:before {
  content: "👀";
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.markdown-preview__source {
  font-family: 'Fira Code', 'Courier New', monospace;
  white-space: pre-wrap;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #334155;
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.markdown-preview__rendered {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #334155;
}

.markdown-preview__rendered :deep(h1) {
  font-size: 1.875rem;
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: #1e293b;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 0.5rem;
}

.markdown-preview__rendered :deep(h2) {
  font-size: 1.5rem;
  margin-top: 1.75rem;
  margin-bottom: 0.875rem;
  color: #1e293b;
}

.markdown-preview__rendered :deep(h3) {
  font-size: 1.25rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1e293b;
}

.markdown-preview__rendered :deep(h4) {
  font-size: 1.125rem;
  margin-top: 1.25rem;
  margin-bottom: 0.625rem;
  color: #1e293b;
}

.markdown-preview__rendered :deep(h5) {
  font-size: 1rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.markdown-preview__rendered :deep(h6) {
  font-size: 0.875rem;
  margin-top: 0.875rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.markdown-preview__rendered :deep(p) {
  margin-top: 0;
  margin-bottom: 1.25rem;
}

.markdown-preview__rendered :deep(ul), 
.markdown-preview__rendered :deep(ol) {
  margin-top: 0;
  margin-bottom: 1.25rem;
  padding-left: 1.75rem;
}

.markdown-preview__rendered :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-preview__rendered :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.markdown-preview__rendered :deep(th), 
.markdown-preview__rendered :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  text-align: left;
}

.markdown-preview__rendered :deep(th) {
  background-color: #f8fafc;
  font-weight: 600;
  color: #334155;
}

.markdown-preview__rendered :deep(tr:nth-child(even)) {
  background-color: #f8fafc;
}

.markdown-preview__rendered :deep(code) {
  font-family: 'Fira Code', 'Courier New', monospace;
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.875em;
  color: #4f46e5;
}

.markdown-preview__rendered :deep(pre) {
  background-color: #f8fafc;
  padding: 1.25rem;
  border-radius: 8px;
  overflow: auto;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.markdown-preview__rendered :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: #334155;
}

.markdown-preview__rendered :deep(blockquote) {
  border-left: 4px solid #e2e8f0;
  padding-left: 1rem;
  margin-left: 0;
  color: #64748b;
}

.markdown-preview__rendered :deep(hr) {
  border: none;
  border-top: 2px solid #f1f5f9;
  margin: 2rem 0;
}

.markdown-preview__rendered :deep(input[type="checkbox"]) {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
  accent-color: #4f46e5;
}
</style>