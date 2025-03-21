<template>
  <div class="markdown-preview">
    <div class="markdown-preview__header">
      <div class="markdown-preview__title-container">
        <h2 class="markdown-preview__title">Preview</h2>
      </div>
      
      <div class="preview-controls">
        <!-- View mode selector dropdown -->
        <div class="dropdown">
          <button 
            class="dropdown-trigger glass-button" 
            @click.stop="toggleViewModeMenu"
            title="Change view mode"
          >
            <span>{{ currentViewMode }}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="dropdown-menu" v-if="showViewModeMenu">
            <div 
              class="dropdown-item"
              :class="{ active: currentViewMode === 'Rendered' }"
              @click="setViewMode('Rendered')"
            >
              <i class="fas fa-eye"></i>
              Rendered
            </div>
            <div 
              class="dropdown-item"
              :class="{ active: currentViewMode === 'Markdown' }"
              @click="setViewMode('Markdown')"
            >
              <i class="fas fa-code"></i>
              Markdown
            </div>
            <div 
              class="dropdown-item"
              :class="{ active: currentViewMode === 'Source' }"
              @click="setViewMode('Source')"
            >
              <i class="fas fa-file-code"></i>
              Source
            </div>
          </div>
        </div>
        
        <!-- Profile selector dropdown -->
        <div class="dropdown">
          <button 
            class="dropdown-trigger glass-button" 
            @click.stop="toggleProfileMenu"
            title="Change export profile"
          >
            <span class="profile-badge" :class="`profile-${exportProfile}`">
              {{ getProfileDisplayName(exportProfile) }}
            </span>
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="dropdown-menu" v-if="showProfileMenu">
            <div 
              v-for="profile in exportProfiles" 
              :key="profile.id"
              class="dropdown-item"
              :class="{ active: exportProfile === profile.id }"
              @click="setExportProfile(profile.id)"
            >
              <i :class="profile.icon"></i>
              {{ profile.name }}
            </div>
          </div>
        </div>
        
        <!-- Plugin syntax toggles dropdown -->
        <div class="dropdown">
          <button 
            class="dropdown-trigger glass-button" 
            @click.stop="togglePluginMenu"
            title="Toggle plugin syntax"
          >
            <span>Plugins</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="dropdown-menu" v-if="showPluginMenu">
            <div 
              class="dropdown-item"
              :class="{ active: showTemplaterSyntax }"
              @click="showTemplaterSyntax = !showTemplaterSyntax"
            >
              <i class="fas fa-bolt"></i>
              <span>Templater Syntax</span>
              <span class="toggle-indicator">{{ showTemplaterSyntax ? 'On' : 'Off' }}</span>
            </div>
            <div 
              class="dropdown-item"
              :class="{ active: showDataviewSyntax }"
              @click="showDataviewSyntax = !showDataviewSyntax"
            >
              <i class="fas fa-database"></i>
              <span>Dataview Syntax</span>
              <span class="toggle-indicator">{{ showDataviewSyntax ? 'On' : 'Off' }}</span>
            </div>
            <div 
              class="dropdown-item"
              :class="{ active: showKanbanSyntax }"
              @click="showKanbanSyntax = !showKanbanSyntax"
            >
              <i class="fas fa-columns"></i>
              <span>Kanban Syntax</span>
              <span class="toggle-indicator">{{ showKanbanSyntax ? 'On' : 'Off' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Focus button - Pass to parent component -->
        <button 
          class="panel-action-button"
          @click="emitFocusMode"
          title="Toggle focus mode"
        >
          <i class="fas fa-expand"></i>
        </button>
      </div>
    </div>
    
    <div class="markdown-preview__content">
      <div v-if="sections.length === 0" class="markdown-preview__empty">
        <p>Your template preview will appear here</p>
      </div>
      
      <div v-else-if="showSource" class="markdown-preview__source">
        <pre><code v-if="showTemplaterSyntax || showDataviewSyntax || showKanbanSyntax" v-html="highlightSyntax(markdownText)"></code>
        <code v-else>{{ markdownText }}</code></pre>
      </div>
      
      <div v-else class="markdown-preview__rendered" v-html="renderedMarkdown"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import { TemplateSection } from '@/types/TemplateSection';
import { generateMarkdown } from '@/utils/markdownUtils';
import { ExportProfileId } from './ExportProfileSelector.vue';

// Define props
const props = defineProps<{
  sections: TemplateSection[];
  exportProfile?: ExportProfileId;
}>();

// Define emits
const emit = defineEmits(['update:exportProfile', 'focus-mode']);

// Dropdown state variables
const showViewModeMenu = ref(false);
const showProfileMenu = ref(false);
const showPluginMenu = ref(false);
const currentViewMode = ref('Rendered'); // Options: 'Rendered', 'Markdown', 'Source'

// Export profiles data for dropdown
const exportProfiles = [
  { id: 'plain', name: 'Plain Markdown', icon: 'fas fa-file-alt' },
  { id: 'templater', name: 'Templater', icon: 'fas fa-bolt' },
  { id: 'dataview', name: 'Dataview', icon: 'fas fa-database' },
  { id: 'full', name: 'Full Plugin Suite', icon: 'fas fa-puzzle-piece' },
];

// Plugin syntax toggle options
const showTemplaterSyntax = ref(false);
const showDataviewSyntax = ref(false);
const showKanbanSyntax = ref(false);

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});

