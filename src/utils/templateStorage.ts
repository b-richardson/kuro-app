/**
 * Utility functions for template storage and management
 */
import { v4 as uuidv4 } from 'uuid';
import { TemplateSection } from '@/types/TemplateSection';
import { ExportProfileId } from '@/components/TemplateCreator/ExportProfileSelector.vue';

// Local storage keys
const TEMPLATES_STORAGE_KEY = 'obsidian-template-creator-templates';

/**
 * Represents a saved template with metadata
 */
export interface SavedTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  sections: TemplateSection[];
  exportProfile: ExportProfileId;
}

/**
 * Interface for template metadata (without the sections content)
 */
export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Saves a template to localStorage
 * @param name Template name
 * @param description Template description
 * @param sections Template sections
 * @param exportProfile Export profile used
 * @param id Optional template ID (for updates)
 * @returns ID of the saved template
 */
export function saveTemplate(
  name: string,
  description: string,
  sections: TemplateSection[],
  exportProfile: ExportProfileId,
  id?: string
): string {
  try {
    const templates = getAllTemplates();
    
    // Create timestamp for now
    const now = new Date().toISOString();
    
    // If updating an existing template
    if (id) {
      const existingIndex = templates.findIndex(t => t.id === id);
      
      if (existingIndex !== -1) {
        templates[existingIndex] = {
          ...templates[existingIndex],
          name,
          description,
          sections: JSON.parse(JSON.stringify(sections)), // Deep copy
          exportProfile,
          updatedAt: now
        };
      } else {
        // ID provided but not found, create new
        id = uuidv4();
        templates.push({
          id,
          name,
          description,
          sections: JSON.parse(JSON.stringify(sections)), // Deep copy
          exportProfile,
          createdAt: now,
          updatedAt: now
        });
      }
    } else {
      // Create new template
      id = uuidv4();
      templates.push({
        id,
        name,
        description,
        sections: JSON.parse(JSON.stringify(sections)), // Deep copy
        exportProfile,
        createdAt: now,
        updatedAt: now
      });
    }
    
    // Save to localStorage
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    
    return id;
  } catch (error) {
    console.error('Error saving template:', error);
    throw new Error('Failed to save template to local storage');
  }
}

/**
 * Gets a list of all saved templates (metadata only, no sections)
 * @returns Array of template metadata
 */
export function getTemplateList(): TemplateMeta[] {
  try {
    const templates = getAllTemplates();
    
    // Return only metadata (exclude sections to reduce payload size)
    return templates.map(({ id, name, description, createdAt, updatedAt }) => ({
      id,
      name,
      description,
      createdAt,
      updatedAt
    }));
  } catch (error) {
    console.error('Error retrieving template list:', error);
    return [];
  }
}

/**
 * Loads a template by ID
 * @param id Template ID
 * @returns The template or null if not found
 */
export function loadTemplate(id: string): SavedTemplate | null {
  try {
    const templates = getAllTemplates();
    const template = templates.find(t => t.id === id);
    
    return template || null;
  } catch (error) {
    console.error('Error loading template:', error);
    return null;
  }
}

/**
 * Deletes a template by ID
 * @param id Template ID
 * @returns Success status
 */
export function deleteTemplate(id: string): boolean {
  try {
    const templates = getAllTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    // If no templates were filtered out, the ID doesn't exist
    if (filteredTemplates.length === templates.length) {
      return false;
    }
    
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filteredTemplates));
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    return false;
  }
}

/**
 * Exports all templates as a JSON string
 * @returns JSON string containing all templates
 */
export function exportTemplatesAsJson(): string {
  try {
    const templates = getAllTemplates();
    return JSON.stringify(templates, null, 2);
  } catch (error) {
    console.error('Error exporting templates:', error);
    throw new Error('Failed to export templates');
  }
}

/**
 * Imports templates from a JSON string
 * @param jsonString JSON string containing templates
 * @param replaceAll Whether to replace all existing templates
 * @returns Number of templates imported
 */
export function importTemplatesFromJson(jsonString: string, replaceAll = false): number {
  try {
    // Parse the JSON string
    const importedTemplates = JSON.parse(jsonString) as SavedTemplate[];
    
    // Validate the format
    if (!Array.isArray(importedTemplates)) {
      throw new Error('Invalid template format: expected an array');
    }
    
    // Validate each template
    importedTemplates.forEach(validateTemplateFormat);
    
    if (replaceAll) {
      // Replace all templates
      localStorage.setItem(TEMPLATES_STORAGE_KEY, jsonString);
      return importedTemplates.length;
    } else {
      // Merge with existing templates
      const existingTemplates = getAllTemplates();
      const mergedTemplates: SavedTemplate[] = [...existingTemplates];
      
      // For each imported template, either add it or update an existing one
      importedTemplates.forEach(importedTemplate => {
        const existingIndex = mergedTemplates.findIndex(t => t.id === importedTemplate.id);
        
        if (existingIndex !== -1) {
          // Update existing template
          mergedTemplates[existingIndex] = importedTemplate;
        } else {
          // Add new template
          mergedTemplates.push(importedTemplate);
        }
      });
      
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(mergedTemplates));
      return importedTemplates.length;
    }
  } catch (error) {
    console.error('Error importing templates:', error);
    throw new Error(`Failed to import templates: ${(error as Error).message}`);
  }
}

/**
 * Gets all templates from localStorage
 * @returns Array of saved templates
 */
function getAllTemplates(): SavedTemplate[] {
  const templatesJson = localStorage.getItem(TEMPLATES_STORAGE_KEY);
  
  if (!templatesJson) {
    return [];
  }
  
  try {
    return JSON.parse(templatesJson) as SavedTemplate[];
  } catch (error) {
    console.error('Error parsing templates from localStorage:', error);
    return [];
  }
}

/**
 * Validates the format of a template
 * @param template Template to validate
 * @throws Error if template format is invalid
 */
function validateTemplateFormat(template: SavedTemplate): void {
  // Check required fields
  if (!template.id || !template.name || !Array.isArray(template.sections)) {
    throw new Error('Invalid template format: missing required fields');
  }
  
  // Check that sections have required fields
  template.sections.forEach(section => {
    if (!section.id || !section.type || !Array.isArray(section.content)) {
      throw new Error('Invalid section format in template');
    }
  });
}