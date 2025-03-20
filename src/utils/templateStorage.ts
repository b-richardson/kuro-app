/**
 * Utility functions for template storage and management
 */
import { v4 as uuidv4 } from 'uuid';
import { TemplateSection } from '@/types/TemplateSection';
import { ExportProfileId } from '@/components/TemplateCreator/ExportProfileSelector.vue';

// Local storage keys
const TEMPLATES_STORAGE_KEY = 'obsidian-template-creator-templates';
const TEMPLATES_VERSION_KEY = 'obsidian-template-creator-version';

// Current template storage version
const CURRENT_VERSION = '1.0';

// Define storage limits to prevent exceeding localStorage capacity
const MAX_TEMPLATE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB max for a single template
const MAX_TOTAL_STORAGE_BYTES = 4.5 * 1024 * 1024; // 4.5MB max total (localStorage is typically 5MB)

// Custom error classes
export class TemplateStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateStorageError';
  }
}

export class TemplateSizeError extends TemplateStorageError {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateSizeError';
  }
}

export class StorageQuotaError extends TemplateStorageError {
  constructor(message: string) {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

export class TemplateFormatError extends TemplateStorageError {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateFormatError';
  }
}

// Initialize storage version on first use
try {
  const storedVersion = localStorage.getItem(TEMPLATES_VERSION_KEY);
  if (!storedVersion) {
    localStorage.setItem(TEMPLATES_VERSION_KEY, CURRENT_VERSION);
  } else if (storedVersion !== CURRENT_VERSION) {
    // Perform migration if needed in the future
    console.log(`Migrating templates from version ${storedVersion} to ${CURRENT_VERSION}`);
    migrateTemplates(storedVersion, CURRENT_VERSION);
    localStorage.setItem(TEMPLATES_VERSION_KEY, CURRENT_VERSION);
  }
} catch (error) {
  console.error('Error initializing template storage:', error);
}

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
  version: string;
  tags?: string[];
  thumbnail?: string; // Base64 encoded thumbnail image
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
  version: string;
  tags?: string[];
  thumbnail?: string;
}

/**
 * Saves a template to localStorage
 * @param name Template name
 * @param description Template description
 * @param sections Template sections
 * @param exportProfile Export profile used
 * @param id Optional template ID (for updates)
 * @param tags Optional array of tags for categorization
 * @returns ID of the saved template
 * @throws {TemplateStorageError} When there's an error saving the template
 */
