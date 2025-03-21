<template>
  <div class="home">
    <div class="home-container">
      <div class="home-hero">
        <div class="home-logo">
          <img src="/template-icon.svg" alt="Obsidian Template Creator" />
        </div>
        <h1 class="home-title">Obsidian Template Creator</h1>
        <p class="home-subtitle">Create and manage your Obsidian templates with powerful editing tools</p>
        
        <div class="home-actions">
          <router-link to="/library" custom v-slot="{ navigate }">
            <PrimaryButton @click="navigate" icon="fas fa-book-open" size="large">
              Browse Templates
            </PrimaryButton>
          </router-link>
          
          <router-link to="/editor" custom v-slot="{ navigate }">
            <button @click="navigate" class="btn btn-secondary">
              <i class="fas fa-plus"></i> Create New Template
            </button>
          </router-link>
          
          <router-link to="/design" custom v-slot="{ navigate }">
            <button @click="navigate" class="btn btn-outline">
              <i class="fas fa-palette"></i> Design System
            </button>
          </router-link>
        </div>
      </div>
      
      <div class="home-features">
        <h2 class="home-section-title">Key Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-columns"></i>
            </div>
            <h3 class="feature-title">Side-by-Side Editing</h3>
            <p class="feature-description">
              Edit your template with a real-time preview to see changes instantly
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-cubes"></i>
            </div>
            <h3 class="feature-title">Section-Based Templates</h3>
            <p class="feature-description">
              Build templates from reusable sections and components
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-file-export"></i>
            </div>
            <h3 class="feature-title">Multiple Export Formats</h3>
            <p class="feature-description">
              Export templates for Templater, Dataview, or plain markdown
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-cloud"></i>
            </div>
            <h3 class="feature-title">Save & Share</h3>
            <p class="feature-description">
              Save your templates locally or share with others
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePreferencesStore } from '../stores'
import PrimaryButton from '../components/UI/PrimaryButton.vue'

// Get the preferences store
const preferenceStore = usePreferencesStore()

// Set the last visited view to 'home'
onMounted(() => {
  preferenceStore.setLastVisitedView('home')
})
</script>

<style scoped>
.home {
  height: 100vh;
  overflow-y: auto;
  /* No background here, using the GradientBackground component in App.vue */
  position: relative;
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.home-hero {
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.home-logo {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

.home-logo img {
  width: 100%;
  height: auto;
}

.home-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(to right, var(--color-primary-light), var(--color-primary-dark));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.home-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto 2rem;
}

.home-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-text-dark);
  border: none;
  box-shadow: 0 4px 6px rgba(255, 171, 88, 0.2);
}

.btn-primary:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(255, 171, 88, 0.3);
}

.btn-secondary {
  background-color: var(--glass-background);
  color: var(--color-text);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-outline {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--glass-border);
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary-light);
  transform: translateY(-2px);
}

.home-features {
  padding: 2rem 0 4rem;
}

.home-section-title {
  text-align: center;
  font-size: 1.75rem;
  color: var(--color-text);
  margin-bottom: 2rem;
  background: linear-gradient(to right, var(--color-text), var(--color-primary-light));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  padding: 0 1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  /* Use the glass-card class from our design system */
  padding: 2rem;
  border-radius: var(--radius-md);
  text-align: center;
  box-shadow: var(--glass-shadow);
  transition: all 0.3s ease;
  border: 1px solid var(--glass-border);
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}

.feature-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.4);
  border-color: var(--color-primary);
}

.feature-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 171, 88, 0.2) 0%, rgba(255, 204, 112, 0.2) 100%);
  border-radius: 50%;
  margin: 0 auto 1.25rem;
}

.feature-icon i {
  font-size: 1.5rem;
  color: var(--color-primary);
}

.feature-title {
  font-size: 1.25rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.feature-description {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .home-hero {
    padding: 2rem 1rem;
  }
  
  .home-title {
    font-size: 2rem;
  }
  
  .home-subtitle {
    font-size: 1.1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .home-actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>