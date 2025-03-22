<template>
  <div class="user-greeting glass-card">
    <h2 class="greeting-text">{{ greeting }}, {{ username }}!</h2>
    <div class="quick-actions">
      <button class="primary-action-button" @click="createNewTemplate">
        <i class="fas fa-plus"></i> Create New Template
      </button>
      <button class="secondary-action-button" @click="browseTemplateLibrary">
        <i class="fas fa-book"></i> Browse Template Library
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTemplateStore } from '@/stores/template';

const router = useRouter();
const authStore = useAuthStore();
const templateStore = useTemplateStore();

// Get username from store or use default
const username = computed(() => authStore.user?.name || 'there');

// Dynamic greeting based on time of day
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

// Navigation functions
const createNewTemplate = () => {
  const id = templateStore.createNewTemplate();
  router.push({ name: 'editor', params: { id } });
};

const browseTemplateLibrary = () => {
  router.push({ name: 'templateLibrary' });
};
</script>

<style scoped>
.user-greeting {
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05), rgba(var(--color-primary-rgb), 0.1));
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.greeting-text {
  font-size: 1.6rem;
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quick-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xs);
}

.primary-action-button,
.secondary-action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.primary-action-button {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(var(--color-primary-rgb), 0.2);
}

.primary-action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(var(--color-primary-rgb), 0.3);
}

.secondary-action-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
}

.secondary-action-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* Responsive styling */
@media (max-width: 768px) {
  .quick-actions {
    flex-direction: column;
  }
  
  .greeting-text {
    font-size: 1.4rem;
  }
}
</style>