export function saveTemplate(
  name: string,
  description: string,
  sections: TemplateSection[],
  exportProfile: ExportProfileId,
  id?: string,
  tags?: string[]
): string {
  try {
    if (!name.trim()) {
      throw new TemplateFormatError('Template name cannot be empty');
    }
    
    const templates = getAllTemplates();
    
    // Check for duplicate name if creating a new template
    if (!id) {
      const duplicateName = templates.some(t => t.name === name.trim() && t.id !== id);
      if (duplicateName) {
        throw new TemplateFormatError(`A template with the name "${name}" already exists`);
      }
    }
    
    // Create timestamp for now
    const now = new Date().toISOString();
    
    // Deep copy sections to prevent mutation of the original
    const sectionsCopy = JSON.parse(JSON.stringify(sections));
    
    // Generate thumbnail representation
    const thumbnail = generateThumbnail(sections);
    
    // Create or update template object
    let updatedTemplate: SavedTemplate;
    let updatedTemplates: SavedTemplate[];
    
    // If updating an existing template
    if (id) {
      const existingIndex = templates.findIndex(t => t.id === id);
      
      if (existingIndex !== -1) {
        // Update existing template
        updatedTemplate = {
          ...templates[existingIndex],
          name: name.trim(),
          description: description.trim(),
          sections: sectionsCopy,
          exportProfile,
          updatedAt: now,
          version: CURRENT_VERSION,
          thumbnail,
        };
        
        // Only update tags if provided
        if (tags) {
          updatedTemplate.tags = tags;
        }
        
        // Create updated templates array
        updatedTemplates = [...templates];
        updatedTemplates[existingIndex] = updatedTemplate;
        
      } else {
        // ID provided but not found, create new
        id = uuidv4();
        updatedTemplate = {
          id,
          name: name.trim(),
          description: description.trim(),
          sections: sectionsCopy,
          exportProfile,
          createdAt: now,
          updatedAt: now,
          version: CURRENT_VERSION,
          tags,
          thumbnail,
        };
        
        updatedTemplates = [...templates, updatedTemplate];
      }
    } else {
      // Create new template
      id = uuidv4();
      updatedTemplate = {
        id,
        name: name.trim(),
        description: description.trim(),
        sections: sectionsCopy,
        exportProfile,
        createdAt: now,
        updatedAt: now,
        version: CURRENT_VERSION,
        tags,
        thumbnail,
      };
      
      updatedTemplates = [...templates, updatedTemplate];
    }
    
    // Check template size
    const templateJson = JSON.stringify(updatedTemplate);
    const templateSize = new TextEncoder().encode(templateJson).length;
    
    if (templateSize > MAX_TEMPLATE_SIZE_BYTES) {
      throw new TemplateSizeError(
        `Template is too large (${Math.round(templateSize / 1024)}KB). ` +
        `Maximum size is ${Math.round(MAX_TEMPLATE_SIZE_BYTES / 1024)}KB.`
      );
    }
    
    // Check total storage size
    const allTemplatesJson = JSON.stringify(updatedTemplates);
    const totalSize = new TextEncoder().encode(allTemplatesJson).length;
    
    if (totalSize > MAX_TOTAL_STORAGE_BYTES) {
      throw new StorageQuotaError(
        `Total storage space exceeded (${Math.round(totalSize / 1024)}KB). ` +
        `Maximum storage is ${Math.round(MAX_TOTAL_STORAGE_BYTES / 1024)}KB. ` +
        'Please delete some templates before saving.'
      );
    }
    
    // Save to localStorage
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, allTemplatesJson);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        throw new StorageQuotaError(
          'Browser storage limit exceeded. Please delete some templates before saving.'
        );
      }
      throw e;
    }
    
    return id;
  } catch (error) {
    // Re-throw custom errors
    if (error instanceof TemplateStorageError) {
      throw error;
    }
    
    console.error('Error saving template:', error);
    throw new TemplateStorageError(`Failed to save template: ${(error as Error).message}`);
  }
}

/**
 * Gets a list of all saved templates (metadata only, no sections)
 * @param sortBy Optional sorting field ('name', 'createdAt', 'updatedAt')
 * @param sortOrder Optional sort order ('asc', 'desc')
 * @param filterTag Optional tag to filter by
 * @returns Array of template metadata
 */
