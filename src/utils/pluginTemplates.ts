import { PluginType, SectionType } from '@/types/TemplateSection';

/**
 * Constants for Templater plugin
 */
export const TEMPLATER = {
  // Common Templater date formats
  DATE_FORMATS: {
    STANDARD: 'YYYY-MM-DD',
    US: 'MM/DD/YYYY',
    EUROPE: 'DD.MM.YYYY',
    FULL: 'dddd, MMMM Do YYYY',
    ISO: 'YYYY-MM-DDTHH:mm:ssZ',
  },
  // Commonly used Templater variable functions
  VARIABLES: {
    CURRENT_DATE: '<% tp.date.now() %>',
    CURRENT_DATE_FORMATTED: '<% tp.date.now("YYYY-MM-DD") %>',
    YESTERDAY: '<% tp.date.yesterday() %>',
    TOMORROW: '<% tp.date.tomorrow() %>',
    TITLE: '<% tp.file.title %>',
    CREATED_DATE: '<% tp.file.creation_date() %>',
    CURSOR_POSITION: '<% tp.file.cursor() %>'
  },
  // Common snippets
  SNIPPETS: {
    RANDOM_QUOTE: '<% tp.web.random_quote() %>',
    WEATHER: '<% tp.web.daily_weather("CITY_NAME") %>'
  }
};

/**
 * Constants for Dataview plugin
 */
export const DATAVIEW = {
  // Query types
  QUERY_TYPES: {
    LIST: 'list',
    TABLE: 'table',
    TASK: 'task',
    CALENDAR: 'calendar'
  },
  // Common dataview queries
  QUERIES: {
    RECENT_NOTES: '```dataview\nLIST\nFROM "" WHERE file.cday >= date(today) - dur(7 days)\nSORT file.cday DESC\n```',
    PROJECT_TASKS: '```dataview\nTASK\nFROM #project\nWHERE !completed\n```',
    LINKED_MENTIONS: '```dataview\nLIST\nFROM [[]]  \nSORT file.name ASC\n```',
    TAG_TABLE: '```dataview\nTABLE file.cday as Created, file.mday as Modified\nFROM #tag\nSORT file.name ASC\n```'
  }
};

/**
 * Constants for Kanban plugin
 */
export const KANBAN = {
  // Basic kanban board structure
  DEFAULT_BOARD: [
    '---',
    'kanban-plugin: basic',
    '---',
    '',
    '## Todo',
    '',
    '- [ ] Task 1',
    '- [ ] Task 2',
    '',
    '## In Progress',
    '',
    '- [ ] Task 3',
    '',
    '## Done',
    '',
    '- [x] Completed task'
  ].join('\n'),
  // Kanban settings in YAML
  SETTINGS: {
    DEFAULT: 'kanban-plugin: basic',
    DETAILED: [
      'kanban-plugin: true',
      'date-display-format: MM/DD/YYYY',
      'hide-tags-in-title: true',
      'lane-width: 300'
    ].join('\n')
  }
};

/**
 * Validates plugin-specific syntax based on plugin type and content
 * @param pluginType The plugin type to validate
 * @param content The content to validate
 * @returns An object with isValid flag and potential error message
 */
export function validatePluginSyntax(pluginType: PluginType, content: string[]): { isValid: boolean; error?: string } {
  if (!pluginType) {
    return { isValid: true };
  }

  switch (pluginType) {
    case 'templater':
      return validateTemplaterSyntax(content);
    case 'dataview':
      return validateDataviewSyntax(content);
    case 'kanban':
      return validateKanbanSyntax(content);
    default:
      return { isValid: true };
  }
}

/**
 * Validates Templater syntax in content
 */
function validateTemplaterSyntax(content: string[]): { isValid: boolean; error?: string } {
  // Check for balanced <% and %> tags
  const fullContent = content.join('\n');
  const openTags = (fullContent.match(/<%/g) || []).length;
  const closeTags = (fullContent.match(/%>/g) || []).length;

  if (openTags !== closeTags) {
    return {
      isValid: false,
      error: `Unbalanced Templater tags: found ${openTags} opening tags and ${closeTags} closing tags`
    };
  }

  return { isValid: true };
}

/**
 * Validates Dataview syntax in content
 */
function validateDataviewSyntax(content: string[]): { isValid: boolean; error?: string } {
  // Check for dataview code blocks
  const fullContent = content.join('\n');
  if (!fullContent.includes('```dataview') || !fullContent.includes('```')) {
    return {
      isValid: false,
      error: 'Dataview query must be inside a dataview code block'
    };
  }

  return { isValid: true };
}

/**
 * Validates Kanban syntax in content
 */
function validateKanbanSyntax(content: string[]): { isValid: boolean; error?: string } {
  // Kanban requires YAML frontmatter with kanban-plugin property
  if (!content.some(line => line.includes('kanban-plugin'))) {
    return {
      isValid: false,
      error: 'Kanban board must include kanban-plugin in YAML frontmatter'
    };
  }

  // Check for at least one section header
  if (!content.some(line => line.startsWith('## '))) {
    return {
      isValid: false,
      error: 'Kanban board must have at least one section (## Section)'
    };
  }

  return { isValid: true };
}

/**
 * Generates default template content for a given section type and plugin
 * @param sectionType Type of section to generate
 * @param pluginType Associated plugin type (if applicable)
 * @returns Array of strings with default content
 */
export function generateDefaultContent(sectionType: SectionType, pluginType: PluginType = null): string[] {
  switch (sectionType) {
    case 'yaml':
      return [
        '---',
        'title: Untitled Note',
        'created: ' + new Date().toISOString().split('T')[0],
        'tags: []',
        '---'
      ];
    
    case 'templaterField':
      return [TEMPLATER.VARIABLES.CURRENT_DATE_FORMATTED];
    
    case 'dataviewQuery':
      return DATAVIEW.QUERIES.RECENT_NOTES.split('\n');
    
    case 'kanban':
      return KANBAN.DEFAULT_BOARD.split('\n');
    
    // Basic section types (existing types)
    case 'header':
      return ['# New Header'];
    
    case 'checklist':
      return ['- [ ] First item', '- [ ] Second item', '- [ ] Third item'];
    
    case 'table':
      return [
        '| Header 1 | Header 2 | Header 3 |',
        '|----------|----------|----------|',
        '| Cell 1   | Cell 2   | Cell 3   |',
        '| Cell 4   | Cell 5   | Cell 6   |'
      ];
    
    case 'text':
      return ['Enter your text here...'];
    
    default:
      return [''];
  }
}

/**
 * Gets the display name for a plugin type
 * @param pluginType The plugin type
 * @returns A user-friendly display name
 */
export function getPluginDisplayName(pluginType: PluginType): string {
  switch (pluginType) {
    case 'templater':
      return 'Templater';
    case 'dataview':
      return 'Dataview';
    case 'kanban':
      return 'Kanban';
    default:
      return '';
  }
}

/**
 * Gets the icon class for a section type
 * @param sectionType The section type
 * @returns Font Awesome icon class
 */
export function getSectionIcon(sectionType: SectionType): string {
  switch (sectionType) {
    case 'header':
      return 'fas fa-heading';
    case 'checklist':
      return 'fas fa-check-square';
    case 'table':
      return 'fas fa-table';
    case 'text':
      return 'fas fa-align-left';
    case 'yaml':
      return 'fas fa-code';
    case 'templaterField':
      return 'fas fa-calendar-alt';
    case 'dataviewQuery':
      return 'fas fa-database';
    case 'kanban':
      return 'fas fa-columns';
    default:
      return 'fas fa-file-alt';
  }
}