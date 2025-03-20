/**
 * Utility functions for working with Kanban boards in Obsidian templates
 */

/**
 * Kanban card interface
 */
export interface KanbanCard {
  id: string;
  text: string;
  checked: boolean;
  tags?: string[];
  dueDate?: string;
  description?: string;
  color?: KanbanColor;
}

/**
 * Kanban lane interface
 */
export interface KanbanLane {
  id: string;
  title: string;
  cards: KanbanCard[];
}

/**
 * Kanban board interface
 */
export interface KanbanBoard {
  id: string;
  lanes: KanbanLane[];
  settings: KanbanSettings;
}

/**
 * Kanban plugin settings
 */
export interface KanbanSettings {
  style?: KanbanStyle;
  allowEmpty?: boolean;
  showDateBadges?: boolean;
  hideTagsDisplay?: boolean;
  dateFormat?: string;
  laneWidth?: number;
  showCompletedItems?: boolean;
  addCurvedLines?: boolean;
  customCss?: string;
}

/**
 * Kanban board styles
 */
export enum KanbanStyle {
  BASIC = 'basic',
  STANDARD = 'standard',
  DETAILED = 'detailed',
  COMPACT = 'compact',
  CUSTOM = 'custom'
}

/**
 * Kanban card colors
 */
export enum KanbanColor {
  NONE = 'none',
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
  GRAY = 'gray'
}

/**
 * Kanban board templates
 */
export const KANBAN_BOARD_TEMPLATES: KanbanBoard[] = [
  {
    id: 'basic-todo',
    lanes: [
      {
        id: 'todo',
        title: 'To Do',
        cards: [
          { id: 'card-1', text: 'Task 1', checked: false },
          { id: 'card-2', text: 'Task 2', checked: false },
          { id: 'card-3', text: 'Task 3', checked: false }
        ]
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        cards: [
          { id: 'card-4', text: 'Working on this task', checked: false }
        ]
      },
      {
        id: 'done',
        title: 'Done',
        cards: [
          { id: 'card-5', text: 'Completed task', checked: true }
        ]
      }
    ],
    settings: {
      style: KanbanStyle.BASIC
    }
  },
  {
    id: 'project-management',
    lanes: [
      {
        id: 'backlog',
        title: 'Backlog',
        cards: [
          { id: 'card-1', text: 'Feature idea 1', checked: false },
          { id: 'card-2', text: 'Feature idea 2', checked: false }
        ]
      },
      {
        id: 'planning',
        title: 'Planning',
        cards: [
          { id: 'card-3', text: 'Scope out feature 1', checked: false }
        ]
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        cards: [
          { id: 'card-4', text: 'Implementing core functionality', checked: false, tags: ['priority'] }
        ]
      },
      {
        id: 'testing',
        title: 'Testing',
        cards: []
      },
      {
        id: 'done',
        title: 'Done',
        cards: [
          { id: 'card-5', text: 'Project setup', checked: true }
        ]
      }
    ],
    settings: {
      style: KanbanStyle.DETAILED,
      showDateBadges: true,
      hideTagsDisplay: false,
      dateFormat: 'MM/DD/YYYY'
    }
  },
  {
    id: 'content-creation',
    lanes: [
      {
        id: 'ideas',
        title: 'Ideas',
        cards: [
          { id: 'card-1', text: 'Blog post idea 1', checked: false },
          { id: 'card-2', text: 'Blog post idea 2', checked: false }
        ]
      },
      {
        id: 'drafting',
        title: 'Drafting',
        cards: [
          { id: 'card-3', text: 'Writing first draft', checked: false, tags: ['blog'] }
        ]
      },
      {
        id: 'editing',
        title: 'Editing',
        cards: [
          { id: 'card-4', text: 'Review and revise', checked: false }
        ]
      },
      {
        id: 'published',
        title: 'Published',
        cards: [
          { id: 'card-5', text: 'Introduction post', checked: true, dueDate: '2023-06-15' }
        ]
      }
    ],
    settings: {
      style: KanbanStyle.DETAILED,
      showDateBadges: true,
      hideTagsDisplay: false
    }
  },
  {
    id: 'personal-goals',
    lanes: [
      {
        id: 'quarterly-goals',
        title: 'Quarterly Goals',
        cards: [
          { id: 'card-1', text: 'Learn a new skill', checked: false },
          { id: 'card-2', text: 'Read 5 books', checked: false },
          { id: 'card-3', text: 'Exercise 3x per week', checked: false }
        ]
      },
      {
        id: 'this-month',
        title: 'This Month',
        cards: [
          { id: 'card-4', text: 'Finish online course', checked: false, color: KanbanColor.BLUE }
        ]
      },
      {
        id: 'this-week',
        title: 'This Week',
        cards: [
          { id: 'card-5', text: 'Complete chapter 3', checked: false, color: KanbanColor.YELLOW }
        ]
      },
      {
        id: 'completed',
        title: 'Completed',
        cards: [
          { id: 'card-6', text: 'Set up tracking system', checked: true }
        ]
      }
    ],
    settings: {
      style: KanbanStyle.STANDARD,
      showDateBadges: true
    }
  }
];

