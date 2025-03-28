import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePreferencesStore = defineStore('preferences', () => {
  // State
  const lastVisitedView = ref<string>('landing')
  const editorTheme = ref<string>('light')

  // Actions
  function loadPreferences() {
    try {
      const storedPreferences = localStorage.getItem('user-preferences')
      if (storedPreferences) {
        const preferences = JSON.parse(storedPreferences)
        lastVisitedView.value = preferences.lastVisitedView || 'landing'
        editorTheme.value = preferences.editorTheme || 'light'
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }

  function savePreferences() {
    try {
      localStorage.setItem(
        'user-preferences',
        JSON.stringify({
          lastVisitedView: lastVisitedView.value,
          editorTheme: editorTheme.value
        })
      )
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
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
    lastVisitedView,
    editorTheme,
    loadPreferences,
    savePreferences,
    setLastVisitedView,
    setEditorTheme,
    saveEditorWidth
  }
})
