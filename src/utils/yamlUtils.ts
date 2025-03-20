/**
 * Utility functions for YAML front matter handling in templates
 */

/**
 * Common frontmatter fields for Obsidian notes
 */
export interface YamlFrontMatter {
  [key: string]: any;
  title?: string;
  tags?: string[];
  aliases?: string[];
  cssclass?: string[];
  created?: string;
  modified?: string;
  [key: string]: any;
}

/**
 * Data type types supported in YAML frontmatter
 */
export type YamlValueType = 'string' | 'array' | 'boolean' | 'date' | 'number' | 'object';

/**
 * Metadata for YAML fields, used for UI rendering
 */
export interface YamlFieldMetadata {
  key: string;
  label: string;
  description: string;
  type: YamlValueType;
  isPluginSpecific?: boolean;
  pluginName?: string;
}

/**
 * Definition of a YAML preset for templates
 */
export interface YamlPreset {
  id: string;
  name: string;
  description: string;
  frontmatter: YamlFrontMatter;
  fields: YamlFieldMetadata[];
}

/**
 * Commonly used YAML frontmatter fields
 */
export const commonYamlFields: YamlFieldMetadata[] = [
  {
    key: 'title',
    label: 'Title',
    description: 'The title of the note',
    type: 'string'
  },
  {
    key: 'tags',
    label: 'Tags',
    description: 'List of tags for categorization',
    type: 'array'
  },
  {
    key: 'aliases',
    label: 'Aliases',
    description: 'Alternative names for this note',
    type: 'array'
  },
  {
    key: 'cssclass',
    label: 'CSS Classes',
    description: 'Custom CSS classes for styling',
    type: 'array'
  },
  {
    key: 'created',
    label: 'Created Date',
    description: 'When this note was created',
    type: 'date'
  },
  {
    key: 'modified',
    label: 'Modified Date',
    description: 'When this note was last modified',
    type: 'date'
  },
  {
    key: 'publish',
    label: 'Publish',
    description: 'Whether to publish this note',
    type: 'boolean'
  }
];

/**
 * Plugin-specific YAML fields
 */
export const pluginYamlFields: YamlFieldMetadata[] = [
  // Dataview
  {
    key: 'completed',
    label: 'Completed',
    description: 'Whether a task is completed (for Dataview)',
    type: 'boolean',
    isPluginSpecific: true,
    pluginName: 'dataview'
  },
  {
    key: 'due',
    label: 'Due Date',
    description: 'When a task is due (for Dataview)',
    type: 'date',
    isPluginSpecific: true,
    pluginName: 'dataview'
  },
  {
    key: 'priority',
    label: 'Priority',
    description: 'Priority level (for Dataview)',
    type: 'number',
    isPluginSpecific: true,
    pluginName: 'dataview'
  },
  
  // Kanban
  {
    key: 'kanban-plugin',
    label: 'Kanban',
    description: 'Enable Kanban board in this note',
    type: 'boolean',
    isPluginSpecific: true,
    pluginName: 'kanban'
  },
  
  // Obsidian Publish
  {
    key: 'publish',
    label: 'Publish',
    description: 'Whether to publish this note with Obsidian Publish',
    type: 'boolean',
    isPluginSpecific: true,
    pluginName: 'publish'
  },
  {
    key: 'permalink',
    label: 'Permalink',
    description: 'Custom permalink for Obsidian Publish',
    type: 'string',
    isPluginSpecific: true,
    pluginName: 'publish'
  }
];

/**
 * YAML presets for different note types
 */
