<template>
  <transition name="fade">
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <i class="fas fa-lock modal-icon"></i>
          <h3>Template Synced!</h3>
        </div>
        <div class="modal-body">
          <p>Your template is saved to your vault and ready to use!</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="$emit('close')">Close</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  destinationPath: string;
}>();

defineEmits<{
  (e: "close"): void;
}>();
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 21, 30, 0.7); /* --color-background-rgb with opacity */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #171822; /* --color-surface-dark */
  border: 1px solid rgba(255, 255, 255, 0.08); /* --color-border */
  border-radius: 0.5rem; /* --radius-md */
  padding: 1.5rem; /* --spacing-lg */
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* --shadow-lg */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; /* --font-sans */
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* --spacing-sm */
  margin-bottom: 1rem; /* --spacing-md */
}

.modal-icon {
  color: #8866e9; /* --color-primary */
  font-size: 1.5rem;
}

h3 {
  margin: 0;
  font-size: 1.5rem; /* Matches h3 in landing page */
  font-weight: 700;
  color: #e0e0e0; /* --color-text */
}

.modal-body {
  margin-bottom: 1.5rem; /* --spacing-lg */
}

p {
  margin: 0;
  font-size: 1rem;
  color: #b0b0b0; /* --color-text-light */
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem; /* --radius-md */
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s; /* --transition-normal */
  border: none;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(
    90deg,
    #6a4fcc,
    #8866e9
  ); /* --color-primary-dark to --color-primary */
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(
    90deg,
    #8866e9,
    #a184f0
  ); /* --color-primary to --color-primary-light */
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(136, 102, 233, 0.3); /* --color-primary-rgb */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease; /* --transition-normal */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
