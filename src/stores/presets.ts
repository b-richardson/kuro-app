import { defineStore } from "pinia";
import { ModuleType, PluginType } from "@/types/TemplateModule";
import { ref, computed } from "vue";

// --- Enums and Interfaces ---
export enum ModulePriority {
  HIGH = "high",
  SECONDARY = "secondary",
  LOW = "low",
}

export interface ModulePreset {
  id: string;
  title: string;
  description: string;
  content: string[];
  priority: ModulePriority;
  moduleType: ModuleType;
}

// --- Store ---
export const usePresetStore = defineStore("presets", () => {
  // --- State ---
  const yamlPresets = ref<ModulePreset[]>([
    {
      id: "daily-note",
      title: "Daily Note",
      description: "YAML frontmatter for a daily note",
      priority: ModulePriority.HIGH,
      moduleType: "yaml",
      content: [],
    },
    {
      id: "meeting-note",
      title: "Meeting Note",
      description: "YAML frontmatter for a meeting note",
      priority: ModulePriority.HIGH,
      moduleType: "yaml",
      content: [],
    },
    {
      id: "project-note",
      title: "Project Note",
      description: "YAML frontmatter for a project note",
      priority: ModulePriority.SECONDARY,
      moduleType: "yaml",
      content: [],
    },
  ]);

  const templaterModules = ref<ModulePreset[]>([
    {
      id: "date-and-time",
      moduleType: "templaterDateAndTime",
      title: "Date and Time",
      description: "Insert a dynamic date or time",
      priority: ModulePriority.HIGH,
      content: [],
    },
    {
      id: "file-property",
      moduleType: "templaterFileProperty",
      title: "File Property",
      description: "Insert a file property",
      priority: ModulePriority.HIGH,
      content: [],
    },
    {
      id: "user-input",
      moduleType: "templaterUserInput",
      title: "User Input",
      description: "Insert a user input field",
      priority: ModulePriority.HIGH,
      content: [],
    },
    {
      id: "value-transformation",
      moduleType: "templaterValueTransformation",
      title: "Value Transformation",
      description: "Transform a value using a function",
      priority: ModulePriority.HIGH,
      content: [],
    },
    {
      id: "conditional-content",
      moduleType: "templaterConditionalContent",
      title: "Conditional Content",
      description: "Insert content based on conditions",
      priority: ModulePriority.HIGH,
      content: [],
    },
    {
      id: "template-variables",
      moduleType: "templaterTemplateVariables",
      title: "Template Variables",
      description: "Insert template variables",
      priority: ModulePriority.HIGH,
      content: [],
    },
    {
      id: "date-field",
      moduleType: "templaterField",
      title: "Date Field",
      description: "Insert a dynamic date field",
      priority: ModulePriority.SECONDARY,
      content: [],
    },
    {
      id: "file-title",
      moduleType: "templaterField",
      title: "File Title",
      description: "Insert the current file title",
      priority: ModulePriority.SECONDARY,
      content: [],
    },
  ]);

  const dataviewModules = ref<ModulePreset[]>([
    // Original modules (keeping for backward compatibility but wont use again)
    {
      id: "basic-list",
      moduleType: "dataviewQuery",
      title: "Generic Query",
      description: "Create a custom Dataview query",
      priority: ModulePriority.SECONDARY,
      content: [],
    },
    {
      id: "table-query",
      moduleType: "dataviewQuery",
      title: "Table of Notes",
      description: "Create a table of notes with specific metadata",
      priority: ModulePriority.SECONDARY,
      content: [],
    },
    // New specialized modules
    {
      id: "list-query",
      moduleType: "dataviewListQuery",
      title: "List View",
      description: "Create a list of notes with filtering",
      priority: ModulePriority.HIGH,
      content: [],
    },
    {
      id: "table-query-module",
      moduleType: "dataviewTableQuery",
      title: "Table View",
      description: "Create a table of your notes with custom columns",
      priority: ModulePriority.HIGH,
      content: [],
    },
    {
      id: "task-query",
      moduleType: "dataviewTaskQuery",
      title: "Task View",
      description: "Create a list of tasks from your notes",
      priority: ModulePriority.HIGH,
      content: [],
    },
    {
      id: "calendar-query",
      moduleType: "dataviewCalendarQuery",
      title: "Calendar View",
      description: "Display your notes on a calendar by date field",
      priority: ModulePriority.HIGH,
      content: [],
    },
    {
      id: "dataview-inline-fields",
      moduleType: "dataviewInlineFields",
      title: "Inline Fields",
      description: "Add inline Dataview fields to your note",
      priority: ModulePriority.HIGH,
      content: [],
    },
  ]);

  const kanbanModules = ref<ModulePreset[]>([]);

  // --- Getters (as plain functions or computed values if needed) ---
  const getYamlPresetById = (id: string) =>
    yamlPresets.value.find((p) => p.id === id);

  const getPluginModules = (pluginType: PluginType) => {
    switch (pluginType) {
      case "templater":
        return templaterModules.value;
      case "dataview":
        return dataviewModules.value;
      default:
        return [];
    }
  };

  const getPluginModuleById = (id: string, pluginType: PluginType) =>
    getPluginModules(pluginType).find((m) => m.id === id);

  const getYamlPresetsByPriority = (priority: ModulePriority) =>
    yamlPresets.value.filter((p) => p.priority === priority);

  const getPluginModulesByPriority = (
    pluginType: PluginType,
    priority: ModulePriority
  ) => getPluginModules(pluginType).filter((m) => m.priority === priority);

  const getHighPriorityModules = () => ({
    yaml: yamlPresets.value.filter((m) => m.priority === ModulePriority.HIGH),
    dataview: dataviewModules.value.filter(
      (m) => m.priority === ModulePriority.HIGH
    ),
  });

  // --- Actions ---
  const addYamlPreset = (preset: Omit<ModulePreset, "id" | "priority">) => {
    const newPreset: ModulePreset = {
      id: crypto.randomUUID(),
      priority: ModulePriority.SECONDARY,
      ...preset,
    };
    yamlPresets.value.push(newPreset);
    return newPreset.id;
  };

  const addPluginModule = (
    module: Omit<ModulePreset, "id" | "priority">,
    pluginType: PluginType
  ) => {
    const newModule: ModulePreset = {
      id: crypto.randomUUID(),
      priority: ModulePriority.SECONDARY,
      ...module,
    };

    switch (pluginType) {
      case "templater":
        templaterModules.value.push(newModule);
        break;
      case "dataview":
        dataviewModules.value.push(newModule);
        break;
    }

    return newModule.id;
  };

  const updateModulePriority = (
    moduleId: string,
    pluginType: "yaml" | PluginType,
    newPriority: ModulePriority
  ) => {
    if (pluginType === "yaml") {
      const m = yamlPresets.value.find((p) => p.id === moduleId);
      if (m) m.priority = newPriority;
    } else {
      const m = getPluginModules(pluginType).find((p) => p.id === moduleId);
      if (m) m.priority = newPriority;
    }
  };

  return {
    // state
    yamlPresets,
    templaterModules,
    dataviewModules,

    // getters
    getYamlPresetById,
    getPluginModules,
    getPluginModuleById,
    getYamlPresetsByPriority,
    getPluginModulesByPriority,
    getHighPriorityModules,

    // actions
    addYamlPreset,
    addPluginModule,
    updateModulePriority,
  };
});
