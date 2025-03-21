import { defineStore } from 'pinia'
import { ref } from 'vue'

export type FocusMode = 'none' | 'editor' | 'preview'

export const useUIStore = defineStore('ui', () => {
  // State
  const showMarkdownPreview = ref(false)
  const currentView = ref('editor')
  const sidebarHidden = ref(false)
  const isDragging = ref(false)
  const toastMessages = ref<{id: string; message: string; type: string; timeout: number}[]>([])
  const isLoading = ref(false)
  const isModified = ref(false)
  const editorWidth = ref(50) // Percentage of editor panel width
  const focusMode = ref<FocusMode>('none')
  
  // Confirmation dialog state
  const showConfirmDialog = ref(false)
  const confirmDialogTitle = ref('')
  const confirmDialogMessage = ref('')
  const confirmDialogConfirmText = ref('Confirm')
  const confirmDialogCancelText = ref('Cancel')
  const confirmDialogConfirmCallback = ref<(() => void) | null>(null)
  const confirmDialogCancelCallback = ref<(() => void) | null>(null)

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
    sidebarHidden.value = !sidebarHidden.value
    saveUIPreferences()
  }

  function setSidebarHidden(hidden: boolean) {
    sidebarHidden.value = hidden
    saveUIPreferences()
  }

  function setIsDragging(dragging: boolean) {
    isDragging.value = dragging
  }

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', timeout: number = 3000) {
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
  
  function setModified(modified: boolean) {
    isModified.value = modified
  }
  
  function setEditorWidth(width: number) {
    editorWidth.value = width
    saveUIPreferences()
  }
  
  function setFocusMode(mode: FocusMode) {
    focusMode.value = mode
    saveUIPreferences()
  }
  
  function showConfirmationDialog(
    title: string, 
    message: string, 
    confirmText: string = 'Confirm', 
    cancelText: string = 'Cancel',
    onConfirm: (() => void) | null = null,
    onCancel: (() => void) | null = null
  ) {
    confirmDialogTitle.value = title
    confirmDialogMessage.value = message
    confirmDialogConfirmText.value = confirmText
    confirmDialogCancelText.value = cancelText
    confirmDialogConfirmCallback.value = onConfirm
    confirmDialogCancelCallback.value = onCancel
    showConfirmDialog.value = true
  }
  
  function handleConfirmDialogConfirm() {
    if (confirmDialogConfirmCallback.value) {
      confirmDialogConfirmCallback.value()
    }
    showConfirmDialog.value = false
  }
  
  function handleConfirmDialogCancel() {
    if (confirmDialogCancelCallback.value) {
      confirmDialogCancelCallback.value()
    }
    showConfirmDialog.value = false
  }

  function loadUIPreferences() {
    const preferences = localStorage.getItem('ui-preferences')
    if (preferences) {
      const { 
        showMarkdownPreview: showPreview, 
        sidebarHidden: hidden,
        editorWidth: width,
        focusMode: mode
      } = JSON.parse(preferences)
      
      showMarkdownPreview.value = showPreview ?? false
      sidebarHidden.value = hidden ?? false
      editorWidth.value = width ?? 50
      focusMode.value = mode ?? 'none'
    }
  }

  function saveUIPreferences() {
    localStorage.setItem(
      'ui-preferences',
      JSON.stringify({
        showMarkdownPreview: showMarkdownPreview.value,
        sidebarHidden: sidebarHidden.value,
        editorWidth: editorWidth.value,
        focusMode: focusMode.value
      })
    )
  }

  return {
    showMarkdownPreview,
    currentView,
    sidebarHidden,
    isDragging,
    toastMessages,
    isLoading,
    isModified,
    editorWidth,
    focusMode,
    showConfirmDialog,
    confirmDialogTitle,
    confirmDialogMessage,
    confirmDialogConfirmText,
    confirmDialogCancelText,
    toggleMarkdownPreview,
    setMarkdownPreview,
    toggleSidebar,
    setSidebarHidden,
    setIsDragging,
    showToast,
    removeToast,
    setLoading,
    setModified,
    setEditorWidth,
    setFocusMode,
    showConfirmationDialog,
    handleConfirmDialogConfirm,
    handleConfirmDialogCancel,
    loadUIPreferences,
    saveUIPreferences
  }
})
