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
    {
      id: "basic-list",
      moduleType: "dataviewQuery",
      title: "Notes with Tag",
      description: "List all notes with a specific tag",
      priority: ModulePriority.HIGH,
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