// Toggle between rendered and source view
const showSource = ref(false);

// Use provided export profile or default to full
const exportProfile = computed<ExportProfileId>(() => {
  return props.exportProfile || 'full';
});

// Dropdown toggle methods
const toggleViewModeMenu = () => {
  showViewModeMenu.value = !showViewModeMenu.value;
  if (showViewModeMenu.value) {
    showProfileMenu.value = false;
    showPluginMenu.value = false;
  }
};

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
  if (showProfileMenu.value) {
    showViewModeMenu.value = false;
    showPluginMenu.value = false;
  }
};

const togglePluginMenu = () => {
  showPluginMenu.value = !showPluginMenu.value;
  if (showPluginMenu.value) {
    showViewModeMenu.value = false;
    showProfileMenu.value = false;
  }
};

// Selection and action methods
const setViewMode = (mode) => {
  currentViewMode.value = mode;
  showViewModeMenu.value = false;
  
  // Update the view based on selection
  if (mode === 'Rendered') {
    showSource.value = false;
  } else if (mode === 'Markdown' || mode === 'Source') {
    showSource.value = true;
  }
};

const setExportProfile = (profileId) => {
  emit('update:exportProfile', profileId);
  showProfileMenu.value = false;
};

const emitFocusMode = () => {
  emit('focus-mode');
};

// Close all dropdowns when clicking outside
const closeAllDropdowns = () => {
  showViewModeMenu.value = false;
  showProfileMenu.value = false;
  showPluginMenu.value = false;
};

// Add event listener for clicks outside dropdown
if (typeof window !== 'undefined') {
  window.addEventListener('click', (event) => {
    if (!(event.target as Element).closest('.dropdown')) {
      closeAllDropdowns();
    }
  });
}

// Generate markdown text from sections with current export profile
const markdownText = computed(() => {
  return generateMarkdown(props.sections, exportProfile.value);
});

