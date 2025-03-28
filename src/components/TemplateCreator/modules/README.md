# Modules Organization

This directory contains the template module components organized by type.

## Structure

```
/modules/
  /core/              # Core module functionality and shared utilities
    BaseModule.vue    # Base component all modules inherit from
    moduleUtils.ts    # Common utility functions
    moduleTypes.ts    # Type definitions
    moduleStyles.css  # Shared CSS styles
    ToastPlaceholder.vue # Temporary toast implementation
  
  /content/           # Basic content modules
    TextModule.vue    # Text paragraphs
    HeaderModule.vue  # Heading elements
    ChecklistModule.vue # Checklists and to-do items
    TableModule.vue   # Markdown tables
  
  /plugins/           # Plugin-specific modules
    /dataview/        # Dataview plugin modules
      DataviewModule.vue
      InlineDataviewFieldsModule.vue
    
    /templater/       # Templater plugin modules
      TemplaterModule.vue
    
    /yaml/            # YAML frontmatter
      YamlModule.vue
    
    /kanban/          # Kanban boards
      KanbanModule.vue
    
    /common/          # Shared plugin utilities
```

## Module System

Modules follow these patterns:

1. All modules extend `BaseModule.vue`
2. Modules use shared utilities from `moduleUtils.ts`
3. Common styling is imported from `moduleStyles.css`
4. Type definitions are in `moduleTypes.ts`

## Toast Implementation

Toast notifications are temporarily implemented using console logging via the `createToastPlaceholder` function. This will be replaced with a proper notification system in the future.

## Usage

When creating a new module:

1. Determine if it's a content module or plugin-specific module
2. Place it in the appropriate directory
3. Extend BaseModule
4. Use shared utilities and styles
5. For plugin-specific modules, group related ones in their appropriate plugin folder