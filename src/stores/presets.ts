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
      content: [
        "---",
        'date: <% tp.date.now("YYYY-MM-DD") %>',
        "tags: daily-note",
        "---",
      ],
    },
    {
      id: "meeting-note",
      title: "Meeting Note",
      description: "YAML frontmatter for a meeting note",
      priority: ModulePriority.HIGH,
      moduleType: "yaml",
      content: [
        "---",
        'date: <% tp.date.now("YYYY-MM-DD") %>',
        'time: <% tp.date.now("HH:mm") %>',
        "attendees: ",
        "tags: meeting",
        "---",
      ],
    },
    {
      id: "project-note",
      title: "Project Note",
      description: "YAML frontmatter for a project note",
      priority: ModulePriority.SECONDARY,
      moduleType: "yaml",
      content: [
        "---",
        "title: Project Name",
        'date: <% tp.date.now("YYYY-MM-DD") %>',
        "status: planning",
        "tags: [project]",
        "---",
      ],
    },
  ]);

  const templaterModules = ref<ModulePreset[]>([
    {
      id: "date-and-time",
      moduleType: "templaterDateAndTime",
      title: "Date and Time",
      description: "Insert a dynamic date or time",
      priority: ModulePriority.HIGH,
      content: ['<% tp.date.now("YYYY-MM-DD") %>'],
    },
    {
      id: "file-property",
      moduleType: "templaterFileProperty",
      title: "File Property",
      description: "Insert a file property",
      priority: ModulePriority.HIGH,
      content: ["<% tp.file.title %>", "<% tp.file.path %>"],
    },
    {
      id: "user-input",
      moduleType: "templaterUserInput",
      title: "User Input",
      description: "Insert a user input field",
      priority: ModulePriority.HIGH,
      content: [
        'Enter your name: <% tp.userInput("Name") %>',
        'Enter your age: <% tp.userInput("Age") %>',
        'Enter your email: <% tp.userInput("Email") %>',
      ],
    },
    {
      id: "value-transformation",
      moduleType: "templaterValueTransformation",
      title: "Value Transformation",
      description: "Transform a value using a function",
      priority: ModulePriority.HIGH,
      content: [
        'Transform value: <% tp.userInput("Value").toUpperCase() %>',
        'Square a number: <% tp.userInput("Number") * tp.userInput("Number") %>',
        'Format date: <% tp.date.now("YYYY-MM-DD") %>',
      ],
    },
    {
      id: "conditional-content",
      moduleType: "templaterConditionalContent",
      title: "Conditional Content",
      description: "Insert content based on conditions",
      priority: ModulePriority.HIGH,
      content: [
        'If condition is true: <% if (tp.userInput("Condition")) { %> This is true <% } %>',
        'If condition is false: <% if (!tp.userInput("Condition")) { %> This is false <% } %>',
      ],
    },
    {
      id: "template-variables",
      moduleType: "templaterTemplateVariables",
      title: "Template Variables",
      description: "Insert template variables",
      priority: ModulePriority.HIGH,
      content: [
        'Current date: <% tp.date.now("YYYY-MM-DD") %>',
        'Current time: <% tp.date.now("HH:mm:ss") %>',
        "Current file path: <% tp.file.path %>",
      ],
    },
    {
      id: "date-field",
      moduleType: "templaterField",
      title: "Date Field",
      description: "Insert a dynamic date field",
      priority: ModulePriority.SECONDARY,
      content: ['<% tp.date.now("YYYY-MM-DD") %>'],
    },
    {
      id: "file-title",
      moduleType: "templaterField",
      title: "File Title",
      description: "Insert the current file title",
      priority: ModulePriority.SECONDARY,
      content: ["<% tp.file.title %>"],
    },
  ]);

  const dataviewModules = ref<ModulePreset[]>([
    // Original modules (keeping for backward compatibility)
    {
      id: "basic-list",
      moduleType: "dataviewQuery",
      title: "Generic Query",
      description: "Create a custom Dataview query",
      priority: ModulePriority.SECONDARY,
      content: ["```dataview", "LIST", "FROM #tag", "```"],
    },
    {
      id: "table-query",
      moduleType: "dataviewQuery",
      title: "Table of Notes",
      description: "Create a table of notes with specific metadata",
      priority: ModulePriority.SECONDARY,
      content: [
        "```dataview",
        "TABLE date, tags",
        'FROM "folder"',
        "SORT date DESC",
        "```",
      ],
    },
    // New specialized modules
    {
      id: "list-query",
      moduleType: "dataviewListQuery",
      title: "List Query",
      description: "Create a list of notes with filtering",
      priority: ModulePriority.HIGH,
      content: ["```dataview", "LIST", "FROM #tag", "```"],
    },
    {
      id: "table-query-module",
      moduleType: "dataviewTableQuery",
      title: "Table Query",
      description: "Create a table with custom columns",
      priority: ModulePriority.HIGH,
      content: [
        "```dataview",
        "TABLE file.ctime as Created, file.mtime as Modified",
        'FROM "folder"',
        "SORT file.mtime DESC",
        "```",
      ],
    },
    {
      id: "task-query",
      moduleType: "dataviewTaskQuery",
      title: "Task Query",
      description: "Create a list of tasks from your notes",
      priority: ModulePriority.HIGH,
      content: [
        "```dataview",
        "TASK",
        "FROM #project",
        "WHERE !completed",
        "```",
      ],
    },
    {
      id: "calendar-query",
      moduleType: "dataviewCalendarQuery",
      title: "Calendar View",
      description: "Display notes on a calendar by date field",
      priority: ModulePriority.HIGH,
      content: [
        "```dataview",
        "CALENDAR file.ctime",
        'FROM "Daily Notes"',
        "```",
      ],
    },
    {
      id: "dataview-fields",
      moduleType: "dataviewFields",
      title: "Inline Fields",
      description: "Add inline Dataview fields to your note",
      priority: ModulePriority.HIGH,
      content: ["Due:: 2023-12-31", "Status:: #in-progress", "Priority:: High"],
    },
  ]);

  const kanbanModules = ref<ModulePreset[]>([
    {
      id: "basic-kanban",
      moduleType: "kanban",
      title: "Basic Kanban",
      description: "Create a kanban board with basic columns",
      priority: ModulePriority.SECONDARY,
      content: [
        "---",
        "kanban-plugin: basic",
        "---",
        "",
        "## To Do",
        "- [ ] Task 1",
        "",
        "## In Progress",
        "- [ ] Task 2",
        "",
        "## Done",
        "- [x] Task 3",
      ],
    },
  ]);

  // --- Getters (as plain functions or computed values if needed) ---
  const getYamlPresetById = (id: string) =>
    yamlPresets.value.find((p) => p.id === id);

  const getPluginModules = (pluginType: PluginType) => {
    switch (pluginType) {
      case "templater":
        return templaterModules.value;
      case "dataview":
        return dataviewModules.value;
      case "kanban":
        return kanbanModules.value;
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
      case "kanban":
        kanbanModules.value.push(newModule);
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
    kanbanModules,

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
