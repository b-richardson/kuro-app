import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ExportProfileId = 'plain' | 'templater' | 'dataview' | 'full';

export interface ExportProfile {
  id: ExportProfileId
  name: string
  options: Record<string, any>
}

export const usePreferencesStore = defineStore('preferences', () => {
  // State
  const exportProfiles = ref<ExportProfile[]>([])
  const activeExportProfileId = ref<string>('')
  const lastVisitedView = ref<string>('home')
  const editorTheme = ref<string>('light')

  // Getters
  const currentExportProfile = computed(() => {
    return exportProfiles.value.find(p => p.id === activeExportProfileId.value) || 
      (exportProfiles.value.length > 0 ? exportProfiles.value[0] : null)
  })

  // Actions
  function loadPreferences() {
    try {
      const storedPreferences = localStorage.getItem('user-preferences')
      if (storedPreferences) {
        const preferences = JSON.parse(storedPreferences)
        exportProfiles.value = preferences.exportProfiles || []
        activeExportProfileId.value = preferences.activeExportProfileId || ''
        lastVisitedView.value = preferences.lastVisitedView || 'home'
        editorTheme.value = preferences.editorTheme || 'light'
      }
      
      // Create default export profiles if none exist
      if (exportProfiles.value.length === 0) {
        createDefaultProfiles()
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
      // Create default export profiles if there was an error
      createDefaultProfiles()
    }
  }

  function savePreferences() {
    try {
      localStorage.setItem(
        'user-preferences',
        JSON.stringify({
          exportProfiles: exportProfiles.value,
          activeExportProfileId: activeExportProfileId.value,
          lastVisitedView: lastVisitedView.value,
          editorTheme: editorTheme.value
        })
      )
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  function createDefaultProfiles() {
    // Create profiles matching our expected export profile IDs
    createExportProfile('Full Plugin Suite', {
      includeYaml: true,
      includeTemplaterFields: true,
      includeDataview: true,
      useStandardFormatting: true
    }, 'full')
    
    createExportProfile('Plain Markdown', {
      includeYaml: true,
      includeTemplaterFields: false,
      includeDataview: false,
      useStandardFormatting: true
    }, 'plain')
    
    createExportProfile('Templater-Ready', {
      includeYaml: true,
      includeTemplaterFields: true,
      includeDataview: false,
      useStandardFormatting: true
    }, 'templater')
    
    createExportProfile('Dataview-Compatible', {
      includeYaml: true,
      includeTemplaterFields: false,
      includeDataview: true,
      useStandardFormatting: true
    }, 'dataview')
    
    // Set the full profile as active
    setActiveExportProfile('full')
  }

  function createExportProfile(name: string, options: Record<string, any> = {}, id?: ExportProfileId) {
    // Use provided ID or generate timestamp-based one
    const profileId = id || (Date.now().toString() as ExportProfileId)
    exportProfiles.value.push({ id: profileId, name, options })
    if (exportProfiles.value.length === 1) {
      activeExportProfileId.value = profileId
    }
    savePreferences()
    return profileId
  }

  function updateExportProfile(id: string, name?: string, options?: Record<string, any>) {
    const profile = exportProfiles.value.find(p => p.id === id)
    if (profile) {
      if (name) profile.name = name
      if (options) profile.options = { ...profile.options, ...options }
      savePreferences()
    }
  }

  function deleteExportProfile(id: string) {
    // Don't delete if it's the only profile
    if (exportProfiles.value.length <= 1) {
      return false
    }
    
    const index = exportProfiles.value.findIndex(p => p.id === id)
    if (index !== -1) {
      exportProfiles.value.splice(index, 1)
      if (activeExportProfileId.value === id) {
        activeExportProfileId.value = exportProfiles.value.length > 0 ? exportProfiles.value[0].id : ''
      }
      savePreferences()
      return true
    }
    return false
  }

  function setActiveExportProfile(id: string) {
    const profile = exportProfiles.value.find(p => p.id === id)
    if (profile) {
      activeExportProfileId.value = id
      savePreferences()
      return true
    }
    return false
  }

  function setLastVisitedView(view: string) {
    lastVisitedView.value = view
    savePreferences()
  }
  
  function setEditorTheme(theme: string) {
    editorTheme.value = theme
    savePreferences()
  }
  
  function saveEditorWidth(width: number) {
    // This function will be called when the resize handle is released
    // to save the editor width preference
    savePreferences()
  }

  return {
    exportProfiles,
    activeExportProfileId,
    lastVisitedView,
    editorTheme,
    currentExportProfile,
    loadPreferences,
    savePreferences,
    createExportProfile,
    updateExportProfile,
    deleteExportProfile,
    setActiveExportProfile,
    setLastVisitedView,
    setEditorTheme,
    saveEditorWidth
  }
})
