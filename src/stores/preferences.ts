import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePreferencesStore = defineStore('preferences', () => {
  // State
  const exportProfiles = ref<{id: string; name: string; options: Record<string, any>}[]>([])
  const activeExportProfileId = ref<string>('')
  const lastVisitedView = ref<string>('home')

  // Actions
  function loadPreferences() {
    const storedPreferences = localStorage.getItem('user-preferences')
    if (storedPreferences) {
      const preferences = JSON.parse(storedPreferences)
      exportProfiles.value = preferences.exportProfiles || []
      activeExportProfileId.value = preferences.activeExportProfileId || ''
      lastVisitedView.value = preferences.lastVisitedView || 'home'
    } else {
      // Create default export profile if none exists
      if (exportProfiles.value.length === 0) {
        createExportProfile('Default', {
          includeYaml: true,
          includeTemplaterFields: true,
          includeDataview: true
        })
      }
    }
  }

  function savePreferences() {
    localStorage.setItem(
      'user-preferences',
      JSON.stringify({
        exportProfiles: exportProfiles.value,
        activeExportProfileId: activeExportProfileId.value,
        lastVisitedView: lastVisitedView.value
      })
    )
  }

  function createExportProfile(name: string, options: Record<string, any> = {}) {
    const id = Date.now().toString()
    exportProfiles.value.push({ id, name, options })
    if (exportProfiles.value.length === 1) {
      activeExportProfileId.value = id
    }
    savePreferences()
    return id
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
    const index = exportProfiles.value.findIndex(p => p.id === id)
    if (index !== -1) {
      exportProfiles.value.splice(index, 1)
      if (activeExportProfileId.value === id) {
        activeExportProfileId.value = exportProfiles.value.length > 0 ? exportProfiles.value[0].id : ''
      }
      savePreferences()
    }
  }

  function setActiveExportProfile(id: string) {
    activeExportProfileId.value = id
    savePreferences()
  }

  function setLastVisitedView(view: string) {
    lastVisitedView.value = view
    savePreferences()
  }

  return {
    exportProfiles,
    activeExportProfileId,
    lastVisitedView,
    loadPreferences,
    savePreferences,
    createExportProfile,
    updateExportProfile,
    deleteExportProfile,
    setActiveExportProfile,
    setLastVisitedView
  }
})
