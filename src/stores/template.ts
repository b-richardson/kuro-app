import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TemplateSection } from '../types/TemplateSection'
import { v4 as uuidv4 } from 'uuid'

export const useTemplateStore = defineStore('template', () => {
  // State
  const templates = ref<{ id: string; name: string; sections: TemplateSection[] }[]>([])
  const currentTemplateId = ref<string>('')

  // Getters
  const currentTemplate = computed(() => {
    return templates.value.find(t => t.id === currentTemplateId.value) || null
  })

  const currentSections = computed(() => {
    return currentTemplate.value?.sections || []
  })

  // Actions
  function loadTemplates() {
    const storedTemplates = localStorage.getItem('templates')
    if (storedTemplates) {
      templates.value = JSON.parse(storedTemplates)
    }
  }

  function saveTemplates() {
    localStorage.setItem('templates', JSON.stringify(templates.value))
  }

  function createTemplate(name: string = 'New Template') {
    const id = uuidv4()
    templates.value.push({
      id,
      name,
      sections: []
    })
    currentTemplateId.value = id
    saveTemplates()
    return id
  }

  function loadTemplate(id: string) {
    currentTemplateId.value = id
    return currentTemplate.value
  }

  function updateTemplateName(name: string) {
    if (currentTemplate.value) {
      currentTemplate.value.name = name
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
    if (currentTemplate.value) {
      currentTemplate.value.sections.push(section)
      saveTemplates()
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
        saveTemplates()
      }
    }
  }

  function deleteSection(sectionId: string) {
    if (currentTemplate.value) {
      const index = currentTemplate.value.sections.findIndex(s => s.id === sectionId)
      if (index !== -1) {
        currentTemplate.value.sections.splice(index, 1)
        saveTemplates()
      }
    }
  }

  function updateSectionOrder(newOrder: TemplateSection[]) {
    if (currentTemplate.value) {
      currentTemplate.value.sections = newOrder
      saveTemplates()
    }
  }

  return {
    templates,
    currentTemplateId,
    currentTemplate,
    currentSections,
    loadTemplates,
    saveTemplates,
    createTemplate,
    loadTemplate,
    updateTemplateName,
    deleteTemplate,
    addSection,
    updateSection,
    deleteSection,
    updateSectionOrder
  }
})