/**
 * Generates Kanban board markdown
 * @param board The Kanban board to generate markdown for
 * @returns Markdown representation of the board
 */
export function generateKanbanMarkdown(board: KanbanBoard): string[] {
  const result: string[] = [];
  
  // Generate YAML frontmatter with settings
  result.push('---');
  result.push('kanban-plugin: ' + (board.settings.style === KanbanStyle.BASIC ? 'basic' : 'true'));
  
  if (board.settings.style !== KanbanStyle.BASIC) {
    if (board.settings.dateFormat) {
      result.push(`date-format: ${board.settings.dateFormat}`);
    }
    
    if (board.settings.hideTagsDisplay) {
      result.push('hide-tags-in-title: true');
    }
    
    if (board.settings.laneWidth) {
      result.push(`lane-width: ${board.settings.laneWidth}`);
    }
    
    if (board.settings.showDateBadges === false) {
      result.push('hide-date-in-title: true');
    }
    
    if (board.settings.showCompletedItems === false) {
      result.push('hide-completed-item: true');
    }
    
    if (board.settings.addCurvedLines) {
      result.push('add-curved-line: true');
    }
    
    if (board.settings.customCss) {
      result.push(`kanban-css: ${board.settings.customCss}`);
    }
  }
  
  result.push('---');
  result.push('');
  
  // Generate lanes and cards
  for (const lane of board.lanes) {
    result.push(`## ${lane.title}`);
    result.push('');
    
    for (const card of lane.cards) {
      // Checkbox syntax
      const prefix = card.checked ? '- [x] ' : '- [ ] ';
      let cardText = card.text;
      
      // Add card metadata
      const metadata: string[] = [];
      
      // Add tags
      if (card.tags && card.tags.length > 0) {
        cardText += ' ' + card.tags.map(tag => `#${tag}`).join(' ');
      }
      
      // Add color as CSS class
      if (card.color && card.color !== KanbanColor.NONE) {
        metadata.push(`card-color: ${card.color}`);
      }
      
      // Add due date
      if (card.dueDate) {
        metadata.push(`due: ${card.dueDate}`);
      }
      
      // Add description (using HTML comment syntax that the Kanban plugin recognizes)
      if (card.description) {
        metadata.push(`description: ${card.description.replace(/\n/g, '<br>')}`);
      }
      
      // Add the card line
      let cardLine = prefix + cardText;
      
      // If there are metadata items, add them as HTML comment
      if (metadata.length > 0) {
        cardLine += ` <!--${metadata.join('; ')}-->`;
      }
      
      result.push(cardLine);
    }
    
    // Add an empty line between lanes
    result.push('');
  }
  
  return result;
}

/**
 * Parse Kanban board markdown into a board object
 * @param markdown Array of markdown lines
 * @returns Parsed KanbanBoard object
 */