export const yamlPresets: YamlPreset[] = [
  // Basic Note
  {
    id: 'basic',
    name: 'Basic Note',
    description: 'Simple note with minimal frontmatter',
    frontmatter: {
      title: '',
      tags: []
    },
    fields: [
      {
        key: 'title',
        label: 'Title',
        description: 'The title of the note',
        type: 'string'
      },
      {
        key: 'tags',
        label: 'Tags',
        description: 'List of tags for categorization',
        type: 'array'
      }
    ]
  },
  
  // Daily Note
  {
    id: 'daily',
    name: 'Daily Note',
    description: 'Template for daily notes/journal entries',
    frontmatter: {
      title: 'Daily Note - <% tp.date.now("YYYY-MM-DD") %>',
      tags: ['daily-note'],
      created: '<% tp.date.now("YYYY-MM-DD") %>',
      date: '<% tp.date.now("YYYY-MM-DD") %>'
    },
    fields: [
      {
        key: 'title',
        label: 'Title',
        description: 'The title of the note',
        type: 'string'
      },
      {
        key: 'tags',
        label: 'Tags',
        description: 'List of tags for categorization',
        type: 'array'
      },
      {
        key: 'created',
        label: 'Created Date',
        description: 'When this note was created',
        type: 'date'
      },
      {
        key: 'date',
        label: 'Date',
        description: 'The date this daily note represents',
        type: 'date'
      }
    ]
  },
  
  // Project Note
  {
    id: 'project',
    name: 'Project Note',
    description: 'Template for project documentation',
    frontmatter: {
      title: 'Project: ',
      tags: ['project'],
      status: 'planning', // planning, active, on-hold, completed
      start_date: '<% tp.date.now("YYYY-MM-DD") %>',
      due_date: '',
      completion: 0,
      aliases: []
    },
    fields: [
      {
        key: 'title',
        label: 'Title',
        description: 'The title of the note',
        type: 'string'
      },
      {
        key: 'tags',
        label: 'Tags',
        description: 'List of tags for categorization',
        type: 'array'
      },
      {
        key: 'status',
        label: 'Status',
        description: 'Current project status',
        type: 'string'
      },
      {
        key: 'start_date',
        label: 'Start Date',
        description: 'When the project started',
        type: 'date'
      },
      {
        key: 'due_date',
        label: 'Due Date',
        description: 'When the project is due',
        type: 'date'
      },
      {
        key: 'completion',
        label: 'Completion',
        description: 'Percentage of completion',
        type: 'number'
      },
      {
        key: 'aliases',
        label: 'Aliases',
        description: 'Alternative names for this project',
        type: 'array'
      }
    ]
  },
  
  // Meeting Note
  {
    id: 'meeting',
    name: 'Meeting Note',
    description: 'Template for meeting notes',
    frontmatter: {
      title: 'Meeting: ',
      tags: ['meeting'],
      date: '<% tp.date.now("YYYY-MM-DD") %>',
      time: '<% tp.date.now("HH:mm") %>',
      attendees: [],
      meeting_type: 'discussion'
    },
    fields: [
      {
        key: 'title',
        label: 'Title',
        description: 'The title of the note',
        type: 'string'
      },
      {
        key: 'tags',
        label: 'Tags',
        description: 'List of tags for categorization',
        type: 'array'
      },
      {
        key: 'date',
        label: 'Date',
        description: 'When the meeting occurred',
        type: 'date'
      },
      {
        key: 'time',
        label: 'Time',
        description: 'What time the meeting occurred',
        type: 'string'
      },
      {
        key: 'attendees',
        label: 'Attendees',
        description: 'People who attended the meeting',
        type: 'array'
      },
      {
        key: 'meeting_type',
        label: 'Meeting Type',
        description: 'Type of meeting',
        type: 'string'
      }
    ]
  },
  
  // Literature Note
  {
    id: 'literature',
    name: 'Literature Note',
    description: 'Template for literature/book notes',
    frontmatter: {
      title: '',
      tags: ['literature'],
      author: '',
      year: '',
      source: '',
      status: 'to-read' // to-read, reading, completed
    },
    fields: [
      {
        key: 'title',
        label: 'Title',
        description: 'The title of the note',
        type: 'string'
      },
      {
        key: 'tags',
        label: 'Tags',
        description: 'List of tags for categorization',
        type: 'array'
      },
      {
        key: 'author',
        label: 'Author',
        description: 'Author of the work',
        type: 'string'
      },
      {
        key: 'year',
        label: 'Year',
        description: 'Publication year',
        type: 'number'
      },
      {
        key: 'source',
        label: 'Source',
        description: 'Where you found this book/article',
        type: 'string'
      },
      {
        key: 'status',
        label: 'Reading Status',
        description: 'Current reading status',
        type: 'string'
      }
    ]
  },
  
  // Dataview Task Note
  {
    id: 'dataview-task',
    name: 'Dataview Task',
    description: 'Template with Dataview task fields',
    frontmatter: {
      title: 'Task: ',
      tags: ['task'],
      due: '<% tp.date.now("YYYY-MM-DD") %>',
      priority: 3, // 1-5 scale
      completed: false,
      status: 'todo' // todo, in-progress, waiting, done
    },
    fields: [
      {
        key: 'title',
        label: 'Title',
        description: 'The title of the note',
        type: 'string'
      },
      {
        key: 'tags',
        label: 'Tags',
        description: 'List of tags for categorization',
        type: 'array'
      },
      {
        key: 'due',
        label: 'Due Date',
        description: 'When this task is due',
        type: 'date',
        isPluginSpecific: true,
        pluginName: 'dataview'
      },
      {
        key: 'priority',
        label: 'Priority',
        description: 'Task priority (1-5)',
        type: 'number',
        isPluginSpecific: true,
        pluginName: 'dataview'
      },
      {
        key: 'completed',
        label: 'Completed',
        description: 'Whether this task is completed',
        type: 'boolean',
        isPluginSpecific: true,
        pluginName: 'dataview'
      },
      {
        key: 'status',
        label: 'Status',
        description: 'Current task status',
        type: 'string',
        isPluginSpecific: true,
        pluginName: 'dataview'
      }
    ]
  }
];

/**
 * Returns a YAML preset by ID
 * @param presetId The ID of the preset to find
 * @returns The YAML preset or undefined if not found
 */
export function getPresetById(presetId: string): YamlPreset | undefined {
  return yamlPresets.find(preset => preset.id === presetId);
}

