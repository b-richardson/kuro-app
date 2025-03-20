/**
 * Utility functions for Templater syntax in Obsidian templates
 */

/**
 * Template field categories
 */
export enum TemplaterCategory {
  DATE = 'date',
  FILE = 'file',
  SYSTEM = 'system',
  WEB = 'web',
  FRONTMATTER = 'frontmatter',
  SCRIPT = 'script'
}

/**
 * Interface for Templater field definitions
 */
export interface TemplaterField {
  id: string;
  category: TemplaterCategory;
  name: string;
  description: string;
  syntax: string;
  arguments?: TemplaterArgument[];
  example?: string;
}

/**
 * Interface for Templater field arguments
 */
export interface TemplaterArgument {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  default?: string;
  options?: string[];
}

/**
 * Date format options for Templater fields
 */
export const DATE_FORMATS = [
  { value: 'YYYY-MM-DD', label: 'ISO Date (YYYY-MM-DD)' },
  { value: 'MMMM Do, YYYY', label: 'Long Date (January 1st, 2023)' },
  { value: 'MM/DD/YYYY', label: 'US Format (MM/DD/YYYY)' },
  { value: 'DD.MM.YYYY', label: 'European Format (DD.MM.YYYY)' },
  { value: 'ddd MMM D', label: 'Day of Week (Mon Jan 1)' },
  { value: 'HH:mm', label: 'Time (24hr)' },
  { value: 'h:mm A', label: 'Time (12hr)' },
  { value: 'YYYY-MM-DDTHH:mm:ssZ', label: 'ISO Date-Time' }
];

/**
 * Predefined Templater fields
 */