export function parseKanbanMarkdown(markdown: string[]): KanbanBoard {
  const board: KanbanBoard = {
    id: 'board-' + Date.now().toString(),
    lanes: [],
    settings: {}
  };
  
  let inYamlFrontmatter = false;
  let currentLane: KanbanLane | null = null;
  
  // Parse markdown line by line
  for (let i = 0; i < markdown.length; i++) {
    const line = markdown[i].trim();
    
    // Handle YAML frontmatter
    if (line === '---') {
      inYamlFrontmatter = !inYamlFrontmatter;
      continue;
    }
    
    if (inYamlFrontmatter) {
      // Parse settings
      if (line.startsWith('kanban-plugin:')) {
        const value = line.split(':')[1].trim();
        board.settings.style = value === 'basic' 
          ? KanbanStyle.BASIC 
          : KanbanStyle.STANDARD;
      } else if (line.startsWith('date-format:')) {
        board.settings.dateFormat = line.split(':')[1].trim();
      } else if (line === 'hide-tags-in-title: true') {
        board.settings.hideTagsDisplay = true;
      } else if (line.startsWith('lane-width:')) {
        board.settings.laneWidth = parseInt(line.split(':')[1].trim());
      } else if (line === 'hide-date-in-title: true') {
        board.settings.showDateBadges = false;
      } else if (line === 'hide-completed-item: true') {
        board.settings.showCompletedItems = false;
      } else if (line === 'add-curved-line: true') {
        board.settings.addCurvedLines = true;
      } else if (line.startsWith('kanban-css:')) {
        board.settings.customCss = line.substring('kanban-css:'.length).trim();
      }
      
      continue;
    }
    
    // Handle lane headers
    if (line.startsWith('## ')) {
      const title = line.substring(3).trim();
      currentLane = {
        id: 'lane-' + Date.now() + '-' + board.lanes.length,
        title,
        cards: []
      };
      board.lanes.push(currentLane);
      continue;
    }
    
    // Handle cards
    if (currentLane && (line.startsWith('- [ ]') || line.startsWith('- [x]'))) {
      const checked = line.startsWith('- [x]');
      let text = line.substring(checked ? 6 : 6).trim();
      
      // Extract card metadata from HTML comments
      const metadataMatch = text.match(/<!--(.+?)-->/);
      let metadata = '';
      if (metadataMatch) {
        metadata = metadataMatch[1];
        text = text.replace(/<!--(.+?)-->/, '').trim();
      }
      
      // Extract tags from text
      const tags: string[] = [];
      text = text.replace(/#([a-zA-Z0-9_-]+)/g, (match, tag) => {
        tags.push(tag);
        return '';
      }).trim();
      
      // Create the card
      const card: KanbanCard = {
        id: 'card-' + Date.now() + '-' + currentLane.cards.length,
        text,
        checked,
        tags: tags.length > 0 ? tags : undefined
      };
      
      // Process metadata
      if (metadata) {
        const metadataItems = metadata.split(';').map(item => item.trim());
        
        for (const item of metadataItems) {
          if (item.startsWith('card-color:')) {
            card.color = item.split(':')[1].trim() as KanbanColor;
          } else if (item.startsWith('due:')) {
            card.dueDate = item.split(':')[1].trim();
          } else if (item.startsWith('description:')) {
            card.description = item.substring('description:'.length)
              .trim()
              .replace(/<br>/g, '\n');
          }
        }
      }
      
      currentLane.cards.push(card);
    }
  }
  
  // If we didn't find any lanes, add a default one
  if (board.lanes.length === 0) {
    board.lanes.push({
      id: 'lane-default',
      title: 'To Do',
      cards: []
    });
  }
  
  return board;
}

/**
 * Validates a kanban board structure
 * @param board The board to validate
 * @returns Validation result
 */
export function validateKanbanBoard(board: KanbanBoard): { isValid: boolean; error?: string } {
  // Check if board has lanes
  if (!board.lanes || board.lanes.length === 0) {
    return { isValid: false, error: 'Board must have at least one lane' };
  }
  
  // Check if all lanes have titles
  for (const lane of board.lanes) {
    if (!lane.title || lane.title.trim() === '') {
      return { isValid: false, error: 'All lanes must have titles' };
    }
  }
  
  // Check if all cards have text
  for (const lane of board.lanes) {
    for (const card of lane.cards) {
      if (!card.text || card.text.trim() === '') {
        return { isValid: false, error: `Card in lane "${lane.title}" has no text` };
      }
    }
  }
  
  return { isValid: true };
}

/**
 * Get settings for a specific Kanban style
 * @param style Kanban style
 * @returns Settings object with defaults for the style
 */
export function getKanbanStyleSettings(style: KanbanStyle): KanbanSettings {
  switch (style) {
    case KanbanStyle.BASIC:
      return {
        style: KanbanStyle.BASIC
      };
    case KanbanStyle.STANDARD:
      return {
        style: KanbanStyle.STANDARD,
        showDateBadges: true,
        hideTagsDisplay: false,
        dateFormat: 'YYYY-MM-DD'
      };
    case KanbanStyle.DETAILED:
      return {
        style: KanbanStyle.DETAILED,
        showDateBadges: true,
        hideTagsDisplay: false,
        dateFormat: 'MM/DD/YYYY',
        laneWidth: 300,
        showCompletedItems: true,
        addCurvedLines: true
      };
    case KanbanStyle.COMPACT:
      return {
        style: KanbanStyle.COMPACT,
        showDateBadges: false,
        hideTagsDisplay: true,
        laneWidth: 220,
        showCompletedItems: false
      };
    case KanbanStyle.CUSTOM:
      return {
        style: KanbanStyle.CUSTOM
      };
    default:
      return {
        style: KanbanStyle.STANDARD
      };
  }
}

/**
 * Get color class for Kanban card
 * @param color Card color
 * @returns CSS class name for the color
 */
export function getCardColorClass(color: KanbanColor): string {
  switch (color) {
    case KanbanColor.RED:
      return 'kanban-card--red';
    case KanbanColor.ORANGE:
      return 'kanban-card--orange';
    case KanbanColor.YELLOW:
      return 'kanban-card--yellow';
    case KanbanColor.GREEN:
      return 'kanban-card--green';
    case KanbanColor.BLUE:
      return 'kanban-card--blue';
    case KanbanColor.PURPLE:
      return 'kanban-card--purple';
    case KanbanColor.GRAY:
      return 'kanban-card--gray';
    default:
      return '';
  }
}