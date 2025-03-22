<template>
  <div class="dashboard-container">
    <!-- User Greeting -->
    <UserGreeting />
    
    <!-- Recent Templates -->
    <RecentTemplates />
    
    <!-- Recent Activity -->
    <RecentActivity />
    
    <!-- Quick Links -->
    <QuickLinks />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTemplateStore } from '@/stores/template';
import UserGreeting from '@/components/dashboard/UserGreeting.vue';
import RecentTemplates from '@/components/dashboard/RecentTemplates.vue';
import RecentActivity from '@/components/dashboard/RecentActivity.vue';
import QuickLinks from '@/components/dashboard/QuickLinks.vue';

const templateStore = useTemplateStore();

// Initialize by loading templates
onMounted(async () => {
  await templateStore.loadTemplates();
});
</script>

<style scoped>
.dashboard-container {
  padding: var(--spacing-md);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Animation for entering elements */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dashboard-container > * {
  animation: fadeIn 0.4s ease-out both;
}

.dashboard-container > *:nth-child(1) {
  animation-delay: 0s;
}

.dashboard-container > *:nth-child(2) {
  animation-delay: 0.1s;
}

.dashboard-container > *:nth-child(3) {
  animation-delay: 0.2s;
}

.dashboard-container > *:nth-child(4) {
  animation-delay: 0.3s;
}

/* Customize component colors to match theme */
.user-greeting {
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05), rgba(var(--color-primary-rgb), 0.1));
}

.greeting-text {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  background-clip: text;
}

.primary-action-button {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text);
}

.section-header h3 i {
  color: var(--color-primary);
}

/* Responsive styling */
@media (max-width: 768px) {
  .dashboard-container {
    padding: var(--spacing-sm);
    gap: var(--spacing-md);
  }
}
</style>