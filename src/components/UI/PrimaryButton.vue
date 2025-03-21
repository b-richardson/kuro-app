<template>
  <button 
    class="primary-button" 
    :class="{ 
      'primary-button--small': size === 'small',
      'primary-button--large': size === 'large',
      'primary-button--icon-only': iconOnly
    }"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <i v-if="icon" :class="icon" class="primary-button__icon"></i>
    <span v-if="!iconOnly" class="primary-button__text"><slot></slot></span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: ''
  },
  iconOnly: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value: string) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style scoped>
.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  /* Gradient background */
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(255, 171, 88, 0.2);
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 171, 88, 0.3);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
}

.primary-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(255, 171, 88, 0.2);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-button--small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.875rem;
}

.primary-button--large {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 1rem;
}

.primary-button--icon-only {
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.primary-button__icon {
  font-size: 0.9em;
}

/* Animation on hover */
.primary-button:hover:not(:disabled) .primary-button__icon {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>