// Process Templater, Dataview, and Kanban syntax based on toggle states
const processedMarkdownText = computed(() => {
  let processedText = markdownText.value;
  
  // Step 1: Process Templater syntax if the toggle is off
  if (!showTemplaterSyntax.value) {
    // Replace Templater script blocks (<%* ... %>)
    processedText = processedText.replace(/<%\*[\s\S]*?%>/g, (match) => {
      return '<span class="templater-script-placeholder">Custom JavaScript</span>';
    });
    
    // Replace standard Templater fields (<% ... %>)
    processedText = processedText.replace(/<%[\s\S]*?%>/g, (match) => {
      // Try to extract meaningful info from the Templater syntax
      const content = match.slice(2, -2).trim();
      
      // Handle common Templater functions
      if (content.startsWith('tp.date.now')) {
        return '<span class="templater-field-placeholder">Date</span>';
      } else if (content.startsWith('tp.file.title')) {
        return '<span class="templater-field-placeholder">File Title</span>';
      } else if (content.startsWith('tp.file.creation_date')) {
        return '<span class="templater-field-placeholder">Creation Date</span>';
      } else if (content.startsWith('tp.system.prompt')) {
        return '<span class="templater-field-placeholder">User Input</span>';
      } else if (content.startsWith('tp.file.cursor')) {
        return '<span class="templater-cursor-placeholder">⏐</span>';
      } else if (content.includes('tp.')) {
        // Generic Templater field
        const functionName = content.match(/tp\.\w+\.\w+/)?.[0]?.split('.')?.[2] || 'field';
        return `<span class="templater-field-placeholder">${functionName}</span>`;
      }
      
      // Fallback for unrecognized syntax
      return '<span class="templater-field-placeholder">Dynamic Content</span>';
    });
  }
  
  // Step 2: Process Dataview syntax if the toggle is off
  if (!showDataviewSyntax.value) {
    // Replace Dataview code blocks with placeholders
    processedText = processedText.replace(/```dataview\s*([\s\S]*?)```/g, (match, content) => {
      // Determine query type
      let queryType = 'LIST';
      let title = 'Dynamic List';
      let icon = 'fas fa-list';
      
      if (content.trim().startsWith('TABLE')) {
        queryType = 'TABLE';
        title = 'Data Table';
        icon = 'fas fa-table';
      } else if (content.trim().startsWith('TASK')) {
        queryType = 'TASK';
        title = 'Task List';
        icon = 'fas fa-tasks';
      } else if (content.trim().startsWith('CALENDAR')) {
        queryType = 'CALENDAR';
        title = 'Calendar View';
        icon = 'fas fa-calendar-alt';
      }
      
      // Extract source if possible
      let source = '';
      const fromMatch = content.match(/FROM\s+([^WHERE\s]+)/i);
      if (fromMatch && fromMatch[1]) {
        source = fromMatch[1].trim();
        if (source.startsWith('"') && source.endsWith('"')) {
          source = source.slice(1, -1);
        }
        if (source) {
          source = ` from ${source}`;
        }
      }
      
      return `<div class="dataview-query-placeholder dataview-query-${queryType.toLowerCase()}">
        <div class="dataview-query-placeholder__header">
          <i class="${icon}"></i> ${title}${source}
        </div>
        <div class="dataview-query-placeholder__content">
          <p>This would display a ${queryType.toLowerCase()} of data when opened in Obsidian with the Dataview plugin.</p>
        </div>
      </div>`;
    });
    
    // Replace inline Dataview syntax with placeholders
    processedText = processedText.replace(/`\$\{dv\.(table|list|task|calendar)[\s\S]*?\}`/gi, (match, type) => {
      const queryType = type.toUpperCase();
      const title = 
        queryType === 'TABLE' ? 'Inline Table' : 
        queryType === 'TASK' ? 'Inline Tasks' : 
        queryType === 'CALENDAR' ? 'Inline Calendar' : 'Inline List';
      
      return `<span class="dataview-inline-placeholder">${title}</span>`;
    });
  }
  
  // Step 3: Process Kanban syntax if the toggle is off
  if (!showKanbanSyntax.value) {
    // We'll need to detect and replace the kanban board structure
    // This is a complex pattern that spans multiple lines
    
    // First, identify potential kanban boards by looking for YAML frontmatter with kanban settings
    const lines = processedText.split('\n');
    let kanbanBoardSections = [];
    let inYamlFrontmatter = false;
    let yamlStart = -1;
    let yamlEnd = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Track YAML frontmatter
      if (line === '---') {
        if (!inYamlFrontmatter) {
          yamlStart = i;
          inYamlFrontmatter = true;
        } else {
          yamlEnd = i;
          inYamlFrontmatter = false;
          
          // Check if this YAML block contains kanban settings
          let isKanbanBoard = false;
          for (let j = yamlStart + 1; j < yamlEnd; j++) {
            if (lines[j].includes('kanban-plugin:')) {
              isKanbanBoard = true;
              break;
            }
          }
          
          if (isKanbanBoard) {
            // Find where this kanban board ends (next YAML block or end of content)
            let boardEnd = lines.length - 1;
            for (let j = yamlEnd + 1; j < lines.length; j++) {
              if (lines[j].trim() === '---') {
                boardEnd = j - 1;
                break;
              }
            }
            
            kanbanBoardSections.push({
              start: yamlStart,
              end: boardEnd
            });
          }
        }
      }
    }
    
    // Now replace each kanban board with a placeholder
    for (let i = kanbanBoardSections.length - 1; i >= 0; i--) {
      const section = kanbanBoardSections[i];
      const boardContent = lines.slice(section.start, section.end + 1);
      
      // Count lanes and cards
      let laneCount = 0;
      let cardCount = 0;
      let boardStyle = 'basic';
      
      // Determine board style
      for (let j = 0; j < boardContent.length; j++) {
        const line = boardContent[j].trim();
        if (line.startsWith('kanban-plugin:')) {
          boardStyle = line.includes('basic') ? 'basic' : 'detailed';
        } else if (line.startsWith('## ')) {
          laneCount++;
        } else if (line.startsWith('- [') && line.includes(']')) {
          cardCount++;
        }
      }
      
      // Create the placeholder HTML
      const placeholder = `<div class="kanban-board-placeholder kanban-board-${boardStyle}">
        <div class="kanban-board-placeholder__header">
          <i class="fas fa-columns"></i> Kanban Board
        </div>
        <div class="kanban-board-placeholder__content">
          <p>This would display a kanban board with ${laneCount} lanes and ${cardCount} cards when opened in Obsidian with the Kanban plugin.</p>
        </div>
      </div>`;
      
      // Replace the board in the original text
      lines.splice(section.start, section.end - section.start + 1, placeholder);
    }
    
    // Join the lines back together
    processedText = lines.join('\n');
  }
  
  return processedText;
});

