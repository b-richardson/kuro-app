<template>
  <div class="export-profile">
    <div class="export-profile__header">
      <h3 class="export-profile__title">Export Profile</h3>
      <div class="export-profile__info-icon" title="Select how your template should be formatted for different Obsidian plugin dependencies">
        <i class="fas fa-info-circle"></i>
      </div>
    </div>
    
    <div class="export-profile__options">
      <div 
        v-for="profile in exportProfiles" 
        :key="profile.id"
        class="export-profile__option"
        :class="{ 'export-profile__option--active': selectedProfile === profile.id }"
        @click="selectProfile(profile.id)"
      >
        <div class="export-profile__radio">
          <div class="export-profile__radio-button"></div>
        </div>
        <div class="export-profile__details">
          <div class="export-profile__name">{{ profile.name }}</div>
          <div class="export-profile__description">{{ profile.description }}</div>
        </div>
        <div class="export-profile__icon">
          <i :class="profile.icon"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

export type ExportProfileId = 'plain' | 'templater' | 'dataview' | 'full';

interface ExportProfile {
  id: ExportProfileId;
  name: string;
  description: string;
  icon: string;
}

const props = defineProps<{
  modelValue?: ExportProfileId;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: ExportProfileId): void;
}>();

const exportProfiles: ExportProfile[] = [
  {
    id: 'plain',
    name: 'Plain Markdown',
    description: 'Converts all plugin-specific syntax to plain markdown. Works without any plugins.',
    icon: 'fas fa-file-alt'
  },
  {
    id: 'templater',
    name: 'Templater-Ready',
    description: 'Maintains Templater fields but converts other plugin syntax to plain markdown.',
    icon: 'fas fa-calendar-alt'
  },
  {
    id: 'dataview',
    name: 'Dataview-Compatible',
    description: 'Preserves Dataview queries but converts other plugin syntax to plain markdown.',
    icon: 'fas fa-database'
  },
  {
    id: 'full',
    name: 'Full Plugin Suite',
    description: 'Keeps all plugin-specific syntax (Templater, Dataview, Kanban) intact.',
    icon: 'fas fa-puzzle-piece'
  }
];

const selectedProfile = ref<ExportProfileId>(props.modelValue || 'plain');

const selectProfile = (profileId: ExportProfileId) => {
  selectedProfile.value = profileId;
  emit('update:modelValue', profileId);
};

onMounted(() => {
  // Ensure the initial value is emitted
  if (!props.modelValue) {
    emit('update:modelValue', selectedProfile.value);
  }
});
</script>

<style scoped>
.export-profile {
  background-color: white;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(230, 235, 245, 0.8);
}

.export-profile__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.export-profile__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.export-profile__info-icon {
  color: #94a3b8;
  cursor: help;
  font-size: 0.875rem;
}

.export-profile__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.export-profile__option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.export-profile__option:hover {
  background-color: #f8fafc;
}

.export-profile__option--active {
  background-color: #f0f9ff;
  border-color: #bae6fd;
}

.export-profile__option--active .export-profile__radio-button {
  transform: scale(1);
}

.export-profile__radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.export-profile__option--active .export-profile__radio {
  border-color: #4f46e5;
}

.export-profile__radio-button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4f46e5;
  transform: scale(0);
  transition: transform 0.2s ease;
}

.export-profile__details {
  flex: 1;
}

.export-profile__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.export-profile__description {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
  line-height: 1.2;
}

.export-profile__icon {
  color: #94a3b8;
  font-size: 1rem;
  flex-shrink: 0;
}

.export-profile__option--active .export-profile__icon {
  color: #4f46e5;
}

@media (max-width: 640px) {
  .export-profile__description {
    display: none;
  }
  
  .export-profile__option {
    padding: 0.5rem;
  }
}
</style>