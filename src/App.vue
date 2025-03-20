<template>
  <div class="app">
    <header class="app-header">
      <div class="app-logo">
        <i class="fas fa-file-alt"></i>
        <h1 class="app-title">Obsidian Template Creator</h1>
      </div>
    </header>
    
    <main class="app-main">
      <TemplateCreatorView />
    </main>
    
    <footer class="app-footer">
      <p>&copy; {{ new Date().getFullYear() }} Obsidian Template Creator</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import TemplateCreatorView from './components/TemplateCreator/TemplateCreatorView.vue';
</script>

<style>
:root {
  --primary-color: #4f46e5;
  --secondary-color: #6366f1;
  --text-color: #334155;
  --light-bg: #f8fafc;
  --border-color: #e2e8f0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--text-color);
  background-color: var(--light-bg);
  line-height: 1.5;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 1rem;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-color);
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.app-main {
  flex: 1;
  padding: 0;
}

.app-footer {
  background-color: white;
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  border-top: 1px solid var(--border-color);
}
</style>
