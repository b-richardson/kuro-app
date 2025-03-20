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
}

.section-library__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.section-library__description {
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 1rem;
}

.section-library__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-library__item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
  border: 1px solid #e0e0e0;
  gap: 0.75rem;
}

.section-library__item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-library__item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: white;
  font-size: 1rem;
}

.section-library__item--header .section-library__item-icon {
  background-color: #4f46e5;
}

.section-library__item--checklist .section-library__item-icon {
  background-color: #10b981;
}

.section-library__item--table .section-library__item-icon {
  background-color: #f59e0b;
}

.section-library__item--text .section-library__item-icon {
  background-color: #6366f1;
}

.section-library__item-content {
  flex: 1;
}

.section-library__item-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.section-library__item-description {
  font-size: 0.75rem;
  color: #666;
  margin: 0.25rem 0 0;
  line-height: 1.2;
}
</style>