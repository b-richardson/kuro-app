# Obsidian Editor Component

This component provides a WYSIWYG editor that simulates the Obsidian editing experience, including support for plugin-specific syntax like Templater variables, Dataview queries, and more.

## Key Features

- TipTap-based editor with custom extensions for Obsidian-specific syntax
- Renders plugin syntax natively within the editor
- Seamless transition between editing and preview
- Maintains raw markdown with all plugin syntax intact

## Export Functionality

The ObsidianEditor preserves the raw markdown with all plugin syntax intact. The export feature takes this markdown directly from the editor without any transformation or profile-based processing.

### Why Export Profiles Were Removed

Previously, the application used a complex export profile system that would transform content based on which plugins the user had installed in Obsidian. This system:

1. Added confusion for non-technical users
2. Required understanding of Obsidian plugins
3. Created an unnecessary layer of complexity

Since the ObsidianEditor now provides a WYSIWYG experience that matches Obsidian with plugins already installed, the export profile system became redundant. The markdown from the editor already contains all the necessary syntax, and displaying it exactly as-is is the expected behavior.

A simplified export that takes the raw markdown directly from the editor is more intuitive and aligns with the goal of reducing complexity for non-coding users.

## Implementation Details

The editor uses TipTap with custom extensions:
- ObsidianDataview: Renders Dataview code blocks
- ObsidianTemplateVars: Handles Templater variables
- ObsidianFrontmatter: Manages YAML frontmatter
- ObsidianCallout: Supports Obsidian callouts
- ObsidianLink: Handles Obsidian-style internal links

When content needs to be exported, the raw markdown is accessed directly using:
```javascript
editor.storage.markdown.getMarkdown()
```

This markdown contains all the original syntax and can be used directly for export or copying to the clipboard.