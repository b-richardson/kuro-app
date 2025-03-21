import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useUIStore } from './ui';

export interface TemplateSection {
  id: string;
  type: 'heading' | 'text' | 'list' | 'table' | 'code' | 'frontmatter';
  content: string;
  options?: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
  tags: string[];
  lastModified: number;
  createdAt: number;
  isPublic: boolean;
  userId: string | null;
}

export const useTemplateStore = defineStore('template', () => {
  // State
  const templates = ref<Template[]>([]);
  const currentTemplate = ref<Template | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentTemplateId = ref<string>('');

  // Get UI store for status updates
  const uiStore = useUIStore();

  // Mock templates for demo purposes
  const mockTemplates: Template[] = [
    {
      id: '1',
      name: 'Daily Note Template',
      description: 'A template for daily notes with sections for tasks, notes, and reflections',
      sections: [
        {
          id: uuidv4(),
          type: 'frontmatter',
          content: '---\ndate: {{date:YYYY-MM-DD}}\ntags: daily-note\n---'
        },
        {
          id: uuidv4(),
          type: 'heading',
          content: '# Daily Note - {{date:dddd, MMMM Do YYYY}}'
        },
        {
          id: uuidv4(),
          type: 'heading',
          content: '## Tasks'
        },
        {
          id: uuidv4(),
          type: 'list',
          content: '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3'
        },
        {
          id: uuidv4(),
          type: 'heading',
          content: '## Notes'
        },
        {
          id: uuidv4(),
          type: 'text',
          content: 'Enter your notes for the day here...'
        },
        {
          id: uuidv4(),
          type: 'heading',
          content: '## Daily Reflection'
        },
        {
          id: uuidv4(),
          type: 'text',
          content: '### What went well today?\n\n### What could have gone better?\n\n### What am I grateful for?'
        }
      ],
      tags: ['daily', 'journal', 'productivity'],
      lastModified: Date.now() - 3600000, // 1 hour ago
      createdAt: Date.now() - 86400000, // 1 day ago
      isPublic: false,
      userId: '1'
    },
    {
      id: '2',
      name: 'Meeting Notes',
      description: 'Template for capturing meeting notes with attendees, action items and decisions',
      sections: [
        {
          id: uuidv4(),
          type: 'frontmatter',
          content: '---\ndate: {{date:YYYY-MM-DD}}\ntags: meeting\nattendees: \n---'
        },
        {
          id: uuidv4(),
          type: 'heading',
          content: '# Meeting: {{title}}'
        },
        {
          id: uuidv4(),
          type: 'heading',
          content: '## Details'
        },
        {
          id: uuidv4(),
          type: 'text',
          content: '- **Date:** {{date:YYYY-MM-DD}}\n- **Time:** {{time}}\n- **Location:** {{location}}\n- **Attendees:** {{attendees}}'
        },
        {
          id: uuidv4(),
          type: 'heading',
          content: '## Agenda'
        },
        {
          id: uuidv4(),
          type: 'list',
          content: '1. Item 1\n2. Item 2\n3. Item 3'
        },
        {
          id: uuidv4(),
          type: 'heading',
          content: '## Discussion Notes'
        },
        {
          id: uuidv4(),
          type: 'text',
          content: 'Enter discussion notes here...'
        },
        {
          id: uuidv4(),
          type: 'heading',
          content: '## Action Items'
        },
        {
          id: uuidv4(),
          type: 'list',
          content: '- [ ] Action 1 - @person1 (Due: DATE)\n- [ ] Action 2 - @person2 (Due: DATE)'
        },
        {
          id: uuidv4(),
          type: 'heading',
          content: '## Decisions'
        },
        {
          id: uuidv4(),
          type: 'list',
          content: '- Decision 1\n- Decision 2'
        }
      ],
      tags: ['meeting', 'work', 'notes'],
      lastModified: Date.now() - 7200000, // 2 hours ago
      createdAt: Date.now() - 604800000, // 1 week ago
      isPublic: true,
      userId: '1'
    }
  ];

  // Getters
  const templateById = computed(() => {
    return (id: string) => templates.value.find(t => t.id === id) || null;
  });

  // Computed property for backwards compatibility
  const currentSections = computed(() => {
    return currentTemplate.value?.sections || [];
  });

  // Actions
  const loadTemplates = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // In production, this would be an API call
      // For development, we'll just use mock templates
      
      // First, check localStorage for any saved templates
      const savedTemplates = localStorage.getItem('templates');
      if (savedTemplates) {
        templates.value = JSON.parse(savedTemplates);
      } else {
        // If none found, use mock templates
        templates.value = [...mockTemplates];
        // Save mock templates to localStorage
        localStorage.setItem('templates', JSON.stringify(mockTemplates));
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

  const loadTemplate = (id: string) => {
    if (!id) {
      createNewTemplate();
      return null;
    }
    
    const template = templateById.value(id);
    if (template) {
      currentTemplate.value = JSON.parse(JSON.stringify(template)); // Deep copy
      currentTemplateId.value = id;
      return true;
    }
    
    uiStore.showToast(`Template with ID ${id} not found`, 'error');
    return false;
  };

  const createNewTemplate = () => {
    const newTemplate: Template = {
      id: uuidv4(),
      name: 'Untitled Template',
      description: '',
      sections: [
        {
          id: uuidv4(),
          type: 'heading',
          content: '# Untitled Template'
        },
        {
          id: uuidv4(),
          type: 'text',
          content: 'Enter your template content here...'
        }
      ],
      tags: [],
      lastModified: Date.now(),
      createdAt: Date.now(),
      isPublic: false,
      userId: '1' // Using mock user ID
    };
    
    currentTemplate.value = newTemplate;
    currentTemplateId.value = newTemplate.id;
    templates.value.push(newTemplate);
    saveTemplates();
    
    return newTemplate.id;
  };

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
      userId: '1' // Using mock user ID
    };
    
    templates.value.push(newTemplate);
    currentTemplate.value = newTemplate;
    currentTemplateId.value = id;
    saveTemplates();
    
    return id;
  };

  const updateTemplate = (template: Template) => {
    const index = templates.value.findIndex(t => t.id === template.id);
    
    if (index !== -1) {
      template.lastModified = Date.now();
      templates.value[index] = template;
      currentTemplate.value = JSON.parse(JSON.stringify(template));
      saveTemplates();
      return true;
    }
    
    return false;
  };

  const updateTemplateName = (name: string) => {
    if (currentTemplate.value) {
      currentTemplate.value.name = name;
      currentTemplate.value.lastModified = Date.now();
      updateTemplate(currentTemplate.value);
    }
  };

  const updateTemplateDescription = (description: string) => {
    if (currentTemplate.value) {
      currentTemplate.value.description = description;
      currentTemplate.value.lastModified = Date.now();
      updateTemplate(currentTemplate.value);
    }
  };

  const deleteTemplate = (id: string) => {
    const index = templates.value.findIndex(t => t.id === id);
    
    if (index !== -1) {
      templates.value.splice(index, 1);
      
      if (currentTemplate.value?.id === id) {
        currentTemplate.value = null;
        currentTemplateId.value = '';
      }
      
      saveTemplates();
      return true;
    }
    
    return false;
  };

  const duplicateTemplate = async (id: string) => {
    const template = templateById.value(id);
    
    if (template) {
      const newTemplate = JSON.parse(JSON.stringify(template));
      newTemplate.id = uuidv4();
      newTemplate.name = `${template.name} (Copy)`;
      newTemplate.lastModified = Date.now();
      newTemplate.createdAt = Date.now();
      
      templates.value.push(newTemplate);
      saveTemplates();
      
      return newTemplate.id;
    }
    
    throw new Error('Template not found');
  };

  const saveTemplates = () => {
    try {
      localStorage.setItem('templates', JSON.stringify(templates.value));
    } catch (error) {
      console.error('Failed to save templates:', error);
      uiStore.showToast('Failed to save templates', 'error');
    }
  };

  const clearAllTemplates = () => {
    templates.value = [];
    currentTemplate.value = null;
    currentTemplateId.value = '';
    saveTemplates();
  };

  // Section manipulation methods
  const addSection = (section: TemplateSection) => {
    // If no current template, create one
    if (!currentTemplate.value && currentTemplateId.value === '') {
      createTemplate();
    }
    
    if (currentTemplate.value) {
      currentTemplate.value.sections.push(section);
      currentTemplate.value.lastModified = Date.now();
      updateTemplate(currentTemplate.value);
    }
  };

  const updateSection = (sectionId: string, updatedSection: Partial<TemplateSection>) => {
    if (currentTemplate.value) {
      const index = currentTemplate.value.sections.findIndex(s => s.id === sectionId);
      if (index !== -1) {
        currentTemplate.value.sections[index] = {
          ...currentTemplate.value.sections[index],
          ...updatedSection
        };
        currentTemplate.value.lastModified = Date.now();
        updateTemplate(currentTemplate.value);
      }
    }
  };

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

  const updateSections = (newSections: TemplateSection[]) => {
    if (currentTemplate.value) {
      currentTemplate.value.sections = [...newSections];
      currentTemplate.value.lastModified = Date.now();
      updateTemplate(currentTemplate.value);
    }
  };

  const saveCurrentTemplate = async () => {
    if (!currentTemplate.value) {
      // No template loaded, create a new one
      if (currentSections.value.length > 0) {
        const id = createTemplate();
        return id;
      }
      throw new Error('No template to save');
    }
    
    // Update timestamp
    currentTemplate.value.lastModified = Date.now();
    updateTemplate(currentTemplate.value);
    
    // Reset modified state
    uiStore.setModified(false);
    
    return currentTemplate.value.id;
  };

  // Initialize
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