// Render markdown to HTML
const renderedMarkdown = computed(() => {
  return md.render(processedMarkdownText.value);
});

/**
 * Highlights Templater, Dataview, and Kanban syntax in the source view for better visibility
 */
const highlightSyntax = (text: string): string => {
  if (!text) return '';
  
  // Escape HTML to prevent XSS
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  // Escape the entire text first
  let escapedText = escapeHtml(text);
  
  // Handle different syntax highlighting based on active toggles
  if (showTemplaterSyntax.value) {
    // Split the text into parts for more controlled highlighting of Templater syntax
    const parts = escapedText.split(/(&lt;%\*[\s\S]*?%&gt;|&lt;%[\s\S]*?%&gt;)/g);
    
    // Process each part
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // Skip empty parts
      if (!part) continue;
      
      // Check if it's a script block
      if (part.startsWith('&lt;%*')) {
        parts[i] = `<span class="templater-syntax templater-script">${part}</span>`;
      }
      // Check if it's a standard field block
      else if (part.startsWith('&lt;%')) {
        parts[i] = `<span class="templater-syntax templater-field">${part}</span>`;
      }
      // Otherwise, leave as is
    }
    
    // Join the parts back together
    escapedText = parts.join('');
  }
  
  if (showDataviewSyntax.value) {
    // Highlight Dataview code blocks
    escapedText = escapedText.replace(/(```dataview[\s\S]*?```)/g, 
      '<span class="dataview-syntax dataview-block">$1</span>');
    
    // Highlight inline Dataview syntax
    escapedText = escapedText.replace(/(`\$\{dv\.(table|list|task|calendar)[\s\S]*?\}`)/gi, 
      '<span class="dataview-syntax dataview-inline">$1</span>');
  }
  
  if (showKanbanSyntax.value) {
    // Kanban highlighting requires a different approach since it spans multiple lines
    // and has a more complex structure
    
    // Split text into lines for processing
    const lines = escapedText.split('\n');
    let inKanbanYaml = false;
    let kanbanYamlStart = -1;
    
    // First, find and highlight the YAML frontmatter containing kanban settings
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim() === '---') {
        if (!inKanbanYaml) {
          kanbanYamlStart = i;
          inKanbanYaml = true;
        } else {
          // End of YAML block, check if it was a kanban block
          let isKanbanBlock = false;
          for (let j = kanbanYamlStart + 1; j < i; j++) {
            if (lines[j].includes('kanban-plugin:')) {
              isKanbanBlock = true;
              break;
            }
          }
          
          if (isKanbanBlock) {
            // Highlight the entire YAML block
            for (let j = kanbanYamlStart; j <= i; j++) {
              // Special highlighting for specific kanban settings
              if (lines[j].includes('kanban-plugin:')) {
                lines[j] = `<span class="kanban-syntax kanban-setting-primary">${lines[j]}</span>`;
              } else if (lines[j].includes('date-format:') || 
                         lines[j].includes('hide-tags-in-title:') ||
                         lines[j].includes('lane-width:')) {
                lines[j] = `<span class="kanban-syntax kanban-setting">${lines[j]}</span>`;
              } else {
                lines[j] = `<span class="kanban-syntax kanban-yaml">${lines[j]}</span>`;
              }
            }
          }
          
          inKanbanYaml = false;
        }
      } else if (inKanbanYaml && line.includes('kanban-plugin:')) {
        // Mark this as confirmed kanban YAML
        lines[i] = `<span class="kanban-syntax kanban-setting-primary">${line}</span>`;
      }
    }
    
    // Now highlight lane headers and card items
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Highlight lane headers
      if (line.trim().startsWith('## ')) {
        lines[i] = `<span class="kanban-syntax kanban-lane">${line}</span>`;
      }
      // Highlight cards
      else if (line.trim().match(/^- \[[x ]\]/i)) {
        // Further highlight checked vs unchecked items
        if (line.includes('- [x]') || line.includes('- [X]')) {
          lines[i] = `<span class="kanban-syntax kanban-card kanban-card-checked">${line}</span>`;
        } else {
          lines[i] = `<span class="kanban-syntax kanban-card">${line}</span>`;
        }
      }
    }
    
    // Join back into a string
    escapedText = lines.join('\n');
  }
  
  return escapedText;
};

