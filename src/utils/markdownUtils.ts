import { TemplateSection } from '@/types/TemplateSection';
import { ExportProfile } from '@/types/Editor';

/**
 * Error class for markdown generation errors
 */
export class MarkdownGenerationError extends Error {
  constructor(message: string, public sectionType?: string, public details?: string) {
    super(message);
    this.name = 'MarkdownGenerationError';
  }
}

/**
 * Generates markdown text from an array of template sections with optional export profile
 * @param sections Array of template sections
 * @param exportProfile Export profile to use for generation
 * @returns Markdown string
 * @throws {MarkdownGenerationError} When there's an error generating markdown
 */
export function generateMarkdown(sections: TemplateSection[], exportProfile: ExportProfile = 'full'): string {
  if (!sections || !sections.length) return '';
  
  try {
    // First look for YAML front matter to place at the beginning
    const yamlSection = sections.find(section => section.type === 'yaml');
    
    // Process all other sections (excluding YAML if present)
    const processedSections = sections
      .filter(section => yamlSection ? section !== yamlSection : true)
      .map((section, index) => {
        try {
          return processSection(section, exportProfile);
        } catch (error) {
          // Add context about which section failed
          throw new MarkdownGenerationError(
            `Error processing ${section.type} section at position ${index + 1}`,
            section.type,
            error instanceof Error ? error.message : String(error)
          );
        }
      });
    
    // If there's a YAML section, add it at the beginning
    if (yamlSection) {
      try {
        return processSection(yamlSection, exportProfile) + '\n\n' + processedSections.join('\n\n');
      } catch (error) {
        throw new MarkdownGenerationError(
          'Error processing YAML frontmatter section',
          'yaml',
          error instanceof Error ? error.message : String(error)
        );
      }
    }
    
    // Otherwise just join all sections
    return processedSections.join('\n\n');
  } catch (error) {
    // Re-throw MarkdownGenerationError as is
    if (error instanceof MarkdownGenerationError) {
      throw error;
    }
    
    // Otherwise wrap in our error class
    throw new MarkdownGenerationError(
      'Failed to generate markdown',
      'unknown',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Processes a single section based on the export profile
 * @param section The section to process
 * @param exportProfile The export profile to use
 * @returns Processed markdown content
 */
function processSection(section: TemplateSection, exportProfile: ExportProfile): string {
  // Handle basic sections (no export profile adjustments needed)
  if (['header', 'checklist', 'table', 'text'].includes(section.type)) {
    return section.content.join(section.type === 'text' ? '\n\n' : '\n');
  }
  
  // Special handling for YAML to ensure it has proper --- delimiters
  if (section.type === 'yaml') {
    const content = [...section.content];
    
    // Make sure the content starts and ends with ---
    if (content.length > 0 && content[0].trim() !== '---') {
      content.unshift('---');
    }
    if (content.length > 0 && content[content.length - 1].trim() !== '---') {
      content.push('---');
    }
    
    // If it's empty or only has delimiters, add a placeholder
    if (content.length <= 2) {
      content.splice(1, 0, 'title: Untitled');
    }
    
    return content.join('\n');
  }

  // Handle plugin-specific sections
  switch (section.type) {
    case 'templaterField':
      return processTemplaterField(section, exportProfile);
    
    case 'dataviewQuery':
      return processDataviewQuery(section, exportProfile);
    
    case 'kanban':
      return processKanbanBoard(section, exportProfile);
    
    default:
      return '';
  }
}

/**
 * Processes a Templater field section based on the export profile
 * @param section The templater field section
 * @param exportProfile The export profile
 * @returns Processed markdown content
 */
function processTemplaterField(section: TemplateSection, exportProfile: ExportProfile): string {
  // Always keep the original Templater syntax
  // The display formatting will be handled by MarkdownPreview component
  if (exportProfile === 'templater' || exportProfile === 'full') {
    return section.content.join('\n');
  }

  // For 'plain' and 'dataview' profiles, convert to plain text placeholder
  return section.content.map(line => {
    // Add comments to help the MarkdownPreview component process the field
    
    // Extract any descriptive comments from the Templater field
    const descriptionMatch = line.match(/<%.*?\/\/\s*(.*?)\s*%>/);
    if (descriptionMatch && descriptionMatch[1]) {
      return `[Template placeholder: ${descriptionMatch[1]}]`;
    }
    
    // Try to provide a reasonable placeholder based on Templater function
    if (line.includes('tp.date.now')) {
      return `[Current date]`;
    } else if (line.includes('tp.file.title')) {
      return `[Note title]`;
    } else if (line.includes('tp.file.creation_date')) {
      return `[Creation date]`;
    } else if (line.includes('tp.web.random_quote')) {
      return `[Random quote]`;
    } else if (line.includes('tp.file.cursor')) {
      return ``;  // Cursor position becomes empty in plain markdown
    } else if (line.includes('tp.system.prompt')) {
      return `[User input]`;
    } else if (line.startsWith('<%*')) {
      return `[JavaScript code]`;
    }
    
    // For other Templater functions, try to extract the function name
    const funcMatch = line.match(/tp\.(\w+)\.(\w+)/);
    if (funcMatch) {
      const category = funcMatch[1];
      const func = funcMatch[2];
      return `[${category}: ${func}]`;
    }
    
    // Default placeholder
    return `[Template content]`;
  }).join('\n');
}

/**
 * Processes a Dataview query section based on the export profile
 * @param section The dataview query section
 * @param exportProfile The export profile
 * @returns Processed markdown content
 */
function processDataviewQuery(section: TemplateSection, exportProfile: ExportProfile): string {
  // Only keep Dataview syntax for 'dataview' and 'full' profiles
  if (exportProfile === 'dataview' || exportProfile === 'full') {
    return section.content.join('\n');
  }

  // For 'plain' and 'templater' profiles, convert to a placeholder or comment
  // First, try to understand the query type
  const fullContent = section.content.join('\n');
  let queryType = '';
  let queryDescription = 'Dynamic content';
  
  if (fullContent.match(/LIST|TABLE|TASK|CALENDAR/i)) {
    // Extract the query type and source
    const typeMatch = fullContent.match(/```dataview\s+(LIST|TABLE|TASK|CALENDAR)/i);
    const sourceMatch = fullContent.match(/FROM\s+([^WHERE\s]+)/i);
    
    if (typeMatch) {
      queryType = typeMatch[1].toLowerCase();
    }
    
    if (sourceMatch) {
      const source = sourceMatch[1];
      queryDescription = `${queryType} view of ${source}`;
    }
  }
  
  // Create a descriptive placeholder
  return [
    '> [!note] Dataview Query',
    `> This would display a ${queryDescription} when opened in Obsidian with the Dataview plugin.`,
    '> The actual content will depend on your notes and Dataview configuration.'
  ].join('\n');
}

/**
 * Processes a Kanban board section based on the export profile
 * @param section The kanban board section
 * @param exportProfile The export profile
 * @returns Processed markdown content
 */
function processKanbanBoard(section: TemplateSection, exportProfile: ExportProfile): string {
  // Only keep full Kanban syntax for 'full' profile
  if (exportProfile === 'full') {
    return section.content.join('\n');
  }

  // For all other profiles, convert to a basic checklist or task list
  // Extract the headers and tasks from the Kanban structure
  const result: string[] = [];
  let currentHeader = '';
  
  for (const line of section.content) {
    // Skip YAML frontmatter lines
    if (line.startsWith('---') || line.includes('kanban-plugin')) {
      continue;
    }
    
    // Process section headers (lanes)
    if (line.startsWith('## ')) {
      currentHeader = line;
      result.push(currentHeader);
      result.push('');  // Add a blank line after header
    } 
    // Process tasks
    else if (line.trim().startsWith('- [')) {
      // Keep task items as they are (they're already in markdown format)
      result.push(line);
    }
    // Keep other substantial content
    else if (line.trim() && !line.startsWith('#') && !line.includes('kanban')) {
      result.push(line);
    }
  }
  
  if (result.length === 0) {
    // If we couldn't extract anything useful, create a placeholder
    return '> [!note] Kanban Board\n> This would display as a Kanban board in Obsidian with the Kanban plugin.';
  }
  
  return result.join('\n');
}