export const TEMPLATER_FIELDS: TemplaterField[] = [
  // Date fields
  {
    id: 'date-now',
    category: TemplaterCategory.DATE,
    name: 'Current Date',
    description: 'Inserts the current date with optional formatting',
    syntax: 'tp.date.now',
    arguments: [{
      name: 'format',
      description: 'Date format using Moment.js syntax',
      type: 'string',
      required: false,
      default: 'YYYY-MM-DD',
      options: DATE_FORMATS.map(f => f.value)
    }, {
      name: 'offset',
      description: 'Days to offset from current date (+ or -)',
      type: 'number',
      required: false
    }],
    example: '<% tp.date.now("YYYY-MM-DD") %>'
  },
  {
    id: 'date-yesterday',
    category: TemplaterCategory.DATE,
    name: 'Yesterday',
    description: 'Inserts yesterday\'s date with optional formatting',
    syntax: 'tp.date.yesterday',
    arguments: [{
      name: 'format',
      description: 'Date format using Moment.js syntax',
      type: 'string',
      required: false,
      default: 'YYYY-MM-DD',
      options: DATE_FORMATS.map(f => f.value)
    }],
    example: '<% tp.date.yesterday("YYYY-MM-DD") %>'
  },
  {
    id: 'date-tomorrow',
    category: TemplaterCategory.DATE,
    name: 'Tomorrow',
    description: 'Inserts tomorrow\'s date with optional formatting',
    syntax: 'tp.date.tomorrow',
    arguments: [{
      name: 'format',
      description: 'Date format using Moment.js syntax',
      type: 'string',
      required: false,
      default: 'YYYY-MM-DD',
      options: DATE_FORMATS.map(f => f.value)
    }],
    example: '<% tp.date.tomorrow("YYYY-MM-DD") %>'
  },
  {
    id: 'date-weekday',
    category: TemplaterCategory.DATE,
    name: 'Weekday',
    description: 'Inserts the name of the current day of the week',
    syntax: 'tp.date.now("dddd")',
    example: '<% tp.date.now("dddd") %>'
  },
  {
    id: 'date-month',
    category: TemplaterCategory.DATE,
    name: 'Month',
    description: 'Inserts the name of the current month',
    syntax: 'tp.date.now("MMMM")',
    example: '<% tp.date.now("MMMM") %>'
  },
  
  // File fields
  {
    id: 'file-title',
    category: TemplaterCategory.FILE,
    name: 'File Title',
    description: 'Inserts the title of the current file (without extension)',
    syntax: 'tp.file.title',
    example: '<% tp.file.title %>'
  },
  {
    id: 'file-creation-date',
    category: TemplaterCategory.FILE,
    name: 'Creation Date',
    description: 'Inserts the creation date of the current file',
    syntax: 'tp.file.creation_date',
    arguments: [{
      name: 'format',
      description: 'Date format using Moment.js syntax',
      type: 'string',
      required: false,
      default: 'YYYY-MM-DD',
      options: DATE_FORMATS.map(f => f.value)
    }],
    example: '<% tp.file.creation_date("YYYY-MM-DD") %>'
  },
  {
    id: 'file-last-modified-date',
    category: TemplaterCategory.FILE,
    name: 'Last Modified Date',
    description: 'Inserts the last modified date of the current file',
    syntax: 'tp.file.last_modified_date',
    arguments: [{
      name: 'format',
      description: 'Date format using Moment.js syntax',
      type: 'string',
      required: false,
      default: 'YYYY-MM-DD',
      options: DATE_FORMATS.map(f => f.value)
    }],
    example: '<% tp.file.last_modified_date("YYYY-MM-DD") %>'
  },
  {
    id: 'file-folder',
    category: TemplaterCategory.FILE,
    name: 'Folder',
    description: 'Inserts the folder path of the current file',
    syntax: 'tp.file.folder',
    arguments: [{
      name: 'relative',
      description: 'Whether to use a relative path',
      type: 'boolean',
      required: false,
      default: 'false'
    }],
    example: '<% tp.file.folder() %>'
  },
  {
    id: 'file-path',
    category: TemplaterCategory.FILE,
    name: 'File Path',
    description: 'Inserts the full path of the current file',
    syntax: 'tp.file.path',
    arguments: [{
      name: 'relative',
      description: 'Whether to use a relative path',
      type: 'boolean',
      required: false,
      default: 'false'
    }],
    example: '<% tp.file.path() %>'
  },
  {
    id: 'file-tags',
    category: TemplaterCategory.FILE,
    name: 'File Tags',
    description: 'Inserts a comma-separated list of tags in the current file',
    syntax: 'tp.file.tags',
    example: '<% tp.file.tags %>'
  },
  
  // System fields
  {
    id: 'system-clipboard',
    category: TemplaterCategory.SYSTEM,
    name: 'Clipboard',
    description: 'Inserts the current content of the clipboard',
    syntax: 'tp.system.clipboard',
    example: '<% tp.system.clipboard() %>'
  },
  {
    id: 'file-selection',
    category: TemplaterCategory.SYSTEM,
    name: 'Selection',
    description: 'Inserts the currently selected text',
    syntax: 'tp.file.selection',
    example: '<% tp.file.selection() %>'
  },
  {
    id: 'file-cursor',
    category: TemplaterCategory.SYSTEM,
    name: 'Cursor Position',
    description: 'Sets the cursor position after template insertion',
    syntax: 'tp.file.cursor',
    arguments: [{
      name: 'order',
      description: 'The order when multiple cursors are inserted',
      type: 'number',
      required: false,
      default: '1'
    }],
    example: '<% tp.file.cursor(1) %>'
  },
  {
    id: 'system-prompt',
    category: TemplaterCategory.SYSTEM,
    name: 'User Prompt',
    description: 'Prompts the user for input',
    syntax: 'tp.system.prompt',
    arguments: [{
      name: 'prompt_text',
      description: 'Text to display in the prompt',
      type: 'string',
      required: true
    }, {
      name: 'default_value',
      description: 'Default value for the prompt',
      type: 'string',
      required: false
    }],
    example: '<% tp.system.prompt("Enter a value", "default") %>'
  },
  {
    id: 'system-suggester',
    category: TemplaterCategory.SYSTEM,
    name: 'Suggester',
    description: 'Shows a dropdown of options for the user to select',
    syntax: 'tp.system.suggester',
    arguments: [{
      name: 'text_items',
      description: 'Array of text items to show',
      type: 'string',
      required: true
    }, {
      name: 'value_items',
      description: 'Array of values for the items',
      type: 'string',
      required: true
    }],
    example: '<% tp.system.suggester(["Option 1", "Option 2"], ["value1", "value2"]) %>'
  },
  
  // Web fields
  {
    id: 'web-random-quote',
    category: TemplaterCategory.WEB,
    name: 'Random Quote',
    description: 'Inserts a random quote',
    syntax: 'tp.web.random_quote',
    example: '<% tp.web.random_quote() %>'
  },
  {
    id: 'web-daily-quote',
    category: TemplaterCategory.WEB,
    name: 'Daily Quote',
    description: 'Inserts the quote of the day',
    syntax: 'tp.web.daily_quote',
    example: '<% tp.web.daily_quote() %>'
  },
  
  // Frontmatter fields
  {
    id: 'frontmatter',
    category: TemplaterCategory.FRONTMATTER,
    name: 'Frontmatter Value',
    description: 'Retrieves a value from the note\'s frontmatter',
    syntax: 'tp.frontmatter',
    arguments: [{
      name: 'key',
      description: 'The frontmatter key to retrieve',
      type: 'string',
      required: true
    }],
    example: '<% tp.frontmatter.title %>'
  }
];

/**
 * Common Templater script snippets
 */
