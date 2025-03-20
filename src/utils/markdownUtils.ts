import { TemplateSection } from '@/types/TemplateSection';

/**
 * Generates markdown text from an array of template sections
 */
export function generateMarkdown(sections: TemplateSection[]): string {
  if (!sections.length) return '';
  
  return sections.map(section => {
    // Each section type has its own conversion logic
    switch (section.type) {
      case 'header':
        // Headers are already in markdown format
        return section.content.join('\n');
        
      case 'checklist':
        // Checklists are already in markdown format
        return section.content.join('\n');
        
      case 'table':
        // Tables are already in markdown format
        return section.content.join('\n');
        
      case 'text':
        // Simple text, just join with newlines
        return section.content.join('\n\n');
        
      default:
        return '';
    }
  }).join('\n\n');
}