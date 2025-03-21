import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TemplateSection } from '../types/TemplateSection'
import { v4 as uuidv4 } from 'uuid'
import { useUIStore } from './ui'

export interface Template {
  id: string
  name: string
  description?: string
  sections: TemplateSection[]
  createdAt?: number
  updatedAt?: number
}

export const useTemplateStore = defineStore('template', () => {
  // State
  const templates = ref<Template[]>([])
  const currentTemplateId = ref<string>('')

  // Get UI store for status updates
  const uiStore = useUIStore()

  // Getters
  const currentTemplate = computed(() => {
    return templates.value.find(t => t.id === currentTemplateId.value) || null
  })

  const currentSections = computed(() => {
    return currentTemplate.value?.sections || []
  })

  // Actions
  function loadTemplates() {
    try {
      const storedTemplates = localStorage.getItem('templates')
      if (storedTemplates) {
        templates.value = JSON.parse(storedTemplates)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
      uiStore.showToast('Failed to load templates', 'error')
    }
  }

  function saveTemplates() {
    try {
      localStorage.setItem('templates', JSON.stringify(templates.value))
    } catch (error) {
      console.error('Failed to save templates:', error)
      uiStore.showToast('Failed to save templates', 'error')
    }
  }

  function createNewTemplate() {
    currentTemplateId.value = ''
    // We don't add to templates array yet - it will be added on first save
  }

  function createTemplate(name: string = 'New Template', description: string = '') {
    const id = uuidv4()
    const now = Date.now()
    
    templates.value.push({
      id,
      name,
      description,
      sections: [],
      createdAt: now,
      updatedAt: now
    })
    
    currentTemplateId.value = id
    saveTemplates()
    return id
  }

  function loadTemplate(id: string) {
    if (!id) {
      createNewTemplate()
      return null
    }
    
    const template = templates.value.find(t => t.id === id)
    if (!template) {
      throw new Error(`Template with ID ${id} not found`)
    }
    
    currentTemplateId.value = id
    return template
  }

  function updateTemplateName(name: string) {
    if (currentTemplate.value) {
      currentTemplate.value.name = name
      currentTemplate.value.updatedAt = Date.now()
      saveTemplates()
    }
  }

  function updateTemplateDescription(description: string) {
    if (currentTemplate.value) {
      currentTemplate.value.description = description
      currentTemplate.value.updatedAt = Date.now()
      saveTemplates()
    }
  }

  function deleteTemplate(id: string) {
    const index = templates.value.findIndex(t => t.id === id)
    if (index !== -1) {
      templates.value.splice(index, 1)
      if (currentTemplateId.value === id) {
        currentTemplateId.value = templates.value.length > 0 ? templates.value[0].id : ''
      }
      saveTemplates()
    }
  }

  function addSection(section: TemplateSection) {
    // If no current template, create one
    if (!currentTemplate.value && currentTemplateId.value === '') {
      createTemplate()
    }
    
    if (currentTemplate.value) {
      currentTemplate.value.sections.push(section)
      currentTemplate.value.updatedAt = Date.now()
    }
  }

  function updateSection(sectionId: string, updatedSection: Partial<TemplateSection>) {
    if (currentTemplate.value) {
      const index = currentTemplate.value.sections.findIndex(s => s.id === sectionId)
      if (index !== -1) {
        currentTemplate.value.sections[index] = {
          ...currentTemplate.value.sections[index],
          ...updatedSection
        }
        currentTemplate.value.updatedAt = Date.now()
      }
    }
  }

  function deleteSection(sectionId: string) {
    if (currentTemplate.value) {
      const index = currentTemplate.value.sections.findIndex(s => s.id === sectionId)
      if (index !== -1) {
        currentTemplate.value.sections.splice(index, 1)
        currentTemplate.value.updatedAt = Date.now()
      }
    }
  }

  function updateSections(newSections: TemplateSection[]) {
    if (currentTemplate.value) {
      currentTemplate.value.sections = [...newSections]
      currentTemplate.value.updatedAt = Date.now()
    }
  }

  async function saveCurrentTemplate() {
    if (!currentTemplate.value) {
      // No template loaded, create a new one
      if (currentSections.value.length > 0) {
        const id = createTemplate()
        return id
      }
      throw new Error('No template to save')
    }
    
    // Update timestamp
    currentTemplate.value.updatedAt = Date.now()
    saveTemplates()
    
    // Reset modified state
    uiStore.setModified(false)
    
    return currentTemplate.value.id
  }

  return {
    templates,
    currentTemplateId,
    currentTemplate,
    currentSections,
    loadTemplates,
    saveTemplates,
    createNewTemplate,
    createTemplate,
    loadTemplate,
    updateTemplateName,
    updateTemplateDescription,
    deleteTemplate,
    addSection,
    updateSection,
    deleteSection,
    updateSections,
    saveCurrentTemplate
  }
})
