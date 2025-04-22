import { defineStore } from "pinia";
import { ModuleType, PluginType } from "@/types/TemplateModule";
import { ref } from "vue";

// --- Interfaces ---
export interface PluginModule {
  id: string;
  title: string;
  description: string;
  content: string[];
  moduleType: ModuleType;
}

// --- Store ---
export const usePluginModuleStore = defineStore("pluginModules", () => {
  // --- State ---
  const templaterModules = ref<PluginModule[]>([
    {
      id: "date-and-time",
      moduleType: "templaterDateAndTime",
      title: "Date and Time",
      description: "Insert a dynamic date or time",
      content: [],
    },
    {
      id: "file-property",
      moduleType: "templaterFileProperty",
      title: "File Property",
      description: "Insert a file property",
      content: [],
    },
    {
      id: "user-input",
      moduleType: "templaterUserInput",
      title: "User Input",
      description: "Insert a user input field",
      content: [],
    },
    {
      id: "value-transformation",
      moduleType: "templaterValueTransformation",
      title: "Value Transformation",
      description: "Transform a value using a function",
      content: [],
    },
    {
      id: "conditional-content",
      moduleType: "templaterConditionalContent",
      title: "Conditional Content",
      description: "Insert content based on conditions",
      content: [],
    },
    {
      id: "template-variables",
      moduleType: "templaterTemplateVariables",
      title: "Template Variables",
      description: "Insert template variables",
      content: [],
    },
    {
      id: "date-field",
      moduleType: "templaterField",
      title: "Date Field",
      description: "Insert a dynamic date field",
      content: [],
    },
    {
      id: "file-title",
      moduleType: "templaterField",
      title: "File Title",
      description: "Insert the current file title",
      content: [],
    },
  ]);

  const dataviewModules = ref<PluginModule[]>([
    {
      id: "basic-list",
      moduleType: "dataviewQuery",
      title: "Generic Query",
      description: "Create a custom Dataview query",
      content: [],
    },
    {
      id: "table-query",
      moduleType: "dataviewQuery",
      title: "Table of Notes",
      description: "Create a table of notes with specific metadata",
      content: [],
    },
    {
      id: "list-query",
      moduleType: "dataviewListQuery",
      title: "List View",
      description: "Create a list of notes with filtering",
      content: [],
    },
    {
      id: "table-query-module",
      moduleType: "dataviewTableQuery",
      title: "Table View",
      description: "Create a table of your notes with custom columns",
      content: [],
    },
    {
      id: "task-query",
      moduleType: "dataviewTaskQuery",
      title: "Task View",
      description: "Create a list of tasks from your notes",
      content: [],
    },
    {
      id: "calendar-query",
      moduleType: "dataviewCalendarQuery",
      title: "Calendar View",
      description: "Display your notes on a calendar by date field",
      content: [],
    },
    {
      id: "dataview-inline-fields",
      moduleType: "dataviewInlineFields",
      title: "Inline Fields",
      description: "Add inline Dataview fields to your note",
      content: [],
    },
  ]);

  // --- Getters ---
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

  // --- Actions ---
  const addPluginModule = (
    module: Omit<PluginModule, "id">,
    pluginType: PluginType
  ) => {
    const newModule: PluginModule = {
      id: crypto.randomUUID(),
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

  return {
    templaterModules,
    dataviewModules,
    getPluginModules,
    getPluginModuleById,
    addPluginModule,
  };
});
