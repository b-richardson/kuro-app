import { defineStore } from 'pinia';

// Module priority levels
export enum ModulePriority {
  HIGH = 'high',     // Core MVP modules, essential for basic users
  SECONDARY = 'secondary', // Post-MVP modules, useful but not essential
  LOW = 'low'        // Delay or avoid, complex or limited use-case
}

// Module schema for consistent structure
export interface ModulePreset {
  id: string;
  title: string;
  description: string;
  content: string[];
  priority: ModulePriority;
  sectionType?: string;
}

export const usePresetStore = defineStore('presets', {
  state: () => ({
    // YAML Presets
    yamlPresets: [
      {
        id: 'daily-note',
        title: 'Daily Note',
        description: 'YAML frontmatter for a daily note',
        priority: ModulePriority.HIGH,
        content: [
          '---',
          'date: <% tp.date.now("YYYY-MM-DD") %>',
          'tags: daily-note',
          '---'
        ]
      },
      {
        id: 'meeting-note',
        title: 'Meeting Note',
        description: 'YAML frontmatter for a meeting note',
        priority: ModulePriority.HIGH,
        content: [
          '---',
          'date: <% tp.date.now("YYYY-MM-DD") %>',
          'time: <% tp.date.now("HH:mm") %>',
          'attendees: ',
          'tags: meeting',
          '---'
        ]
      },
      {
        id: 'project-note',
        title: 'Project Note',
        description: 'YAML frontmatter for a project note',
        priority: ModulePriority.SECONDARY,
        content: [
          '---',
          'title: Project Name',
          'date: <% tp.date.now("YYYY-MM-DD") %>',
          'status: planning',
          'tags: [project]',
          '---'
        ]
      }
    ],
    
    // Templater Modules
    templaterModules: [
      {
        id: 'date-field',
        sectionType: 'templaterField',
        title: 'Date Field',
        description: 'Insert a dynamic date field',
        priority: ModulePriority.SECONDARY,
        content: ['<% tp.date.now("YYYY-MM-DD") %>']
      },
      {
        id: 'file-title',
        sectionType: 'templaterField',
        title: 'File Title',
        description: 'Insert the current file title',
        priority: ModulePriority.SECONDARY,
        content: ['<% tp.file.title %>']
      }
    ],
    
    // Dataview Modules
    dataviewModules: [
      {
        id: 'basic-list',
        sectionType: 'dataviewQuery',
        title: 'Notes with Tag',
        description: 'List all notes with a specific tag',
        priority: ModulePriority.HIGH,
        content: [
          '```dataview',
          'LIST',
          'FROM #tag',
          '```'
        ]
      },
      {
        id: 'table-query',
        sectionType: 'dataviewQuery',
        title: 'Table of Notes',
        description: 'Create a table of notes with specific metadata',
        priority: ModulePriority.SECONDARY,
        content: [
          '```dataview',
          'TABLE date, tags',
          'FROM "folder"',
          'SORT date DESC',
          '```'
        ]
      },
      {
        id: 'advanced-query',
        sectionType: 'dataviewQuery',
        title: 'Advanced Query',
        description: 'Create a complex dataview query with filters and grouping',
        priority: ModulePriority.LOW,
        content: [
          '```dataview',
          'TABLE file.cday as Created, file.mday as Modified, length(file.outlinks) as "Outlinks"',
          'FROM "your/folder"',
          'WHERE contains(tags, "#project")',
          'SORT length(file.outlinks) DESC',
          'GROUP BY tags',
          '```'
        ]
      }
    ],
    
    // Kanban Modules
    kanbanModules: [
      {
        id: 'basic-kanban',
        sectionType: 'kanban',
        title: 'Basic Kanban',
        description: 'Create a kanban board with basic columns',
        priority: ModulePriority.SECONDARY,
        content: [
          '---',
          'kanban-plugin: basic',
          '---',
          '',
          '## To Do',
          '',
          '- [ ] Task 1',
          '',
          '## In Progress',
          '',
          '- [ ] Task 2',
          '',
          '## Done',
          '',
          '- [x] Task 3'
        ]
      }
    ]
  }),
  
  getters: {
    // Get YAML preset by ID
    getYamlPresetById: (state) => (id) => {
      return state.yamlPresets.find(preset => preset.id === id);
    },
    
    // Get plugin modules by type
    getPluginModules: (state) => (pluginType) => {
      switch (pluginType) {
        case 'templater':
          return state.templaterModules;
        case 'dataview':
          return state.dataviewModules;
        case 'kanban':
          return state.kanbanModules;
        default:
          return [];
      }
    },
    
    // Get plugin module by ID and type
    getPluginModuleById: (state) => (id, pluginType) => {
      const modules = state.getPluginModules(pluginType);
      return modules.find(module => module.id === id);
    },
    
    // Get presets filtered by priority
    getYamlPresetsByPriority: (state) => (priority: ModulePriority) => {
      return state.yamlPresets.filter(preset => preset.priority === priority);
    },
    
    // Get plugin modules filtered by priority
    getPluginModulesByPriority: (state) => (pluginType, priority: ModulePriority) => {
      const modules = state.getPluginModules(pluginType);
      return modules.filter(module => module.priority === priority);
    },
    
    // Get all high priority modules (for MVP)
    getHighPriorityModules: (state) => {
      const highPriorityYaml = state.yamlPresets.filter(preset => preset.priority === ModulePriority.HIGH);
      
      const highPriorityDataview = state.dataviewModules.filter(
        module => module.priority === ModulePriority.HIGH
      );
      
      // Combine all high priority modules
      return {
        yaml: highPriorityYaml,
        dataview: highPriorityDataview
      };
    }
  },
  
  actions: {
    // Add a custom YAML preset
    addYamlPreset(preset) {
      const newPreset = {
        id: crypto.randomUUID(),
        priority: ModulePriority.SECONDARY, // Default to secondary priority for user-created presets
        ...preset
      };
      
      this.yamlPresets.push(newPreset);
      return newPreset.id;
    },
    
    // Add a custom plugin module
    addPluginModule(module, pluginType) {
      const newModule = {
        id: crypto.randomUUID(),
        priority: ModulePriority.SECONDARY, // Default to secondary priority for user-created modules
        ...module
      };
      
      switch (pluginType) {
        case 'templater':
          this.templaterModules.push(newModule);
          break;
        case 'dataview':
          this.dataviewModules.push(newModule);
          break;
        case 'kanban':
          this.kanbanModules.push(newModule);
          break;
      }
      
      return newModule.id;
    },
    
    // Update priority of a module
    updateModulePriority(moduleId, moduleType, newPriority: ModulePriority) {
      if (moduleType === 'yaml') {
        const module = this.yamlPresets.find(preset => preset.id === moduleId);
        if (module) {
          module.priority = newPriority;
        }
      } else {
        const modules = this.getPluginModules(moduleType);
        const module = modules.find(m => m.id === moduleId);
        if (module) {
          module.priority = newPriority;
        }
      }
    }
  }
});