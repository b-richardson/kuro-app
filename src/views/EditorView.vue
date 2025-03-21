<template>
  <div class="editor-view">
    <TemplateCreatorView
      ref="templateCreatorRef"
      :current-template-id="templateStore.currentTemplateId"
      :initial-sections="templateStore.currentSections"
      :initial-export-profile="exportProfile"
      :is-modified="isModified"
      @save="handleTemplateSave"
      @view-change="handleViewChange"
      @modified-change="handleModifiedChange"
      @sections-change="handleSectionsChange"
      @export-profile-change="handleExportProfileChange"
    />
    
    <!-- Confirmation Dialog for Navigating Away with Unsaved Changes -->
    <ConfirmationDialog
      v-model:show="showUnsavedChangesDialog"
      title="Unsaved Changes"
      message="You have unsaved changes that will be lost if you navigate away. What would you like to do?"
      variant="warning"
      confirm-button-text="Save & Continue"
      cancel-button-text="Discard Changes"
      @confirm="handleSaveAndNavigate"
      @cancel="handleDiscardAndNavigate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TemplateCreatorView from '../components/TemplateCreator/TemplateCreatorView.vue'
import ConfirmationDialog from '../components/UI/ConfirmationDialog.vue'
import { ExportProfileId } from '../components/TemplateCreator/ExportProfileSelector.vue'
import { useTemplateStore, useUIStore, usePreferencesStore } from '../stores'

// Route and router setup
const route = useRoute()
const router = useRouter()

// Get stores
const templateStore = useTemplateStore()
const uiStore = useUIStore()
const preferencesStore = usePreferencesStore()

// Component refs
const templateCreatorRef = ref<InstanceType<typeof TemplateCreatorView> | null>(null)

// Local state
const isModified = ref(false)

// Navigation state
const pendingNavigation = ref<string | null>(null)
const showUnsavedChangesDialog = ref(false)


// Computed properties
const exportProfile = computed<ExportProfileId>(() => {
  // Get export profile from preferences store
  const profileId = preferencesStore.activeExportProfileId
  if (!profileId && preferencesStore.exportProfiles.length > 0) {
    return preferencesStore.exportProfiles[0].id as ExportProfileId
  }
  return (profileId || 'full') as ExportProfileId
})

// Load data on mount
onMounted(() => {
  // Load templates and preferences
  templateStore.loadTemplates()
  preferencesStore.loadPreferences()
  preferencesStore.setLastVisitedView('editor')
  
  // Load template if ID is in the route
  const templateId = route.params.id as string
  if (templateId) {
    templateStore.loadTemplate(templateId)
  }
})

// Watch for route changes to load new templates
watch(() => route.params.id, (newId) => {
  if (newId && newId !== templateStore.currentTemplateId) {
    if (isModified.value) {
      pendingNavigation.value = newId as string
      showUnsavedChangesDialog.value = true
    } else {
      templateStore.loadTemplate(newId as string)
    }
  }
})

/**
 * Handles saving a template
 */
function handleTemplateSave(saveData: {
  id: string
  name: string
  description: string
  sections: any[]
  exportProfile: string
}) {
  try {
    // If it's a new template or template ID doesn't match current one
    if (!saveData.id || saveData.id !== templateStore.currentTemplateId) {
      const newId = templateStore.createTemplate(saveData.name)
      
      // Update sections
      templateStore.updateSectionOrder(saveData.sections)
      
      // Update the URL to reflect the new ID
      router.replace(`/editor/${newId}`)
      
      // Inform user
      uiStore.addToast('Template created successfully', 'success')
    } else {
      // Update existing template
      templateStore.updateTemplateName(saveData.name)
      templateStore.updateSectionOrder(saveData.sections)
      
      // Inform user
      uiStore.addToast('Template updated successfully', 'success')
    }
    
    // Update active export profile
    preferencesStore.setActiveExportProfile(saveData.exportProfile)
    
    // Reset modified state
    isModified.value = false
    
    return templateStore.currentTemplateId
  } catch (error) {
    uiStore.addToast(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    return null
  }
}

/**
 * Handle view change request, e.g., going back to library
 */
function handleViewChange(view: 'library' | 'editor') {
  if (view === 'library') {
    if (isModified.value) {
      pendingNavigation.value = '/library'
      showUnsavedChangesDialog.value = true
    } else {
      router.push('/library')
    }
  }
}

/**
 * Handle save and navigate action from dialog
 */
function handleSaveAndNavigate() {
  // Try to save the current template - temporarily disabled until component implementation
  // if (templateCreatorRef.value && 'saveTemplate' in templateCreatorRef.value) {
  //   (templateCreatorRef.value as any).saveTemplate()
  // }
    
  // After saving, navigate
  if (pendingNavigation.value) {
    if (pendingNavigation.value.startsWith('/')) {
      router.push(pendingNavigation.value)
    } else {
      templateStore.loadTemplate(pendingNavigation.value)
    }
    pendingNavigation.value = null
  }
  
  // Close dialog
  showUnsavedChangesDialog.value = false
}

/**
 * Handle discard and navigate action from dialog
 */
function handleDiscardAndNavigate() {
  // Reset modified state to avoid confirmation
  isModified.value = false
  
  // Navigate to destination
  if (pendingNavigation.value) {
    if (pendingNavigation.value.startsWith('/')) {
      router.push(pendingNavigation.value)
    } else {
      templateStore.loadTemplate(pendingNavigation.value)
    }
    pendingNavigation.value = null
  }
  
  // Close dialog
  showUnsavedChangesDialog.value = false
}

/**
 * Handles change to modified state
 */
function handleModifiedChange(modified: boolean) {
  isModified.value = modified
}

/**
 * Handle sections change event
 */
function handleSectionsChange(newSections: any[]) {
  if (templateStore.currentTemplate) {
    templateStore.updateSectionOrder(newSections)
  }
}

/**
 * Handle export profile change
 */
function handleExportProfileChange(profile: string) {
  preferencesStore.setActiveExportProfile(profile)
}

// Set up navigation guard
router.beforeEach((to, from, next) => {
  if (from.name === 'editor' && isModified.value && !showUnsavedChangesDialog.value) {
    pendingNavigation.value = to.fullPath
    showUnsavedChangesDialog.value = true
    next(false)
  } else {
    next()
  }
})
</script>

<style scoped>
.editor-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>