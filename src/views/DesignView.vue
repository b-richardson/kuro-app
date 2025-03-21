<template>
  <div class="design-view">
    <AppHeader title="Design System" :show-back-button="true" @back="handleBack">
      <template #actions>
        <div class="theme-toggle">
          <button class="btn" @click="toggleTheme">
            <i :class="isDarkTheme ? 'fas fa-sun' : 'fas fa-moon'"></i>
            {{ isDarkTheme ? 'Light Mode' : 'Dark Mode' }}
          </button>
        </div>
      </template>
    </AppHeader>
    
    <div class="design-content">
      <DesignSystemDemo />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '@/components/Layout/AppHeader.vue';
import DesignSystemDemo from '@/components/UI/DesignSystemDemo.vue';

const router = useRouter();
const theme = ref('dark');

const isDarkTheme = computed(() => theme.value === 'dark');

const handleBack = () => {
  router.push({ name: 'home' });
};

const toggleTheme = () => {
  theme.value = isDarkTheme.value ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme.value);
};

// Set initial theme
onMounted(() => {
  // Check for stored preference or use system preference
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  theme.value = savedTheme;
  document.documentElement.setAttribute('data-theme', theme.value);
});
</script>

<style scoped>
.design-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.design-content {
  flex: 1;
  padding-bottom: var(--spacing-xl);
}

.theme-toggle {
  display: flex;
  align-items: center;
}

.theme-toggle .btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.theme-toggle i {
  font-size: 1rem;
}
</style>