import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useUIStore } from './ui';
import { useActivityStore } from './activity';

// Import the types directly from the type definitions file
import { TemplateSection, SectionType, PluginType, SectionMetadata } from '@/types/TemplateSection';

/**
 * Interface defining the structure of a template
 */
export interface Template {
  /** Unique identifier for the template */
  id: string;
  
  /** Name of the template */
  name: string;
  
  /** Description of the template */
  description: string;
  
  /** Sections that make up the template */
  sections: TemplateSection[];
  
  /** Tags for categorizing the template */
  tags: string[];
  
  /** Last modified timestamp */
  lastModified: number;
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Whether the template is public or private */
  isPublic: boolean;
  
  /** User ID of the template creator */
  userId: string | null;
}

/**
 * Pinia store for managing templates
 */
export const useTemplateStore = defineStore('template', () => {
  // State
  const templates = ref<Template[]>([]);
  const currentTemplate = ref<Template | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentTemplateId = ref<string>('');

  // Get UI store for status updates
  const uiStore = useUIStore();
  
  // Get activity store for logging actions
  const activityStore = useActivityStore();

  // Getters
  const templateById = computed(() => {
    return (id: string) => templates.value.find(t => t.id === id) || null;
  });

  // Computed property for current sections
  const currentSections = computed((): TemplateSection[] => {
    return currentTemplate.value?.sections || [];
  });

  /**
   * Ensures a section conforms to the TemplateSection interface
   */
  const normalizeSection = (section: Partial<TemplateSection>): TemplateSection => {
    // Ensure content is always a string array
    const content = Array.isArray(section.content) 
      ? section.content 
      : (section.content ? [section.content as unknown as string] : ['']);

    return {
      id: section.id || uuidv4(),
      // Default to 'text' if no type is provided or type is invalid
      type: section.type && isValidSectionType(section.type) 
        ? section.type 
        : 'text',
      content,
      // Default to null if no plugin type is provided or type is invalid
      pluginType: section.pluginType && isValidPluginType(section.pluginType) 
        ? section.pluginType 
        : null,
      // Include metadata if provided
      ...(section.metadata ? { metadata: section.metadata } : {})
    };
  };

  /**
   * Validates if a section type is one of the allowed SectionType values
   */
  const isValidSectionType = (type: any): type is SectionType => {
    const validTypes: SectionType[] = [
      'header', 'checklist', 'table', 'text', 
      'yaml', 'templaterField', 'dataviewQuery', 'kanban'
    ];
    return validTypes.includes(type as SectionType);
  };

  /**
   * Validates if a plugin type is one of the allowed PluginType values
   */
  const isValidPluginType = (type: any): type is PluginType => {
    const validTypes: PluginType[] = [null, 'templater', 'dataview', 'kanban'];
    return validTypes.includes(type as PluginType);
  };

  /**
   * Loads templates from localStorage
   */
  const loadTemplates = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Check localStorage for any saved templates
      const savedTemplates = localStorage.getItem('templates');
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        
        // Normalize all templates and sections to ensure type consistency
        templates.value = parsed.map((template: any) => ({
          ...template,
          sections: Array.isArray(template.sections) 
            ? template.sections.map(normalizeSection)
            : []
        }));
      }
      
      return true;
    } catch (err) {
      error.value = 'Failed to load templates';
      console.error('Error loading templates:', err);
      uiStore.showToast('Failed to load templates', 'error');
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Loads a specific template by ID
   */
  const loadTemplate = (id: string) => {
    if (!id) {
      createNewTemplate();
      return null;
    }
    
    const template = templateById.value(id);
    if (template) {
      // Create a reactive copy that maintains reactivity
      // Properly copy nested objects to avoid breaking reactivity
      currentTemplate.value = { 
        ...template,
        // Create fresh copies of arrays and objects to maintain reactivity
        sections: template.sections.map(section => ({
          ...section,
          // Create a fresh copy of the content array
          content: [...section.content],
          // Create a fresh copy of metadata if it exists
          metadata: section.metadata ? {...section.metadata} : undefined
        })),
        tags: [...template.tags]
      };
      currentTemplateId.value = id;
      return true;
    }
    
    uiStore.showToast(`Template with ID ${id} not found`, 'error');
    return false;
  };

  /**
   * Creates a new template with default content
   */
  const createNewTemplate = () => {
    const newTemplate: Template = {
      id: uuidv4(),
      name: 'Untitled Template',
      description: '',
      sections: [
        {
          id: uuidv4(),
          type: 'header',
          content: ['# Untitled Template'],
          pluginType: null
        }
      ],
      tags: [],
      lastModified: Date.now(),
      createdAt: Date.now(),
      isPublic: false,
      userId: '1' // Default user ID
    };
    
    currentTemplate.value = newTemplate;
    currentTemplateId.value = newTemplate.id;
    templates.value.push(newTemplate);
    saveTemplates();
    
    // Log activity
    activityStore.addActivity(
      'create',
      newTemplate.id,
      newTemplate.name,
      newTemplate.userId || '1'
    );
    
    return newTemplate.id;
  };

  /**
   * Creates a template with custom name and description
   */
  const createTemplate = (name: string = 'New Template', description: string = '') => {
    const id = uuidv4();
    const now = Date.now();
    
    const newTemplate: Template = {
      id,
      name,
      description,
      sections: [],
      tags: [],
      lastModified: now,
      createdAt: now,
      isPublic: false,
      userId: '1' // Default user ID
    };
    
    templates.value.push(newTemplate);
    currentTemplate.value = newTemplate;
    currentTemplateId.value = id;
    saveTemplates();
    
    return id;
  };

  /**
   * Updates an existing template
   */
  const updateTemplate = (template: Template) => {
    const index = templates.value.findIndex(t => t.id === template.id);
    
    if (index !== -1) {
      // Update timestamp
      template.lastModified = Date.now();
      
      // Normalize sections to ensure type consistency but do it in a reactive way
      const normalizedSections = template.sections.map(section => normalizeSection(section));
      
      // Update the template in the templates array
      templates.value[index] = {
        ...template,
        sections: normalizedSections,
      };
      
      // Update current template if it's the same one
      if (currentTemplate.value?.id === template.id) {
        // Update properties individually to maintain proper reactivity
        // Instead of using Object.assign which can break reactivity with nested objects
        Object.keys(template).forEach(key => {
          if (key === 'sections') {
            // Create a deep reactive copy of sections
            currentTemplate.value.sections = normalizedSections.map(section => ({
              ...section,
              content: [...section.content],
              metadata: section.metadata ? {...section.metadata} : undefined
            }));
          } else if (key === 'tags') {
            // Create a fresh copy of the tags array
            currentTemplate.value.tags = [...template.tags];
          } else {
            // For primitive values, direct assignment is fine
            // @ts-ignore - Dynamic property assignment
            currentTemplate.value[key] = template[key];
          }
        });
      }
      
      // Log activity - but only for significant updates
      // We don't want to log every single keystroke
      // The lastModified check helps avoid duplicate logging
      const lastUpdateTime = parseInt(localStorage.getItem(`last-update-log-${template.id}`) || '0');
      if (Date.now() - lastUpdateTime > 60000) { // Only log once per minute
        activityStore.addActivity(
          'update',
          template.id,
          template.name,
          template.userId || '1'
        );
        localStorage.setItem(`last-update-log-${template.id}`, Date.now().toString());
      }
      
      saveTemplates();
      return true;
    }
    
    return false;
  };

  /**
   * Updates the name of the current template
   */
  const updateTemplateName = (name: string) => {
    if (currentTemplate.value) {
      currentTemplate.value.name = name;
      currentTemplate.value.lastModified = Date.now();
      updateTemplate(currentTemplate.value);
    }
  };

  /**
   * Updates the description of the current template
   */
  const updateTemplateDescription = (description: string) => {
    if (currentTemplate.value) {
      currentTemplate.value.description = description;
      currentTemplate.value.lastModified = Date.now();
      updateTemplate(currentTemplate.value);
    }
  };

  /**
   * Deletes a template by ID
   */
  const deleteTemplate = (id: string) => {
    const index = templates.value.findIndex(t => t.id === id);
    
    if (index !== -1) {
      const templateName = templates.value[index].name;
      const templateUserId = templates.value[index].userId || '1';
      
      templates.value.splice(index, 1);
      
      if (currentTemplate.value?.id === id) {
        currentTemplate.value = null;
        currentTemplateId.value = '';
      }
      
      // Log activity
      activityStore.addActivity(
        'delete',
        id,
        templateName,
        templateUserId
      );
      
      saveTemplates();
      return true;
    }
    
    return false;
  };

  /**
   * Duplicates a template
   */
  const duplicateTemplate = async (id: string) => {
    const template = templateById.value(id);
    
    if (template) {
      // Create a reactive copy without using JSON.parse/stringify
      const newTemplate: Template = {
        // Use shallow spread for the main template properties
        ...template,
        id: uuidv4(),
        name: `${template.name} (Copy)`,
        lastModified: Date.now(),
        createdAt: Date.now()
      };
      
      // Create a deep copy of sections while maintaining reactivity
      newTemplate.sections = template.sections.map(section => ({
        ...section,  // Copy all properties of the section
        id: uuidv4(), // Assign new ID
        // Create a fresh copy of the content array to maintain reactivity
        content: section.content ? [...section.content] : [],
        // Create a fresh copy of metadata if it exists
        metadata: section.metadata ? {...section.metadata} : undefined
      }));
      
      templates.value.push(newTemplate);
      
      // Log activity
      activityStore.addActivity(
        'duplicate',
        newTemplate.id,
        newTemplate.name,
        newTemplate.userId || '1'
      );
      
      saveTemplates();
      
      return newTemplate.id;
    }
    
    throw new Error('Template not found');
  };

  /**
   * Saves templates to localStorage
   */
  const saveTemplates = () => {
    try {
      localStorage.setItem('templates', JSON.stringify(templates.value));
    } catch (error) {
      console.error('Failed to save templates:', error);
      uiStore.showToast('Failed to save templates', 'error');
    }
  };

  /**
   * Clears all templates
   */
  const clearAllTemplates = () => {
    templates.value = [];
    currentTemplate.value = null;
    currentTemplateId.value = '';
    saveTemplates();
  };

  /**
   * Adds a section to the current template
   */
  const addSection = (section: Partial<TemplateSection>) => {
    // If no current template, create one
    if (!currentTemplate.value && currentTemplateId.value === '') {
      createTemplate();
    }
    
    if (currentTemplate.value) {
      // Normalize section to ensure type consistency
      const normalizedSection = normalizeSection(section);
      
      // Add section to the template
      currentTemplate.value.sections.push(normalizedSection);
      currentTemplate.value.lastModified = Date.now();
      updateTemplate(currentTemplate.value);
    }
  };

  /**
   * Updates a section in the current template
   */
  const updateSection = (sectionId: string, updatedSection: Partial<TemplateSection>) => {
    if (currentTemplate.value) {
      const index = currentTemplate.value.sections.findIndex(s => s.id === sectionId);
      if (index !== -1) {
        // Merge the existing section with the updates
        const mergedSection = {
          ...currentTemplate.value.sections[index],
          ...updatedSection,
          // Special handling for content to ensure it's always an array
          content: updatedSection.content 
            ? (Array.isArray(updatedSection.content) 
                ? updatedSection.content 
                : [updatedSection.content as unknown as string])
            : currentTemplate.value.sections[index].content
        };
        
        // Normalize to ensure type consistency
        currentTemplate.value.sections[index] = normalizeSection(mergedSection);
        currentTemplate.value.lastModified = Date.now();
        updateTemplate(currentTemplate.value);
      }
    }
  };

  /**
   * Deletes a section from the current template
   */
  const deleteSection = (sectionId: string) => {
    if (currentTemplate.value) {
      const index = currentTemplate.value.sections.findIndex(s => s.id === sectionId);
      if (index !== -1) {
        currentTemplate.value.sections.splice(index, 1);
        currentTemplate.value.lastModified = Date.now();
        updateTemplate(currentTemplate.value);
      }
    }
  };

  /**
   * Updates all sections in the current template
   */
  const updateSections = (newSections: Partial<TemplateSection>[]) => {
    if (currentTemplate.value) {
      // Create normalized sections with proper reactivity
      const normalizedSections = newSections.map(section => {
        const normalized = normalizeSection(section);
        // Ensure content array is properly copied for reactivity
        return {
          ...normalized,
          content: [...normalized.content],
          metadata: normalized.metadata ? {...normalized.metadata} : undefined
        };
      });
      
      // Update the sections array with the normalized sections
      currentTemplate.value.sections = normalizedSections;
      currentTemplate.value.lastModified = Date.now();
      
      // Update the template in the templates array
      const index = templates.value.findIndex(t => t.id === currentTemplate.value?.id);
      if (index !== -1) {
        // Create a reactive copy of the current template
        templates.value[index] = {
          ...currentTemplate.value,
          // Ensure sections array is properly copied
          sections: normalizedSections.map(section => ({
            ...section,
            content: [...section.content],
            metadata: section.metadata ? {...section.metadata} : undefined
          }))
        };
        saveTemplates();
      }
    }
  };

  /**
   * Saves the current template
   */
  const saveCurrentTemplate = async () => {
    try {
      if (!currentTemplate.value) {
        // No template loaded, create a new one if there are sections
        if (currentSections.value.length > 0) {
          const id = createTemplate();
          return id;
        }
        throw new Error('No template to save');
      }
      
      // Update timestamp
      currentTemplate.value.lastModified = Date.now();
      
      // Return early if the update fails
      if (!updateTemplate(currentTemplate.value)) {
        throw new Error('Failed to update template');
      }
      
      return currentTemplate.value.id;
    } catch (error) {
      console.error('Error in saveCurrentTemplate:', error);
      throw error; // Re-throw for proper error handling upstream
    }
  };

  // Initialize by loading templates
  loadTemplates();

  return {
    // State
    templates,
    currentTemplate,
    currentTemplateId,
    isLoading,
    error,
    
    // Getters
    templateById,
    currentSections,
    
    // Actions
    loadTemplates,
    loadTemplate,
    createNewTemplate,
    createTemplate,
    updateTemplate,
    updateTemplateName,
    updateTemplateDescription,
    deleteTemplate,
    duplicateTemplate,
    saveTemplates,
    clearAllTemplates,
    
    // Section manipulation
    addSection,
    updateSection,
    deleteSection,
    updateSections,
    saveCurrentTemplate
  };
});