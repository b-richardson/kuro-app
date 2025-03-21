<template>
  <div class="section-library">
    <h2 class="section-library-title">Section Library</h2>
    <p class="section-library-description">
      Drag or click to add sections to your template
    </p>

    <!-- Basic Sections -->
    <div class="section-library-category">
      <h3 class="section-library-category-title">Basic Sections</h3>
      <div class="section-library-items">
        <div
          v-for="section in basicSections"
          :key="section.type"
          class="section-library-item"
          :class="`section-library-item--${section.type}`"
          @click="addSection(section.type, null)"
          draggable="true"
        >
          <div class="section-library-item-icon">
            <i :class="section.icon"></i>
          </div>
          <div class="section-library-item-content">
            <h3 class="section-library-item-title">{{ section.label }}</h3>
            <p class="section-library-item-description">
              {{ section.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- YAML Frontmatter Presets -->
    <div class="section-library-category">
      <h3 class="section-library-category-title">YAML Frontmatter Presets</h3>
      <div class="section-library-items">
        <div
          v-for="preset in yamlPresets"
          :key="preset.id"
          class="section-library-item section-library-item--yaml-preset"
          @click="addYamlPreset(preset.id)"
          draggable="true"
        >
          <div class="section-library-item-icon">
            <i class="fas fa-code"></i>
          </div>
          <div class="section-library-item-content">
            <h3 class="section-library-item-title">{{ preset.name }}</h3>
            <p class="section-library-item-description">
              {{ preset.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Plugin Sections -->
    <div class="section-library-category">
      <h3 class="section-library-category-title">Plugin-Aware Sections</h3>

      <!-- Templater Plugin Sections -->
      <div class="section-library-plugin-group">
        <h4 class="section-library-plugin-title">
          <i class="fas fa-calendar-alt section-library-plugin-icon"></i>
          Templater
        </h4>
        <div class="section-library-items">
          <div
            v-for="section in templaterSections"
            :key="section.type"
            class="section-library-item"
            :class="`section-library-item--${section.type}`"
            @click="addSection(section.type, 'templater')"
            draggable="true"
          >
            <div class="section-library-item-icon">
              <i :class="section.icon"></i>
            </div>
            <div class="section-library-item-content">
              <h3 class="section-library-item-title">{{ section.label }}</h3>
              <p class="section-library-item-description">
                {{ section.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Dataview Plugin Sections -->
      <div class="section-library-plugin-group">
        <h4 class="section-library-plugin-title">
          <i class="fas fa-database section-library-plugin-icon"></i>
          Dataview
        </h4>
        <div class="section-library-items">
          <div
            v-for="section in dataviewSections"
            :key="section.type"
            class="section-library-item"
            :class="`section-library-item--${section.type}`"
            @click="addSection(section.type, 'dataview')"
            draggable="true"
          >
            <div class="section-library-item-icon">
              <i :class="section.icon"></i>
            </div>
            <div class="section-library-item-content">
              <h3 class="section-library-item-title">{{ section.label }}</h3>
              <p class="section-library-item-description">
                {{ section.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Kanban Plugin Sections -->
      <div class="section-library-plugin-group">
        <h4 class="section-library-plugin-title">
          <i class="fas fa-columns section-library-plugin-icon"></i>
          Kanban
        </h4>
        <div class="section-library-items">
          <div
            v-for="section in kanbanSections"
            :key="section.type"
            class="section-library-item"
            :class="`section-library-item--${section.type}`"
            @click="addSection(section.type, 'kanban')"
            draggable="true"
          >
            <div class="section-library-item-icon">
              <i :class="section.icon"></i>
            </div>
            <div class="section-library-item-content">
              <h3 class="section-library-item-title">{{ section.label }}</h3>
              <p class="section-library-item-description">
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

// Mock YAML presets
// In a real app, these would be loaded from a service or configuration
const yamlPresets = [
  {
    id: "daily",
    name: "Daily Note",
    description: "Standard daily note frontmatter with date and tags",
    frontmatter: {
      type: "daily",
      date: new Date().toISOString().split("T")[0],
      tags: ["daily"],
    },
  },
  {
    id: "meeting",
    name: "Meeting Note",
    description: "Meeting template with attendees and agenda",
    frontmatter: {
      type: "meeting",
      date: new Date().toISOString().split("T")[0],
      attendees: [],
      tags: ["meeting"],
    },
  },
];

// Function to get preset by ID
const getPresetById = (id) => {
  return yamlPresets.find((preset) => preset.id === id);
};

// Function to convert YAML object to lines
const yamlObjectToLines = (obj) => {
  const lines = ["---"];

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        value.forEach((item) => {
          lines.push(`  - ${item}`);
        });
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---");
  return lines;
};

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

/**
 * Adds a YAML section with content from a preset
 * @param presetId The ID of the preset to use
 */
const addYamlPreset = (presetId: string) => {
  const preset = getPresetById(presetId);
  if (!preset) return;

  // Convert the preset frontmatter to YAML lines
  const yamlLines = yamlObjectToLines(preset.frontmatter);

  // Create a new section with a unique ID
  const newSection: TemplateSection = {
    id: uuidv4(),
    type: "yaml",
    content: yamlLines,
    pluginType: null,
  };

  // Emit the add-section event
  emit("add-section", newSection);
};
</script>

<style scoped>
.section-library {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.section-library-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs);
  color: var(--color-primary);
}

.section-library-description {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0 0 var(--spacing-md);
}

.section-library-category {
  margin-bottom: var(--spacing-lg);
}

.section-library-category-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm);
  color: var(--color-text);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-surface);
}

.section-library-plugin-group {
  margin-bottom: var(--spacing-md);
}

.section-library-plugin-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) var(--spacing-xs);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.section-library-plugin-icon {
  opacity: 0.8;
}

.section-library-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.section-library-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-surface);
  gap: var(--spacing-sm);
  box-shadow: var(--glass-shadow);
}

.section-library-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.1);
}

.section-library-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

/* Basic section icons */
.section-library-item--header .section-library-item-icon {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-light) 100%
  );
}

.section-library-item--checklist .section-library-item-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.section-library-item--table .section-library-item-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.section-library-item--text .section-library-item-icon {
  background: linear-gradient(
    135deg,
    var(--color-primary-light) 0%,
    var(--color-primary) 100%
  );
}

.section-library-item--yaml .section-library-item-icon,
.section-library-item--yaml-preset .section-library-item-icon {
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
}

/* Plugin section icons */
.section-library-item--templaterField .section-library-item-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.section-library-item--dataviewQuery .section-library-item-icon {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.section-library-item--kanban .section-library-item-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.section-library-item-content {
  flex: 1;
}

.section-library-item-title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.section-library-item-description {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin: var(--spacing-xs) 0 0;
  line-height: 1.3;
}

/* Media queries for responsive design */
@media (max-width: 768px) {
  .section-library-category-title {
    font-size: 0.9375rem;
  }

  .section-library-plugin-title {
    font-size: 0.8125rem;
  }

  .section-library-item {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .section-library-item-icon {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
}
</style>
