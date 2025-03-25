<template>
  <div v-if="show" class="confirmation-dialog">
    <div class="confirmation-dialog__backdrop" @click="handleCancel"></div>
    <div 
      class="confirmation-dialog__content"
      :class="[`confirmation-dialog__content--${variant}`]"
      ref="dialogRef"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="dialogId + '-title'"
    >
      <div class="confirmation-dialog__header">
        <h3 :id="dialogId + '-title'" class="confirmation-dialog__title">
          <span v-if="icon" class="confirmation-dialog__icon">
            <i :class="getIconClass()"></i>
          </span>
          {{ title }}
        </h3>
        <button 
          v-if="showCloseButton" 
          class="confirmation-dialog__close-btn" 
          @click="handleCancel"
          aria-label="Close dialog"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="confirmation-dialog__body">
        <p v-if="message" class="confirmation-dialog__message">{{ message }}</p>
        <slot></slot>
      </div>
      
      <div class="confirmation-dialog__footer">
        <button 
          v-if="showCancelButton" 
          class="confirmation-dialog__btn confirmation-dialog__btn--cancel" 
          @click="handleCancel"
          ref="cancelButtonRef"
        >
          {{ cancelButtonText }}
        </button>
        <button 
          class="confirmation-dialog__btn confirmation-dialog__btn--confirm" 
          :class="[`confirmation-dialog__btn--${variant}`]"
          @click="handleConfirm"
          ref="confirmButtonRef"
        >
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue';

// Generate a unique ID for accessibility
const dialogId = 'confirmation-dialog-' + Math.random().toString(36).substring(2, 9);

// Define props
const props = defineProps({
  // Dialog visibility
  show: {
    type: Boolean,
    default: false,
  },
  // Dialog title
  title: {
    type: String,
    required: true,
  },
  // Dialog message
  message: {
    type: String,
    default: '',
  },
  // Variant affects the styling (info, warning, danger, success)
  variant: {
    type: String,
    default: 'info',
    validator: (value: string) => ['info', 'warning', 'danger', 'success'].includes(value),
  },
  // Text for the confirm button
  confirmButtonText: {
    type: String,
    default: 'Confirm',
  },
  // Text for the cancel button
  cancelButtonText: {
    type: String,
    default: 'Cancel',
  },
  // Whether to show the cancel button
  showCancelButton: {
    type: Boolean,
    default: true,
  },
  // Whether to show the X close button
  showCloseButton: {
    type: Boolean,
    default: true,
  },
  // Icon to show next to the title
  icon: {
    type: Boolean,
    default: true,
  },
  // Focus the confirm button by default (otherwise focuses cancel)
  focusConfirmButton: {
    type: Boolean,
    default: false,
  },
});

// Define emits
const emit = defineEmits(['confirm', 'cancel', 'update:show']);

// Refs for DOM elements
const dialogRef = ref<HTMLElement | null>(null);
const confirmButtonRef = ref<HTMLButtonElement | null>(null);
const cancelButtonRef = ref<HTMLButtonElement | null>(null);

// Get icon class based on variant
const getIconClass = () => {
  switch(props.variant) {
    case 'warning': return 'fas fa-exclamation-triangle';
    case 'danger': return 'fas fa-exclamation-circle';
    case 'success': return 'fas fa-check-circle';
    case 'info':
    default: return 'fas fa-info-circle';
  }
};

// Event handlers
const handleConfirm = () => {
  emit('confirm');
  emit('update:show', false);
};

const handleCancel = () => {
  emit('cancel');
  emit('update:show', false);
};

// Handle keyboard events for accessibility
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.show) return;
  
  switch (event.key) {
    case 'Escape':
      event.preventDefault();
      handleCancel();
      break;
    case 'Enter':
      // Only trigger if confirm button is focused
      if (document.activeElement === confirmButtonRef.value) {
        event.preventDefault();
        handleConfirm();
      }
      break;
  }
};

// Focus management
const setInitialFocus = () => {
  if (props.show) {
    nextTick(() => {
      // Focus the appropriate button based on props
      if (props.focusConfirmButton && confirmButtonRef.value) {
        confirmButtonRef.value.focus();
      } else if (props.showCancelButton && cancelButtonRef.value) {
        cancelButtonRef.value.focus();
      } else if (confirmButtonRef.value) {
        confirmButtonRef.value.focus();
      }
    });
  }
};

// Watch for changes in show prop to handle focus
watch(() => props.show, (newValue) => {
  if (newValue) {
    setInitialFocus();
  }
});

// Lifecycle hooks
onMounted(() => {
  // Add event listener for keyboard navigation
  document.addEventListener('keydown', handleKeyDown);
  // Set initial focus
  setInitialFocus();
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.confirmation-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirmation-dialog__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Removed blur effect that was causing readability issues */
  animation: fadeIn 0.2s ease-out;
}

.confirmation-dialog__content {
  position: relative;
  width: 100%;
  max-width: 460px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1001;
  margin: 1rem;
  animation: slideIn 0.3s ease-out;
}

.confirmation-dialog__header {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
}

.confirmation-dialog__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.confirmation-dialog__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.confirmation-dialog__content--info .confirmation-dialog__icon {
  color: #3b82f6;
}

.confirmation-dialog__content--warning .confirmation-dialog__icon {
  color: #f59e0b;
}

.confirmation-dialog__content--danger .confirmation-dialog__icon {
  color: #ef4444;
}

.confirmation-dialog__content--success .confirmation-dialog__icon {
  color: #10b981;
}

.confirmation-dialog__close-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  color: #64748b;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.confirmation-dialog__close-btn:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.confirmation-dialog__body {
  padding: 1.5rem;
}

.confirmation-dialog__message {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #475569;
}

.confirmation-dialog__footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.confirmation-dialog__btn {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
}

.confirmation-dialog__btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.confirmation-dialog__btn--cancel {
  background-color: white;
  border-color: #cbd5e1;
  color: #475569;
}

.confirmation-dialog__btn--cancel:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.confirmation-dialog__btn--confirm {
  color: white;
}

.confirmation-dialog__btn--info {
  background-color: #3b82f6;
  border-color: #2563eb;
}

.confirmation-dialog__btn--info:hover {
  background-color: #2563eb;
}

.confirmation-dialog__btn--warning {
  background-color: #f59e0b;
  border-color: #d97706;
}

.confirmation-dialog__btn--warning:hover {
  background-color: #d97706;
}

.confirmation-dialog__btn--danger {
  background-color: #ef4444;
  border-color: #dc2626;
}

.confirmation-dialog__btn--danger:hover {
  background-color: #dc2626;
}

.confirmation-dialog__btn--success {
  background-color: #10b981;
  border-color: #059669;
}

.confirmation-dialog__btn--success:hover {
  background-color: #059669;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 640px) {
  .confirmation-dialog__content {
    max-width: calc(100% - 2rem);
  }
  
  .confirmation-dialog__header {
    padding: 1rem;
  }
  
  .confirmation-dialog__body {
    padding: 1rem;
  }
  
  .confirmation-dialog__footer {
    padding: 0.75rem 1rem;
  }
  
  .confirmation-dialog__btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>