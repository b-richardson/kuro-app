<template>
  <div class="section-library">
    <h2 class="section-library__title">Section Library</h2>
    <p class="section-library__description">Drag or click to add sections to your template</p>
    
    <div class="section-library__items">
      <div 
        v-for="section in predefinedSections" 
        :key="section.type"
        class="section-library__item"
        :class="`section-library__item--${section.type}`"
        @click="addSection(section.type)"
        draggable="true"
      >
        <div class="section-library__item-icon">
          <i :class="section.icon"></i>
        </div>
        <div class="section-library__item-content">
          <h3 class="section-library__item-title">{{ section.label }}</h3>
          <p class="section-library__item-description">{{ section.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { TemplateSection, SectionType } from '@/types/TemplateSection';

// Define emits
const emit = defineEmits<{
  (e: 'add-section', section: TemplateSection): void
}>();

// Predefined sections with their types, labels, and descriptions
const predefinedSections = ref([
  {
    type: 'header' as SectionType,
    label: 'Header',
    description: 'Add headings to structure your template',
    icon: 'fa-heading',
    defaultContent: ['# New Header']
  },
  {
    type: 'checklist' as SectionType,
    label: 'Checklist',
    description: 'Create a list of tasks or items',
    icon: 'fa-check-square',
    defaultContent: ['- [ ] First item', '- [ ] Second item', '- [ ] Third item']
  },
  {
    type: 'table' as SectionType,
    label: 'Table',
    description: 'Organize information in rows and columns',
    icon: 'fa-table',
    defaultContent: [
      '| Header 1 | Header 2 | Header 3 |',
      '|----------|----------|----------|',
      '| Cell 1   | Cell 2   | Cell 3   |',
      '| Cell 4   | Cell 5   | Cell 6   |'
    ]
  },
  {
    type: 'text' as SectionType,
    label: 'Text Block',
    description: 'Add paragraphs of text',
    icon: 'fa-align-left',
    defaultContent: ['Enter your text here...']
  }
]);

/**
 * Adds a new section of the specified type
 * Creates a unique ID and initializes with default content
 */
const addSection = (type: SectionType) => {
  // Find the predefined section
  const predefinedSection = predefinedSections.value.find(s => s.type === type);
  
  if (!predefinedSection) return;
  
  // Create a new section with a unique ID
  const newSection: TemplateSection = {
    id: uuidv4(),
    type,
    content: [...predefinedSection.defaultContent] // Clone the default content
  };
  
  // Emit the add-section event
  emit('add-section', newSection);
};
</script>

<style scoped>
.section-library {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.section-library__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #4f46e5;
}

.section-library__description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1rem;
}

.section-library__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
}

.section-library__item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(230, 235, 245, 0.8);
  gap: 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.section-library__item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.9);
}

.section-library__item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.section-library__item--header .section-library__item-icon {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
}

.section-library__item--checklist .section-library__item-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.section-library__item--table .section-library__item-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.section-library__item--text .section-library__item-icon {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.section-library__item-content {
  flex: 1;
}

.section-library__item-title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0;
  color: #334155;
}

.section-library__item-description {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0.25rem 0 0;
  line-height: 1.3;
}
</style>