/**
 * Gets a display name for the profile
 */
const getProfileDisplayName = (profile: ExportProfileId): string => {
  switch (profile) {
    case 'plain':
      return 'Plain Markdown';
    case 'templater':
      return 'Templater Format';
    case 'dataview':
      return 'Dataview Format';
    case 'full':
      return 'Full Plugin Format';
    default:
      return 'Markdown';
  }
};
</script>

<style scoped>
.markdown-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.markdown-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.markdown-preview__title-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.markdown-preview__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-primary, #4f46e5);
}

/* Preview controls styling */
.preview-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.5rem);
}

/* Dropdown styling */
.dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 0.25rem);
  padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-sm, 4px);
  color: var(--color-text, #f8fafc);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s);
}

.dropdown-trigger:hover {
  background: rgba(255, 255, 255, 0.12);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 200px;
  background: rgba(30, 30, 46, 0.95);
  backdrop-filter: blur(var(--glass-blur, 10px));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-md, 6px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.dropdown-item {
  padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 0.75rem);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.5rem);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s);
}

.dropdown-item i {
  width: 16px;
  text-align: center;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item.active {
  background: rgba(255, 171, 88, 0.15);
  color: var(--color-primary, #ffab58);
}

.toggle-indicator {
  margin-left: auto;
  font-size: 0.75rem;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
}

.panel-action-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.6));
  cursor: pointer;
  padding: var(--spacing-xs, 0.25rem);
  border-radius: var(--radius-sm, 4px);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast, 0.15s);
}

