<template>
  <div class="connection-status glass-card">
    <div class="status-icon">
      <i class="fas fa-exclamation-triangle"></i>
    </div>
    <div class="status-message">
      <h3>Not Connected to Obsidian</h3>
      <p>Your application is not currently connected to an Obsidian vault.</p>
      <p v-if="errorMessage" class="error-details">{{ errorMessage }}</p>
    </div>
    <div class="status-actions">
      <button 
        class="reconnect-button"
        @click="$emit('reconnect')"
      >
        <i class="fas fa-plug"></i> Connect to Obsidian
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useObsidianStore } from '@/stores/obsidian';

const obsidianStore = useObsidianStore();

const errorMessage = computed(() => {
  if (!obsidianStore.connectionError) return '';
  
  switch (obsidianStore.connectionError.code) {
    case 'CERT_ERROR':
      return 'Certificate error: You need to accept the self-signed certificate.';
    case 'CONNECTION_ERROR':
      return 'Failed to connect to Obsidian. Is the plugin enabled and Obsidian running?';
    case 'AUTH_ERROR':
      return 'Authentication failed. Your API key might be invalid.';
    default:
      return obsidianStore.connectionError.message || 'Unknown error';
  }
});

defineEmits(['reconnect']);
</script>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background-color: rgba(254, 252, 232, 0.7);
  border-color: rgba(252, 211, 77, 0.3);
}

.status-icon {
  font-size: 2rem;
  color: #f59e0b; /* Amber */
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-message {
  flex: 1;
}

.status-message h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.status-message p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

.error-details {
  margin-top: 0.5rem !important;
  color: #ef4444 !important; /* Red */
  font-weight: 500;
}

.status-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reconnect-button {
  padding: 0.5rem 1rem;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reconnect-button:hover {
  background-color: #6d28d9;
}

@media (max-width: 640px) {
  .connection-status {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .status-actions {
    width: 100%;
  }
}
</style>