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
          <router-link to="/library" class="btn btn-primary">
            <i class="fas fa-book-open"></i> Browse Templates
          </router-link>
          <router-link to="/editor" class="btn btn-secondary">
            <i class="fas fa-plus"></i> Create New Template
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
  background: linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%);
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
  background: linear-gradient(to right, #1e293b, #4f46e5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.home-subtitle {
  font-size: 1.25rem;
  color: #64748b;
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
  background-color: #4f46e5;
  color: white;
  border: none;
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
}

.btn-primary:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(79, 70, 229, 0.3);
}

.btn-secondary {
  background-color: white;
  color: #4f46e5;
  border: 1px solid #4f46e5;
}

.btn-secondary:hover {
  background-color: rgba(79, 70, 229, 0.1);
  transform: translateY(-2px);
}

.home-features {
  padding: 2rem 0 4rem;
}

.home-section-title {
  text-align: center;
  font-size: 1.75rem;
  color: #1e293b;
  margin-bottom: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: white;
  padding: 2rem;
  border-radius: 0.75rem;
  text-align: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(230, 235, 245, 0.8);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-radius: 50%;
  margin: 0 auto 1.25rem;
}

.feature-icon i {
  font-size: 1.5rem;
  color: #4f46e5;
}

.feature-title {
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.feature-description {
  font-size: 0.95rem;
  color: #64748b;
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