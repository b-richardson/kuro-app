<template>
  <div class="library-view">
    <AppHeader 
      view="library"
      :sections="[]"
      @new-template="goToNewTemplate"
    />
    
    <div class="library-container">
        <TemplateLibrary
        :current-template-id="templateStore.currentTemplateId"
        :is-modified="false"
        :export-profile="exportProfile"
        @create-new="goToNewTemplate"
        @load="loadTemplate"
        @delete="handleTemplateDelete"
        @duplicate="handleTemplateDuplicate"
        @export="handleTemplateExport"
        @import-complete="handleImportComplete"
        @notification="handleNotification"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/Layout/AppHeader.vue'
import TemplateLibrary from '../components/TemplateCreator/TemplateLibrary.vue'
import { ExportProfileId } from '../components/TemplateCreator/ExportProfileSelector.vue'
import { useTemplateStore, useUIStore, usePreferencesStore } from '../stores'

// Setup router for navigation
const router = useRouter()

// Get stores
const templateStore = useTemplateStore()
const uiStore = useUIStore()
const preferencesStore = usePreferencesStore()

// Load data from stores
onMounted(() => {
  templateStore.loadTemplates()
  preferencesStore.loadPreferences()
  preferencesStore.setLastVisitedView('library')
})


// Get active export profile
const exportProfile = computed<ExportProfileId>(() => {
  const profileId = preferencesStore.activeExportProfileId
  if (!profileId && preferencesStore.exportProfiles.length > 0) {
    return preferencesStore.exportProfiles[0].id as ExportProfileId
  }
  return (profileId || 'full') as ExportProfileId
})

// Navigation handlers
const goToNewTemplate = () => {
  router.push('/editor')
}

const loadTemplate = (id: string) => {
  templateStore.loadTemplate(id)
  router.push(`/editor/${id}`)
}

// Implement event handlers
const handleTemplateDelete = async (id: string) => {
  templateStore.deleteTemplate(id)
  uiStore.addToast('Template deleted successfully', 'success')
}

const handleTemplateDuplicate = (id: string) => {
  const templateToDuplicate = templateStore.templates.find(t => t.id === id)
  if (templateToDuplicate) {
    const newId = templateStore.createTemplate(templateToDuplicate.name + ' (Copy)')
    const template = templateStore.templates.find(t => t.id === newId)
    if (template) {
      template.sections = JSON.parse(JSON.stringify(templateToDuplicate.sections))
      templateStore.saveTemplates()
      uiStore.addToast('Template duplicated successfully', 'success')
    }
  }
}

const handleTemplateExport = (id: string) => {
  // The logic for exporting will be handled in the TemplateLibrary component
  uiStore.addToast('Template exported successfully', 'success')
}

const handleImportComplete = (count: number) => {
  uiStore.addToast(`${count} templates imported successfully`, 'success')
}

const handleNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
  uiStore.addToast(message, type as any)
}
</script>

<style scoped>
.library-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.library-container {
  flex: 1;
  overflow: auto;
  padding: 0 1rem;
}
</style>