/**
 * Converts a string value to its proper type based on the specified YAML value type
 * @param value The string value to convert
 * @param type The YAML value type
 * @returns The converted value
 */
export function convertValueByType(value: string, type: YamlValueType): any {
  if (!value) {
    return type === 'array' ? [] : type === 'boolean' ? false : type === 'number' ? 0 : '';
  }
  
  switch (type) {
    case 'array':
      try {
        // Check if it's a JSON array string
        if (value.startsWith('[') && value.endsWith(']')) {
          return JSON.parse(value);
        }
        // Otherwise, split by commas
        return value.split(',').map(item => item.trim()).filter(Boolean);
      } catch (e) {
        return [value];
      }
    case 'boolean':
      return value.toLowerCase() === 'true';
    case 'number':
      return isNaN(Number(value)) ? 0 : Number(value);
    case 'date':
      // Keep date strings as is
      return value;
    default:
      return value;
  }
}

/**
 * Formats a value based on its type
 * @param value The value to format
 * @param type The type of the value
 * @returns The formatted value string
 */
export function formatValueForYaml(value: any, type: YamlValueType): string {
  if (value === undefined || value === null) {
    return '';
  }
  
  switch (type) {
    case 'array':
      if (Array.isArray(value)) {
        // Format as YAML array
        if (value.length === 0) {
          return '[]';
        }
        return value.map(item => `\n  - ${item}`).join('');
      }
      return '';
    case 'boolean':
      return value ? 'true' : 'false';
    case 'object':
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return '';
      }
    default:
      return String(value);
  }
}

/**
 * Parses YAML content lines into a structured object
 * @param lines Array of YAML front matter lines (without the --- markers)
 * @returns Parsed YAML object
 */
export function parseYamlLines(lines: string[]): YamlFrontMatter {
  const result: YamlFrontMatter = {};
  
  for (const line of lines) {
    // Skip empty lines and the YAML markers
    if (!line.trim() || line.trim() === '---') continue;
    
    // Extract key and value
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        // Try parsing as JSON array
        result[key] = JSON.parse(value);
      } catch (e) {
        // Fallback to simple string if JSON parse fails
        result[key] = value;
      }
    } 
    // Parse multi-line arrays
    else if (line.endsWith(':') && lines.some(l => l.trim().startsWith('- ') && l.indexOf(key) > 0)) {
      const arrayItems: string[] = [];
      let i = lines.indexOf(line) + 1;
      
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        arrayItems.push(lines[i].trim().substring(2));
        i++;
      }
      
      result[key] = arrayItems;
    }
    // Parse booleans
    else if (value.toLowerCase() === 'true') {
      result[key] = true;
    }
    else if (value.toLowerCase() === 'false') {
      result[key] = false;
    }
    // Parse numbers
    else if (!isNaN(Number(value)) && value !== '') {
      result[key] = Number(value);
    }
    // Keep strings as is
    else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Convert a YAML object to array of lines
 * @param yaml The YAML object to convert
 * @returns Array of YAML lines
 */
export function yamlObjectToLines(yaml: YamlFrontMatter): string[] {
  const lines: string[] = [];
  
  // Start YAML frontmatter
  lines.push('---');
  
  // Add each property
  for (const [key, value] of Object.entries(yaml)) {
    if (Array.isArray(value)) {
      // Multi-line array
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        value.forEach(item => lines.push(`  - ${item}`));
      }
    } else if (typeof value === 'object' && value !== null) {
      // Handle nested objects
      lines.push(`${key}:`);
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        lines.push(`  ${nestedKey}: ${nestedValue}`);
      }
    } else {
      // Simple key-value
      lines.push(`${key}: ${value}`);
    }
  }
  
  // End YAML frontmatter
  lines.push('---');
  
  return lines;
}

/**
 * Validates YAML syntax for a string array
 * @param lines Array of YAML front matter lines
 * @returns Validation result
 */
export function validateYamlSyntax(lines: string[]): { isValid: boolean; error?: string } {
  // Basic validation - we could integrate a full YAML parser if needed
  try {
    for (const line of lines) {
      // Skip empty lines and YAML markers
      if (!line.trim() || line.trim() === '---') continue;
      
      // Check for basic syntax errors
      if (!line.includes(':') && !line.trim().startsWith('- ')) {
        return { 
          isValid: false, 
          error: `Invalid YAML syntax: Missing colon in line "${line}"` 
        };
      }
    }
    
    // Ensure that keys are unique
    const keys = new Set<string>();
    for (const line of lines) {
      if (line.includes(':') && !line.trim().startsWith('-') && !line.trim().startsWith(' ')) {
        const key = line.substring(0, line.indexOf(':')).trim();
        if (keys.has(key)) {
          return { 
            isValid: false, 
            error: `Duplicate key in YAML: "${key}"` 
          };
        }
        keys.add(key);
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: `YAML validation error: ${(error as Error).message}` 
    };
  }
}