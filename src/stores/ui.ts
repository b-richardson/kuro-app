import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const showMarkdownPreview = ref(false)
  const currentView = ref('editor')
  const sidebarOpen = ref(true)
  const isDragging = ref(false)
  const toastMessages = ref<{id: string; message: string; type: string; timeout: number}[]>([])
  const isLoading = ref(false)

  // Actions
  function toggleMarkdownPreview() {
    showMarkdownPreview.value = !showMarkdownPreview.value
    saveUIPreferences()
  }

  function setMarkdownPreview(show: boolean) {
    showMarkdownPreview.value = show
    saveUIPreferences()
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
    saveUIPreferences()
  }

  function setSidebarOpen(open: boolean) {
    sidebarOpen.value = open
    saveUIPreferences()
  }

  function setIsDragging(dragging: boolean) {
    isDragging.value = dragging
  }

  function addToast(message: string, type: 'success' | 'error' | 'info' = 'info', timeout: number = 3000) {
    const id = Date.now().toString()
    toastMessages.value.push({ id, message, type, timeout })
    return id
  }

  function removeToast(id: string) {
    toastMessages.value = toastMessages.value.filter(toast => toast.id !== id)
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function loadUIPreferences() {
    const preferences = localStorage.getItem('ui-preferences')
    if (preferences) {
      const { showMarkdownPreview: showPreview, sidebarOpen: open } = JSON.parse(preferences)
      showMarkdownPreview.value = showPreview
      sidebarOpen.value = open
    }
  }

  function saveUIPreferences() {
    localStorage.setItem(
      'ui-preferences',
      JSON.stringify({
        showMarkdownPreview: showMarkdownPreview.value,
        sidebarOpen: sidebarOpen.value
      })
    )
  }

  return {
    showMarkdownPreview,
    currentView,
    sidebarOpen,
    isDragging,
    toastMessages,
    isLoading,
    toggleMarkdownPreview,
    setMarkdownPreview,
    toggleSidebar,
    setSidebarOpen,
    setIsDragging,
    addToast,
    removeToast,
    setLoading,
    loadUIPreferences,
    saveUIPreferences
  }
})
