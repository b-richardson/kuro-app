<template>
  <Teleport to="body">
    <div 
      class="toast-container"
      :class="[position]"
    >
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          class="toast"
          :class="[toast.type, { 'with-action': toast.action }]"
        >
          <div class="toast__icon">
            <i :class="getIconClass(toast.type)"></i>
          </div>
          <div class="toast__content">
            <div class="toast__message">{{ toast.message }}</div>
            <div v-if="toast.description" class="toast__description">
              {{ toast.description }}
            </div>
          </div>
          <div v-if="toast.action" class="toast__action">
            <button @click="toast.action.onClick" class="toast__action-btn">
              {{ toast.action.text }}
            </button>
          </div>
          <button 
            class="toast__close" 
            @click="removeToast(toast.id)" 
            aria-label="Close toast"
          >
            <i class="fas fa-times"></i>
          </button>
          <div 
            class="toast__progress" 
            :style="{ animationDuration: `${toast.duration}ms` }"
          ></div>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast position
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

// Toast action interface
interface ToastAction {
  text: string;
  onClick: () => void;
}

// Toast interface
interface Toast {
  id: number;
  message: string;
  description?: string;
  type: ToastType;
  duration: number;
  action?: ToastAction;
}

// Props
const props = defineProps<{
  position?: ToastPosition;
}>();

const position = props.position || 'top-right';
const toasts = ref<Toast[]>([]);
let toastIdCounter = 0;
const timeouts = new Map<number, number>();

// Get the appropriate icon class based on toast type
const getIconClass = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle';
    case 'error':
      return 'fas fa-exclamation-circle';
    case 'warning':
      return 'fas fa-exclamation-triangle';
    case 'info':
    default:
      return 'fas fa-info-circle';
  }
};

// Add a new toast
const addToast = (
  message: string, 
  options: {
    type?: ToastType;
    duration?: number;
    description?: string;
    action?: ToastAction;
  } = {}
): number => {
  const {
    type = 'info',
    duration = 5000,
    description,
    action
  } = options;
  
  const id = toastIdCounter++;
  
  // Add the toast to the list
  toasts.value.push({
    id,
    message,
    description,
    type,
    duration,
    action
  });
  
  // Set a timeout to remove the toast
  const timeoutId = window.setTimeout(() => {
    removeToast(id);
  }, duration);
  
  // Store the timeout ID
  timeouts.set(id, timeoutId);
  
  return id;
};

// Remove a toast by ID
const removeToast = (id: number) => {
  // Clear the timeout
  if (timeouts.has(id)) {
    window.clearTimeout(timeouts.get(id));
    timeouts.delete(id);
  }
  
  // Remove the toast
  toasts.value = toasts.value.filter(toast => toast.id !== id);
};

// Convenience methods for different toast types
const success = (message: string, options = {}) => 
  addToast(message, { ...options, type: 'success' });

const error = (message: string, options = {}) => 
  addToast(message, { ...options, type: 'error' });

const warning = (message: string, options = {}) => 
  addToast(message, { ...options, type: 'warning' });

const info = (message: string, options = {}) => 
  addToast(message, { ...options, type: 'info' });

// Clear all toasts
const clearAll = () => {
  toasts.value.forEach(toast => {
    if (timeouts.has(toast.id)) {
      window.clearTimeout(timeouts.get(toast.id));
      timeouts.delete(toast.id);
    }
  });
  toasts.value = [];
};

// Clean up timeouts on component unmount
onUnmounted(() => {
  clearAll();
});

// Expose the API
defineExpose({
  addToast,
  removeToast,
  success,
  error,
  warning,
  info,
  clearAll
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  max-width: 100%;
  width: 360px;
  pointer-events: none;
}

.toast-container.top-right {
  top: 0;
  right: 0;
}

.toast-container.top-left {
  top: 0;
  left: 0;
}

.toast-container.bottom-right {
  bottom: 0;
  right: 0;
}

.toast-container.bottom-left {
  bottom: 0;
  left: 0;
}

.toast-container.top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container.bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.3s ease forwards;
  pointer-events: auto;
}

.toast__icon {
  flex-shrink: 0;
  margin-right: 0.75rem;
  font-size: 1.125rem;
  padding-top: 0.125rem;
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__message {
  font-weight: 500;
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
  line-height: 1.3;
  color: #1e293b;
}

.toast__description {
  font-size: 0.8125rem;
  color: #64748b;
  line-height: 1.3;
}

.toast__action {
  flex-shrink: 0;
  margin-left: 0.75rem;
}

.toast__action-btn {
  background: transparent;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: currentColor;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.toast__action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.toast__close {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.875rem;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 0.75rem;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
}

.toast__close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #64748b;
}

.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: currentColor;
  opacity: 0.3;
  width: 100%;
  animation: progress linear forwards;
}

/* Toast types */
.toast.success {
  border-left: 4px solid #10b981;
  color: #10b981;
}

.toast.error {
  border-left: 4px solid #ef4444;
  color: #ef4444;
}

.toast.warning {
  border-left: 4px solid #f59e0b;
  color: #f59e0b;
}

.toast.info {
  border-left: 4px solid #3b82f6;
  color: #3b82f6;
}

/* Animation keyframes */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

/* Toast transitions */
.toast-enter-active {
  animation: slideIn 0.3s ease forwards;
}

.toast-leave-active {
  animation: slideIn 0.3s ease forwards reverse;
}

/* Mobile styles */
@media (max-width: 480px) {
  .toast-container {
    width: 100%;
    padding: 0.75rem;
  }
  
  .toast {
    padding: 0.75rem;
  }
  
  .toast__message {
    font-size: 0.875rem;
  }
  
  .toast__description {
    font-size: 0.75rem;
  }
}
</style>