export const TEMPLATER_SNIPPETS = [
  {
    id: 'format-date',
    name: 'Format Date',
    description: 'Format a date using moment.js',
    code: `// Format a date using moment.js
const moment = window.moment;
const date = moment('2023-01-01');
return date.format('YYYY-MM-DD');`
  },
  {
    id: 'random-item',
    name: 'Random Item from Array',
    description: 'Select a random item from an array',
    code: `// Select a random item from an array
const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
const randomIndex = Math.floor(Math.random() * items.length);
return items[randomIndex];`
  },
  {
    id: 'weekly-note',
    name: 'Weekly Note Generator',
    description: 'Generate a week number and date range',
    code: `// Generate a week number and date range
const moment = window.moment;
const now = moment();
const weekNumber = now.week();
const weekStart = now.startOf('week').format('YYYY-MM-DD');
const weekEnd = now.endOf('week').format('YYYY-MM-DD');
return \`Week \${weekNumber}: \${weekStart} to \${weekEnd}\`;`
  },
  {
    id: 'heading-links',
    name: 'Generate Heading Links',
    description: 'Generate links to all headings in the current note',
    code: `// Generate links to headings
const tR = tp.file.content;
const headings = tR.match(/^#+\\s+(.+)$/gm);
if (!headings) return "No headings found";

let result = "## Table of Contents\\n";
headings.forEach(heading => {
  const title = heading.replace(/^#+\\s+/, '');
  const link = title.replace(/\\s+/g, '-').toLowerCase();
  const level = heading.match(/^#+/)[0].length - 1;
  const indent = '  '.repeat(level);
  result += \`\${indent}- [\${title}](#\${link})\\n\`;
});
return result;`
  }
];

/**
 * Generate Templater syntax for a field
 * @param fieldId The ID of the field
 * @param args Arguments for the field
 * @returns The generated Templater syntax
 */
export function generateTemplaterSyntax(fieldId: string, args: Record<string, any>): string {
  // Find the field definition
  const field = TEMPLATER_FIELDS.find(f => f.id === fieldId);
  if (!field) return '';
  
  // Generate the function call
  let syntax = field.syntax;
  
  // Handle arguments
  if (field.arguments && field.arguments.length > 0) {
    const argValues = field.arguments.map(arg => {
      const value = args[arg.name];
      if (value === undefined) {
        return arg.default || '';
      }
      
      // Format based on argument type
      if (arg.type === 'string') {
        return `"${value}"`;
      } else {
        return value;
      }
    });
    
    // Clean up empty arguments
    const cleanArgs = argValues.filter(arg => arg !== '');
    
    // Add parentheses and arguments
    if (cleanArgs.length > 0) {
      syntax = `${syntax}(${cleanArgs.join(', ')})`;
    } else if (!syntax.includes('(')) {
      syntax = `${syntax}()`;
    }
  }
  
  // Wrap in Templater syntax
  return `<% ${syntax} %>`;
}

/**
 * Generate Templater syntax for a script
 * @param code The JavaScript code to execute
 * @returns The generated Templater syntax
 */
export function generateTemplaterScriptSyntax(code: string): string {
  // Wrap multiline code in <%* and %>
  return `<%*\n${code}\n%>`;
}

/**
 * Validate Templater syntax
 * @param syntax The Templater syntax to validate
 * @returns Validation result and error message if invalid
 */
export function validateTemplaterSyntax(syntax: string): { isValid: boolean; error?: string } {
  // Check for balanced <% and %> tags
  const openingTags = (syntax.match(/<%/g) || []).length;
  const closingTags = (syntax.match(/%>/g) || []).length;
  
  if (openingTags !== closingTags) {
    return { 
      isValid: false, 
      error: `Unbalanced Templater tags: ${openingTags} opening tags, ${closingTags} closing tags` 
    };
  }
  
  // Check for basic syntax errors in each Templater block
  const templaterBlocks = syntax.match(/<%[\s\S]*?%>/g) || [];
  
  for (const block of templaterBlocks) {
    // Check for script blocks
    if (block.startsWith('<%*')) {
      // Script blocks can contain any JavaScript, so we don't validate them further
      continue;
    }
    
    // Regular Templater blocks should have valid function calls
    const content = block.slice(2, -2).trim();
    if (!content.match(/^tp\.\w+/) && !content.match(/^[a-zA-Z0-9_]+\(/)) {
      return {
        isValid: false,
        error: `Invalid Templater syntax: "${content}" does not appear to be a valid Templater function`
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Get a display name for a Templater field value
 * @param syntax The Templater syntax
 * @returns User-friendly display text
 */
export function getTemplaterDisplayText(syntax: string): string {
  // Remove Templater tags
  let content = syntax.replace(/<%|%>/g, '').trim();
  
  // Handle script blocks
  if (content.startsWith('*')) {
    return '[Custom JavaScript]';
  }
  
  // Try to match to a known field
  for (const field of TEMPLATER_FIELDS) {
    if (content.startsWith(field.syntax)) {
      return field.name;
    }
  }
  
  // Default fallback
  return content.length > 30 ? content.substring(0, 27) + '...' : content;
}