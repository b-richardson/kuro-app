<template>
  <div class="module-card glass-card" @click="$emit('click')">
    <div class="module-icon">
      <i :class="icon"></i>
      <div v-if="pluginIcon" class="plugin-badge">
        <i :class="pluginIcon"></i>
      </div>
    </div>
    <div class="module-info">
      <h4 class="module-title">{{ title }}</h4>
      <p v-if="showDescription" class="module-description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  pluginIcon: {
    type: String,
    default: null
  },
  showDescription: {
    type: Boolean,
    default: true
  }
});

defineEmits(['click']);
</script>

<style scoped>
.module-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-surface);
  gap: var(--spacing-sm);
  box-shadow: var(--glass-shadow);
  margin-bottom: var(--spacing-xs);
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.1);
}

.module-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 0.9rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  position: relative;
}

.plugin-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.module-info {
  flex: 1;
}

.module-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.module-description {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: var(--spacing-xs) 0 0;
  line-height: 1.3;
}

@media (max-width: 768px) {
  .module-card {
    padding: var(--spacing-xs);
  }
  
  .module-icon {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  
  .module-title {
    font-size: 0.85rem;
  }
  
  .module-description {
    font-size: 0.7rem;
  }
}
</style>