<template>
  <div class="section-library">
    <h2 class="section-library__title">Section Library</h2>
    <p class="section-library__description">
      Drag or click to add sections to your template
    </p>

    <!-- Basic Sections -->
    <div class="section-library__category">
      <h3 class="section-library__category-title">Basic Sections</h3>
      <div class="section-library__items">
        <div
          v-for="section in basicSections"
          :key="section.type"
          class="section-library__item"
          :class="`section-library__item--${section.type}`"
          @click="addSection(section.type, null)"
          draggable="true"
        >
          <div class="section-library__item-icon">
            <i :class="section.icon"></i>
          </div>
          <div class="section-library__item-content">
            <h3 class="section-library__item-title">{{ section.label }}</h3>
            <p class="section-library__item-description">
              {{ section.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Plugin Sections -->
    <div class="section-library__category">
      <h3 class="section-library__category-title">Plugin-Aware Sections</h3>

      <!-- Templater Plugin Sections -->
      <div class="section-library__plugin-group">
        <h4 class="section-library__plugin-title">
          <i class="fas fa-calendar-alt section-library__plugin-icon"></i>
          Templater
        </h4>
        <div class="section-library__items">
          <div
            v-for="section in templaterSections"
            :key="section.type"
            class="section-library__item"
            :class="`section-library__item--${section.type}`"
            @click="addSection(section.type, 'templater')"
            draggable="true"
          >
            <div class="section-library__item-icon">
              <i :class="section.icon"></i>
            </div>
            <div class="section-library__item-content">
              <h3 class="section-library__item-title">{{ section.label }}</h3>
              <p class="section-library__item-description">
                {{ section.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Dataview Plugin Sections -->
      <div class="section-library__plugin-group">
        <h4 class="section-library__plugin-title">
          <i class="fas fa-database section-library__plugin-icon"></i>
          Dataview
        </h4>
        <div class="section-library__items">
          <div
            v-for="section in dataviewSections"
            :key="section.type"
            class="section-library__item"
            :class="`section-library__item--${section.type}`"
            @click="addSection(section.type, 'dataview')"
            draggable="true"
          >
            <div class="section-library__item-icon">
              <i :class="section.icon"></i>
            </div>
            <div class="section-library__item-content">
              <h3 class="section-library__item-title">{{ section.label }}</h3>
              <p class="section-library__item-description">
                {{ section.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Kanban Plugin Sections -->
      <div class="section-library__plugin-group">
        <h4 class="section-library__plugin-title">
          <i class="fas fa-columns section-library__plugin-icon"></i>
          Kanban
        </h4>
        <div class="section-library__items">
          <div
            v-for="section in kanbanSections"
            :key="section.type"
            class="section-library__item"
            :class="`section-library__item--${section.type}`"
            @click="addSection(section.type, 'kanban')"
            draggable="true"
          >
            <div class="section-library__item-icon">
              <i :class="section.icon"></i>
            </div>
            <div class="section-library__item-content">
              <h3 class="section-library__item-title">{{ section.label }}</h3>
              <p class="section-library__item-description">
                {{ section.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import {
  TemplateSection,
  SectionType,
  PluginType,
} from "@/types/TemplateSection";
import {
  getSectionIcon,
  generateDefaultContent,
} from "@/utils/pluginTemplates";

// Define emits
const emit = defineEmits<{
  (e: "add-section", section: TemplateSection): void;
}>();

// Section definitions structure
interface SectionDefinition {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
}

// Basic sections
const basicSections = ref<SectionDefinition[]>([
  {
    type: "header",
    label: "Header",
    description: "Add headings to structure your template",
    icon: getSectionIcon("header"),
  },
  {
    type: "checklist",
    label: "Checklist",
    description: "Create a list of tasks or items",
    icon: getSectionIcon("checklist"),
  },
  {
    type: "table",
    label: "Table",
    description: "Organize information in rows and columns",
    icon: getSectionIcon("table"),
  },
  {
    type: "text",
    label: "Text Block",
    description: "Add paragraphs of text",
    icon: getSectionIcon("text"),
  },
  {
    type: "yaml",
    label: "YAML Frontmatter",
    description: "Add metadata at the top of your template",
    icon: getSectionIcon("yaml"),
  },
]);

// Templater plugin sections
const templaterSections = ref<SectionDefinition[]>([
  {
    type: "templaterField",
    label: "Date Field",
    description: "Dynamic date or time field using Templater",
    icon: getSectionIcon("templaterField"),
  },
]);

// Dataview plugin sections
const dataviewSections = ref<SectionDefinition[]>([
  {
    type: "dataviewQuery",
    label: "Query",
    description: "Add a dataview query to display filtered content",
    icon: getSectionIcon("dataviewQuery"),
  },
]);

// Kanban plugin sections
const kanbanSections = ref<SectionDefinition[]>([
  {
    type: "kanban",
    label: "Kanban Board",
    description: "Add a kanban board to manage tasks and workflows",
    icon: getSectionIcon("kanban"),
  },
]);

// All sections combined
const allSections = computed(() => [
  ...basicSections.value,
  ...templaterSections.value,
  ...dataviewSections.value,
  ...kanbanSections.value,
]);

/**
 * Adds a new section of the specified type
 * Creates a unique ID and initializes with default content
 * @param type The section type
 * @param pluginType The associated plugin (if applicable)
 */
const addSection = (type: SectionType, pluginType: PluginType) => {
  // Find the section definition
  const sectionDef = allSections.value.find((s) => s.type === type);

  if (!sectionDef) return;

  // Generate default content based on section type and plugin
  const defaultContent = generateDefaultContent(type, pluginType);

  // Create a new section with a unique ID
  const newSection: TemplateSection = {
    id: uuidv4(),
    type,
    content: defaultContent,
    pluginType,
  };

  // Emit the add-section event
  emit("add-section", newSection);
};
</script>

<style scoped>
.section-library {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  overflow-y: auto;
  padding-right: 0.25rem;
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

.section-library__category {
  margin-bottom: 1.5rem;
}

.section-library__category-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: #1e293b;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(230, 235, 245, 0.8);
}

.section-library__plugin-group {
  margin-bottom: 1.25rem;
}

.section-library__plugin-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0.5rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.section-library__plugin-icon {
  opacity: 0.8;
}

.section-library__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
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

/* Basic section icons */
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

.section-library__item--yaml .section-library__item-icon {
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
}

/* Plugin section icons */
.section-library__item--templaterField .section-library__item-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.section-library__item--dataviewQuery .section-library__item-icon {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.section-library__item--kanban .section-library__item-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
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

/* Media queries for responsive design */
@media (max-width: 768px) {
  .section-library__category-title {
    font-size: 0.9375rem;
  }

  .section-library__plugin-title {
    font-size: 0.8125rem;
  }

  .section-library__item {
    padding: 0.75rem;
  }

  .section-library__item-icon {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
}
</style>
