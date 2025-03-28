# Export Components

The export components in this directory provide simple functionality to download and export markdown templates for use in Obsidian.

## Simplified Export Process

The export functionality has been simplified to directly use the raw markdown from the ObsidianEditor component without applying any export profiles or transformations.

### Why Export Profiles Were Removed

Previously, the application used a complex export profile system that would transform content based on which plugins the user had installed in Obsidian. This system:

1. Added confusion for non-technical users
2. Required understanding of Obsidian plugins 
3. Created an unnecessary layer of complexity

Since the ObsidianEditor component now provides a WYSIWYG experience that matches Obsidian with plugins already installed, the export profile system became redundant. The markdown from the editor already contains all the necessary syntax, and exporting it exactly as-is is the expected behavior.

A simplified export system that takes the raw markdown directly from the editor is more intuitive and aligns with the goal of reducing complexity for non-coding users.

## Implementation Details

The export functionality now follows these simplified steps:

1. When a user clicks the export button, the raw markdown is generated from the template sections
2. The user can specify a filename for the downloaded file
3. The markdown is downloaded directly as a .md file

This approach ensures that what you see in the editor is exactly what you get in the exported file, without any transformations or profile-specific processing.