export function getTemplateList(
  sortBy: 'name' | 'createdAt' | 'updatedAt' = 'updatedAt',
  sortOrder: 'asc' | 'desc' = 'desc',
  filterTag?: string
): TemplateMeta[] {
  try {
    let templates = getAllTemplates();
    
    // Apply tag filtering if specified
    if (filterTag) {
      templates = templates.filter(template => 
        template.tags && template.tags.includes(filterTag)
      );
    }
    
    // Apply sorting
    templates.sort((a, b) => {
      let comparison: number;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // Return only metadata (exclude sections to reduce payload size)
    return templates.map(({ id, name, description, createdAt, updatedAt, version, tags, thumbnail }) => ({
      id,
      name,
      description,
      createdAt,
      updatedAt,
      version,
      tags,
      thumbnail
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
 * @throws {TemplateStorageError} When there's an error loading the template
 */
export function loadTemplate(id: string): SavedTemplate | null {
  try {
    if (!id) {
      throw new TemplateFormatError('Template ID is required');
    }
    
    const templates = getAllTemplates();
    const template = templates.find(t => t.id === id);
    
    if (!template) {
      return null;
    }
    
    // Ensure template has version (for backward compatibility)
    if (!template.version) {
      template.version = CURRENT_VERSION;
    }
    
    return template;
  } catch (error) {
    // Re-throw custom errors
    if (error instanceof TemplateStorageError) {
      throw error;
    }
    
    console.error('Error loading template:', error);
    throw new TemplateStorageError(`Failed to load template: ${(error as Error).message}`);
  }
}

/**
 * Deletes a template by ID
 * @param id Template ID
 * @returns Success status
 * @throws {TemplateStorageError} When there's an error deleting the template
 */
export function deleteTemplate(id: string): boolean {
  try {
    if (!id) {
      throw new TemplateFormatError('Template ID is required');
    }
    
    const templates = getAllTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    // If no templates were filtered out, the ID doesn't exist
    if (filteredTemplates.length === templates.length) {
      return false;
    }
    
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filteredTemplates));
    return true;
  } catch (error) {
    // Re-throw custom errors
    if (error instanceof TemplateStorageError) {
      throw error;
    }
    
    console.error('Error deleting template:', error);
    throw new TemplateStorageError(`Failed to delete template: ${(error as Error).message}`);
  }
}

/**
 * Exports all templates as a JSON string
 * @param templateIds Optional array of template IDs to export (all templates if not specified)
 * @returns JSON string containing all templates
 * @throws {TemplateStorageError} When there's an error exporting templates
 */
export function exportTemplatesAsJson(templateIds?: string[]): string {
  try {
    let templates = getAllTemplates();
    
    // Filter by IDs if specified
    if (templateIds && templateIds.length > 0) {
      templates = templates.filter(template => templateIds.includes(template.id));
    }
    
    // Add export metadata
    const exportData = {
      version: CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      templates
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    // Re-throw custom errors
    if (error instanceof TemplateStorageError) {
      throw error;
    }
    
    console.error('Error exporting templates:', error);
    throw new TemplateStorageError(`Failed to export templates: ${(error as Error).message}`);
  }
}

/**
 * Imports templates from a JSON string
 * @param jsonString JSON string containing templates
 * @param replaceAll Whether to replace all existing templates
 * @returns Number of templates imported
 * @throws {TemplateStorageError} When there's an error importing templates
 */
export function importTemplatesFromJson(jsonString: string, replaceAll = false): number {
  try {
    // Parse the JSON string
    let importedTemplates: SavedTemplate[] = [];
    
    try {
      // Try parsing as new format with metadata
      const importData = JSON.parse(jsonString);
      
      if (importData.templates && Array.isArray(importData.templates)) {
        importedTemplates = importData.templates;
      } else if (Array.isArray(importData)) {
        // Try parsing as old format (just an array)
        importedTemplates = importData;
      } else {
        throw new TemplateFormatError('Invalid template format: expected an array or object with templates property');
      }
    } catch (parseError) {
      throw new TemplateFormatError(`Invalid JSON format: ${(parseError as Error).message}`);
    }
    
    // Validate the format
    if (!Array.isArray(importedTemplates)) {
      throw new TemplateFormatError('Invalid template format: expected an array');
    }
    
    // Validate each template and ensure it has version
    importedTemplates.forEach(template => {
      validateTemplateFormat(template);
      
      // Make sure version is current
      template.version = CURRENT_VERSION;
      
      // Generate thumbnail if missing
      if (!template.thumbnail) {
        template.thumbnail = generateThumbnail(template.sections);
      }
      
      // Ensure each template has a createdAt and updatedAt
      if (!template.createdAt) {
        template.createdAt = new Date().toISOString();
      }
      if (!template.updatedAt) {
        template.updatedAt = new Date().toISOString();
      }
    });
    
    // Check total size
    const importSize = new TextEncoder().encode(jsonString).length;
    if (importSize > MAX_TOTAL_STORAGE_BYTES) {
      throw new StorageQuotaError(
        `Import size (${Math.round(importSize / 1024)}KB) exceeds maximum storage limit ` +
        `(${Math.round(MAX_TOTAL_STORAGE_BYTES / 1024)}KB).`
      );
    }
    
    if (replaceAll) {
      // Replace all templates
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(importedTemplates));
      return importedTemplates.length;
    } else {
      // Merge with existing templates
      const existingTemplates = getAllTemplates();
      const mergedTemplates: SavedTemplate[] = [...existingTemplates];
      
      // Count of imported templates (excluding duplicates)
      let importCount = 0;
      
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
        importCount++;
      });
      
      // Check if the merged templates exceed storage limit
      const mergedSize = new TextEncoder().encode(JSON.stringify(mergedTemplates)).length;
      if (mergedSize > MAX_TOTAL_STORAGE_BYTES) {
        throw new StorageQuotaError(
          `Combined templates (${Math.round(mergedSize / 1024)}KB) exceed maximum storage limit ` +
          `(${Math.round(MAX_TOTAL_STORAGE_BYTES / 1024)}KB). ` +
          `Please delete some templates before importing or use replace mode.`
        );
      }
      
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(mergedTemplates));
      return importCount;
    }
  } catch (error) {
    // Re-throw custom errors
    if (error instanceof TemplateStorageError) {
      throw error;
    }
    
    console.error('Error importing templates:', error);
    throw new TemplateStorageError(`Failed to import templates: ${(error as Error).message}`);
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
 * @throws TemplateFormatError if template format is invalid
 */
function validateTemplateFormat(template: SavedTemplate): void {
  // Check required fields
  if (!template.id || !template.name || !Array.isArray(template.sections)) {
    throw new TemplateFormatError('Invalid template format: missing required fields');
  }
  
  // Check that sections have required fields
  template.sections.forEach((section, index) => {
    if (!section.id || !section.type || !Array.isArray(section.content)) {
      throw new TemplateFormatError(`Invalid section format in template at position ${index}`);
    }
  });
  
  // Check for dates
  if (!template.createdAt || !template.updatedAt) {
    throw new TemplateFormatError('Invalid template format: missing timestamps');
  }
  
  // Check version if migrating old templates
  if (!template.version) {
    // Add version for older templates
    template.version = CURRENT_VERSION;
  }
}

/**
 * Migrates templates from an older version to the current version
 * @param fromVersion Previous version
 * @param toVersion Current version
 */
function migrateTemplates(fromVersion: string, toVersion: string): void {
  try {
    const templates = getAllTemplates();
    
    // Apply migrations based on version differences
    const updatedTemplates = templates.map(template => {
      // Make sure template has version property
      if (!template.version) {
        template.version = fromVersion;
      }
      
      // Apply migrations based on from/to version
      // For now, just add new properties
      
      // Add thumbnail if missing
      if (!template.thumbnail) {
        template.thumbnail = generateThumbnail(template.sections);
      }
      
      // Add tags array if missing
      if (!template.tags) {
        template.tags = [];
      }
      
      // Update version
      template.version = toVersion;
      
      return template;
    });
    
    // Save updated templates
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedTemplates));
    
  } catch (error) {
    console.error('Error migrating templates:', error);
    throw new TemplateStorageError(`Migration failed: ${(error as Error).message}`);
  }
}

/**
 * Generates a simple thumbnail representation of the template
 * @param sections Template sections
 * @returns A string representing the template structure
 */
function generateThumbnail(sections: TemplateSection[]): string {
  try {
    // Generate a simple text-based representation of the template structure
    // For real thumbnails, you would want to render this to canvas and generate an image
    const structurePreview = sections.slice(0, 5).map(section => {
      // Get first 50 characters of content for a preview
      const contentPreview = section.content[0]?.substring(0, 50) || '';
      
      return `${section.type}: ${contentPreview}${contentPreview.length >= 50 ? '...' : ''}`;
    }).join(' | ');
    
    return structurePreview;
    
    // For actual image thumbnail, you would do:
    // 1. Render template to a small canvas
    // 2. Convert canvas to base64 data URL
    // 3. Return the data URL
    // This is left as a future enhancement
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return '';
  }
}