.panel-action-button:hover {
  background: var(--glass-background, rgba(255, 255, 255, 0.05));
  color: var(--color-text, #f8fafc);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Profile badge styling */
.profile-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
}

.profile-plain {
  background: rgba(100, 116, 139, 0.2);
  color: rgb(100, 116, 139);
}

.profile-templater {
  background: rgba(6, 182, 212, 0.2);
  color: rgb(6, 182, 212);
}

.profile-dataview {
  background: rgba(139, 92, 246, 0.2);
  color: rgb(139, 92, 246);
}

.profile-full {
  background: rgba(79, 70, 229, 0.2);
  color: rgb(79, 70, 229);
}

.markdown-preview__content {
  flex: 1;
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 10px;
  overflow: auto;
  padding: 1.5rem;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.markdown-preview__empty {
  color: #94a3b8;
  text-align: center;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.markdown-preview__empty:before {
  content: "👀";
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.markdown-preview__source {
  font-family: 'Fira Code', 'Courier New', monospace;
  white-space: pre-wrap;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #334155;
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.markdown-preview__rendered {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #334155;
}

.markdown-preview__rendered :deep(h1) {
  font-size: 1.875rem;
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: #1e293b;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 0.5rem;
}

.markdown-preview__rendered :deep(h2) {
  font-size: 1.5rem;
  margin-top: 1.75rem;
  margin-bottom: 0.875rem;
  color: #1e293b;
}

.markdown-preview__rendered :deep(h3) {
  font-size: 1.25rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1e293b;
}

.markdown-preview__rendered :deep(h4) {
  font-size: 1.125rem;
  margin-top: 1.25rem;
  margin-bottom: 0.625rem;
  color: #1e293b;
}

.markdown-preview__rendered :deep(h5) {
  font-size: 1rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.markdown-preview__rendered :deep(h6) {
  font-size: 0.875rem;
  margin-top: 0.875rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.markdown-preview__rendered :deep(p) {
  margin-top: 0;
  margin-bottom: 1.25rem;
}

.markdown-preview__rendered :deep(ul), 
.markdown-preview__rendered :deep(ol) {
  margin-top: 0;
  margin-bottom: 1.25rem;
  padding-left: 1.75rem;
}

.markdown-preview__rendered :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-preview__rendered :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.markdown-preview__rendered :deep(th), 
.markdown-preview__rendered :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  text-align: left;
}

.markdown-preview__rendered :deep(th) {
  background-color: #f8fafc;
  font-weight: 600;
  color: #334155;
}

.markdown-preview__rendered :deep(tr:nth-child(even)) {
  background-color: #f8fafc;
}

.markdown-preview__rendered :deep(code) {
  font-family: 'Fira Code', 'Courier New', monospace;
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.875em;
  color: #4f46e5;
}

.markdown-preview__rendered :deep(pre) {
  background-color: #f8fafc;
  padding: 1.25rem;
  border-radius: 8px;
  overflow: auto;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.markdown-preview__rendered :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: #334155;
}

.markdown-preview__rendered :deep(blockquote) {
  border-left: 4px solid #e2e8f0;
  padding-left: 1rem;
  margin-left: 0;
  color: #64748b;
}

.markdown-preview__rendered :deep(hr) {
  border: none;
  border-top: 2px solid #f1f5f9;
  margin: 2rem 0;
}

.markdown-preview__rendered :deep(input[type="checkbox"]) {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
  accent-color: #4f46e5;
}

/* Templater field placeholders */
.markdown-preview__rendered :deep(.templater-field-placeholder) {
  display: inline-flex;
  align-items: center;
  background-color: #ecfeff;
  color: #0891b2;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px dashed #a5f3fc;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 500;
  white-space: nowrap;
  margin: 0 0.125rem;
}

.markdown-preview__rendered :deep(.templater-field-placeholder)::before {
  content: "⚡";
  margin-right: 0.375rem;
  font-size: 0.75rem;
}

.markdown-preview__rendered :deep(.templater-script-placeholder) {
  display: inline-block;
  background-color: #f5f3ff;
  color: #7c3aed;
  font-size: 0.875rem;
  padding: 0.375rem 0.625rem;
  border-radius: 4px;
  border: 1px dashed #c4b5fd;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 500;
  margin: 0.5rem 0;
}

.markdown-preview__rendered :deep(.templater-script-placeholder)::before {
  content: "📝 ";
  margin-right: 0.25rem;
}

.markdown-preview__rendered :deep(.templater-cursor-placeholder) {
  display: inline-block;
  background-color: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  font-weight: bold;
  padding: 0 0.25rem;
  animation: cursor-blink 1s infinite;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Dataview query placeholders */
.markdown-preview__rendered :deep(.dataview-query-placeholder) {
  background-color: #f0fdf4;
  border: 1px dashed #86efac;
  border-radius: 6px;
  margin: 1.5rem 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.markdown-preview__rendered :deep(.dataview-query-placeholder__header) {
  background-color: #dcfce7;
  padding: 0.75rem 1rem;
  color: #166534;
  font-weight: 600;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.9375rem;
  border-bottom: 1px dashed #86efac;
}

.markdown-preview__rendered :deep(.dataview-query-placeholder__content) {
  padding: 1rem;
  color: #374151;
  font-size: 0.875rem;
}

.markdown-preview__rendered :deep(.dataview-query-placeholder__content p) {
  margin: 0;
}

.markdown-preview__rendered :deep(.dataview-query-table) {
  background-color: #f0f9ff;
  border-color: #93c5fd;
}

.markdown-preview__rendered :deep(.dataview-query-table .dataview-query-placeholder__header) {
  background-color: #dbeafe;
  color: #1e40af;
  border-color: #93c5fd;
}

.markdown-preview__rendered :deep(.dataview-query-task) {
  background-color: #fef3c7;
  border-color: #fcd34d;
}

.markdown-preview__rendered :deep(.dataview-query-task .dataview-query-placeholder__header) {
  background-color: #fde68a;
  color: #92400e;
  border-color: #fcd34d;
}

.markdown-preview__rendered :deep(.dataview-query-calendar) {
  background-color: #fae8ff;
  border-color: #e879f9;
}

.markdown-preview__rendered :deep(.dataview-query-calendar .dataview-query-placeholder__header) {
  background-color: #f5d0fe;
  color: #86198f;
  border-color: #e879f9;
}

.markdown-preview__rendered :deep(.dataview-inline-placeholder) {
  display: inline-flex;
  align-items: center;
  background-color: #f0fdf4;
  color: #166534;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px dashed #86efac;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 500;
  white-space: nowrap;
  margin: 0 0.125rem;
}

.markdown-preview__rendered :deep(.dataview-inline-placeholder)::before {
  content: "🔍";
  margin-right: 0.375rem;
  font-size: 0.75rem;
}

/* Templater and Dataview syntax highlighting in source view */
.markdown-preview__source pre code :deep(.templater-syntax) {
  color: #4f46e5;
  font-weight: 500;
}

.markdown-preview__source pre code :deep(.templater-script) {
  color: #7c3aed;
  background-color: rgba(245, 243, 255, 0.5);
  padding: 0 2px;
  border-radius: 2px;
}

.markdown-preview__source pre code :deep(.templater-field) {
  color: #0891b2;
  background-color: rgba(236, 254, 255, 0.5);
  padding: 0 2px;
  border-radius: 2px;
}

.markdown-preview__source pre code :deep(.dataview-syntax) {
  color: #15803d;
  font-weight: 500;
}

.markdown-preview__source pre code :deep(.dataview-block) {
  display: block;
  background-color: rgba(240, 253, 244, 0.5);
  border: 1px solid rgba(134, 239, 172, 0.3);
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0.5rem 0;
}

.markdown-preview__source pre code :deep(.dataview-inline) {
  background-color: rgba(240, 253, 244, 0.5);
  padding: 0 2px;
  border-radius: 2px;
}

/* Kanban syntax highlighting */
.markdown-preview__source pre code :deep(.kanban-syntax) {
  color: #8b5cf6;
  font-weight: 500;
}

.markdown-preview__source pre code :deep(.kanban-setting-primary) {
  color: #7c3aed;
  background-color: rgba(245, 243, 255, 0.5);
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 600;
}

.markdown-preview__source pre code :deep(.kanban-setting) {
  color: #9333ea;
  background-color: rgba(245, 243, 255, 0.3);
  padding: 0 2px;
  border-radius: 2px;
}

.markdown-preview__source pre code :deep(.kanban-yaml) {
  color: #a78bfa;
}

.markdown-preview__source pre code :deep(.kanban-lane) {
  color: #6d28d9;
  font-weight: 600;
  background-color: rgba(245, 243, 255, 0.4);
  padding: 0 2px;
  border-radius: 2px;
  display: block;
  margin-top: 0.5rem;
}

.markdown-preview__source pre code :deep(.kanban-card) {
  color: #8b5cf6;
  padding: 0 2px;
  border-radius: 2px;
  display: block;
  margin-left: 1rem;
}

.markdown-preview__source pre code :deep(.kanban-card-checked) {
  color: #a78bfa;
  text-decoration: line-through;
  opacity: 0.8;
}

/* Kanban board placeholder in rendered view */
.markdown-preview__rendered :deep(.kanban-board-placeholder) {
  background-color: #f5f3ff;
  border: 1px dashed #c4b5fd;
  border-radius: 6px;
  margin: 1.5rem 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.markdown-preview__rendered :deep(.kanban-board-placeholder__header) {
  background-color: #ede9fe;
  padding: 0.75rem 1rem;
  color: #6d28d9;
  font-weight: 600;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.9375rem;
  border-bottom: 1px dashed #c4b5fd;
}

.markdown-preview__rendered :deep(.kanban-board-placeholder__content) {
  padding: 1rem;
  color: #374151;
  font-size: 0.875rem;
}

.markdown-preview__rendered :deep(.kanban-board-placeholder__content p) {
  margin: 0;
}

.markdown-preview__rendered :deep(.kanban-board-detailed) {
  background-color: #faf5ff;
  border-color: #d8b4fe;
}

.markdown-preview__rendered :deep(.kanban-board-detailed .kanban-board-placeholder__header) {
  background-color: #f3e8ff;
  color: #7e22ce;
  border-color: #d8b4fe;
}

/* Toggle button text and styling */
.templater-btn-text, 
.dataview-btn-text,
.kanban-btn-text {
  font-size: 0.8125rem;
}

/* Special styling for the Dataview button */
.markdown-preview__dataview-btn {
  margin-left: 0.5rem;
  border-left: 1px solid #e2e8f0;
  color: #15803d;
}

.markdown-preview__dataview-btn:hover {
  color: #166534;
  background-color: #f0fdf4;
}

.markdown-preview__dataview-btn.markdown-preview__toggle-btn--active {
  background-color: #f0fdf4;
  color: #15803d;
  border-color: #86efac;
}

/* Special styling for the Kanban button */
.markdown-preview__kanban-btn {
  margin-left: 0.5rem;
  border-left: 1px solid #e2e8f0;
  color: #8b5cf6;
}

.markdown-preview__kanban-btn:hover {
  color: #7c3aed;
  background-color: #f5f3ff;
}

.markdown-preview__kanban-btn.markdown-preview__toggle-btn--active {
  background-color: #f5f3ff;
  color: #8b5cf6;
  border-color: #c4b5fd;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .markdown-preview__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .markdown-preview__toggle {
    align-self: flex-end;
  }
  
  .markdown-preview__content {
    padding: 1rem;
  }
  
  .templater-btn-text,
  .dataview-btn-text,
  .kanban-btn-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .markdown-preview__toggle-btn {
    padding: 0.5rem 0.625rem;
    font-size: 0.75rem;
  }
  
  .markdown-preview__toggle-btn i {
    margin-right: 0.25rem;
  }
  
  .markdown-preview__rendered :deep(h1) {
    font-size: 1.5rem;
  }
  
  .markdown-preview__rendered :deep(h2) {
    font-size: 1.25rem;
  }
  
  .markdown-preview__rendered :deep(table) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>