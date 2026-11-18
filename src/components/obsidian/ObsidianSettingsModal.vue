<template>
  <div class="modal-overlay">
    <div class="modal-container glass-card">
      <div class="modal-header">
        <h2>Obsidian Settings</h2>
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="connection-status">
          <div class="status-badge" :class="{ 'connected': obsidianStore.isConnected }">
            <i class="fas" :class="obsidianStore.isConnected ? 'fa-check' : 'fa-times'"></i>
            <span>{{ obsidianStore.isConnected ? 'Connected' : 'Disconnected' }}</span>
          </div>
          
          <div class="connection-details" v-if="obsidianStore.isConnected">
            <div class="detail-item">
              <span class="detail-label">Vault:</span>
              <span class="detail-value">{{ obsidianStore.vaultName || 'Unknown' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Last Refreshed:</span>
              <span class="detail-value">{{ obsidianStore.lastRefreshedFormatted }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Notes:</span>
              <span class="detail-value">{{ obsidianStore.markdownFiles.length }}</span>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>API Settings</h3>
          
          <div class="form-group">
            <label for="api-port">API Port</label>
            <div class="input-with-action">
              <input 
                type="text" 
                id="api-port" 
                v-model="apiPort" 
                placeholder="Port number (e.g., 27124)"
                :disabled="!isEditingPort"
              />
              <button 
                v-if="!isEditingPort" 
                class="edit-button"
                @click="isEditingPort = true"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                v-else 
                class="save-button"
                @click="updateApiPort"
              >
                <i class="fas fa-save"></i>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="api-key">API Key</label>
            <div class="input-with-action">
              <input 
                :type="showApiKey ? 'text' : 'password'" 
                id="api-key" 
                v-model="apiKey" 
                placeholder="API Key"
                :disabled="!isEditingApiKey"
              />
              <button 
                v-if="!isEditingApiKey" 
                class="view-button"
                @click="toggleApiKeyVisibility"
                title="Toggle visibility"
              >
                <i class="fas" :class="showApiKey ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
              <button 
                v-if="!isEditingApiKey" 
                class="edit-button"
                @click="isEditingApiKey = true"
                title="Edit API key"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                v-else 
                class="save-button"
                @click="updateApiKey"
                title="Save API key"
              >
                <i class="fas fa-save"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="danger-zone">
          <h3>Danger Zone</h3>
          <p>These actions cannot be undone.</p>
          
          <button 
            class="danger-button" 
            @click="confirmDisconnect"
          >
            <i class="fas fa-unlink"></i> Disconnect from Obsidian
          </button>
          
          <div class="note">
            <i class="fas fa-info-circle"></i>
            <p>Disconnecting will remove your stored API key and require you to reconnect next time.</p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="close-btn" @click="$emit('close')">Close</button>
        <button 
          v-if="obsidianStore.isConnected"
          class="reconnect-button" 
          @click="reconnect"
        >
          <i class="fas fa-sync"></i> Test Connection
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useObsidianStore } from '@/stores/obsidian';
import { useUIStore } from '@/stores/ui';

const emit = defineEmits(['close']);
const obsidianStore = useObsidianStore();
const uiStore = useUIStore();

// State
const apiKey = ref('');
const apiPort = ref('');
const showApiKey = ref(false);
const isEditingApiKey = ref(false);
const isEditingPort = ref(false);

// Initialize values
onMounted(() => {
  apiKey.value = obsidianStore.apiKey || '';
  apiPort.value = obsidianStore.apiPort || '27124';
});

// Toggle API key visibility
const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value;
};

// Update API key
const updateApiKey = () => {
  // Validation
  if (!apiKey.value) {
    uiStore.showToast('API key cannot be empty', 'error');
    return;
  }
  
  // Actually would need to reconnect with the new API key
  // Here we just show a message that this would require reconnection
  uiStore.showConfirmationDialog(
    'Reconnect Required',
    'Changing your API key requires reconnecting to Obsidian. Would you like to reconnect now?',
    'Reconnect',
    'Cancel',
    () => {
      reconnectWithNewCredentials();
    },
    () => {
      // Reset to the original value
      apiKey.value = obsidianStore.apiKey || '';
      isEditingApiKey.value = false;
    }
  );
};

// Update API port
const updateApiPort = () => {
  // Validation
  if (!apiPort.value || !/^\d+$/.test(apiPort.value)) {
    uiStore.showToast('Port must be a valid number', 'error');
    return;
  }
  
  // Actually would need to reconnect with the new port
  // Here we just show a message that this would require reconnection
  uiStore.showConfirmationDialog(
    'Reconnect Required',
    'Changing your API port requires reconnecting to Obsidian. Would you like to reconnect now?',
    'Reconnect',
    'Cancel',
    () => {
      reconnectWithNewCredentials();
    },
    () => {
      // Reset to the original value
      apiPort.value = obsidianStore.apiPort || '27124';
      isEditingPort.value = false;
    }
  );
};

// Reconnect with new credentials
const reconnectWithNewCredentials = async () => {
  try {
    await obsidianStore.connectToVault(apiKey.value, apiPort.value);
    await obsidianStore.fetchVaultStructure();
    
    isEditingApiKey.value = false;
    isEditingPort.value = false;
    
    uiStore.showToast('Successfully reconnected to Obsidian', 'success');
  } catch (error) {
    uiStore.showToast('Failed to reconnect: ' + (error as Error).message, 'error');
  }
};

// Test connection
const reconnect = async () => {
  try {
    await obsidianStore.connectToVault(
      obsidianStore.apiKey || '', 
      obsidianStore.apiPort || '27124'
    );
    await obsidianStore.fetchVaultStructure();
    
    uiStore.showToast('Successfully reconnected to Obsidian', 'success');
  } catch (error) {
    uiStore.showToast('Connection test failed: ' + (error as Error).message, 'error');
  }
};

// Disconnect from Obsidian
const confirmDisconnect = () => {
  uiStore.showConfirmationDialog(
    'Disconnect from Obsidian',
    'Are you sure you want to disconnect from Obsidian? This will remove your stored API key and require you to reconnect next time.',
    'Disconnect',
    'Cancel',
    () => {
      obsidianStore.disconnectVault();
      uiStore.showToast('Disconnected from Obsidian', 'info');
      emit('close');
    }
  );
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-container {
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.modal-body {
  flex: 1;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.connection-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  width: fit-content;
}

.status-badge.connected {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.connection-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.detail-item {
  display: flex;
  font-size: 0.9rem;
}

.detail-label {
  font-weight: 500;
  width: 120px;
}

.detail-value {
  flex: 1;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-section h3, .danger-zone h3 {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
}

.input-with-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-with-action input {
  flex: 1;
  padding: 0.6rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  font-size: 0.95rem;
}

.input-with-action input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.edit-button, .save-button, .view-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-button:hover, .view-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.save-button {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.save-button:hover {
  background-color: rgba(16, 185, 129, 0.3);
}

.danger-zone {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  margin-top: 1rem;
}

.danger-zone p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.danger-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0.5rem 0;
}

.danger-button:hover {
  background-color: #dc2626;
}

.note {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
}

.note i {
  margin-top: 0.15rem;
}

.note p {
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.close-btn {
  padding: 0.5rem 1.2rem;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: var(--color-text);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.reconnect-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.reconnect-button:hover {
  background-color: #6d28d9;
}
</style>