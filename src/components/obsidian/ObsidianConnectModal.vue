<template>
  <div class="modal-overlay">
    <div class="modal-container glass-card">
      <div class="modal-header">
        <h2>Connect to Obsidian</h2>
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="isConnecting" class="connecting-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Connecting to Obsidian...</p>
        </div>
        
        <div v-else-if="connectionError" class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Connection Error</h3>
          <p>{{ connectionError }}</p>
          <div v-if="errorCode === 'CERT_ERROR'" class="cert-error-help">
            <button @click="openCertificateAcceptPage" class="accept-cert-button">
              <i class="fas fa-external-link-alt"></i> Open Certificate Page
            </button>
            <p class="cert-help-text">
              Open this page and accept the certificate, then try connecting again.
            </p>
          </div>
        </div>
        
        <form v-else @submit.prevent="connectToVault" class="connect-form">
          <div class="form-group">
            <label for="api-key">API Key</label>
            <input 
              type="password" 
              id="api-key" 
              v-model="apiKey" 
              placeholder="Enter your Obsidian REST API key"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="api-port">Port Number</label>
            <input 
              type="text" 
              id="api-port" 
              v-model="apiPort" 
              placeholder="Default: 27124"
            />
            <div class="port-help">
              <i class="fas fa-info-circle"></i>
              <span>The port can be found in the Local REST API plugin settings in Obsidian.</span>
            </div>
          </div>
          
          <div class="certificate-warning">
            <i class="fas fa-shield-alt"></i>
            <p>Your browser may show a security warning due to a self-signed certificate. This is normal for local connections.</p>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-button" @click="$emit('close')">Cancel</button>
        <button 
          v-if="!isConnecting && !connectionError"
          class="connect-button" 
          @click="connectToVault"
          :disabled="!apiKey"
        >
          <i class="fas fa-plug"></i> Connect
        </button>
        <button 
          v-else-if="connectionError"
          class="retry-button" 
          @click="resetAndRetry"
        >
          <i class="fas fa-redo"></i> Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useObsidianStore } from '@/stores/obsidian';
import { openCertificateAcceptPage } from '@/utils/certificateHelper';

const emit = defineEmits(['close', 'connected']);
const obsidianStore = useObsidianStore();

// Form state
const apiKey = ref('');
const apiPort = ref('27124'); // Default port
const isConnecting = ref(false);
const connectionError = ref('');
const errorCode = ref('');

// Connect to vault
const connectToVault = async () => {
  if (!apiKey.value) return;
  
  isConnecting.value = true;
  connectionError.value = '';
  errorCode.value = '';
  
  try {
    await obsidianStore.connectToVault(apiKey.value, apiPort.value);
    await obsidianStore.fetchVaultStructure();
    emit('connected');
    emit('close');
  } catch (error: any) {
    connectionError.value = error.message || 'Failed to connect to Obsidian';
    errorCode.value = error.code || 'UNKNOWN_ERROR';
  } finally {
    isConnecting.value = false;
  }
};

// Reset and retry
const resetAndRetry = () => {
  connectionError.value = '';
  errorCode.value = '';
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
}

.connecting-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.connecting-state i, .error-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.connecting-state i {
  color: #7c3aed; /* Purple */
}

.error-state i {
  color: #ef4444; /* Red */
}

.error-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.cert-error-help {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.accept-cert-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6; /* Blue */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cert-help-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.connect-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input {
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.3);
}

.form-group input::placeholder {
  color: var(--color-text-tertiary);
}

.port-help {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.port-help i {
  color: #7c3aed;
  font-size: 0.9rem;
  margin-top: 0.1rem;
}

.certificate-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background-color: rgba(254, 252, 232, 0.3);
  border: 1px solid rgba(252, 211, 77, 0.3);
  border-radius: 4px;
  padding: 0.75rem;
}

.certificate-warning i {
  color: #f59e0b; /* Amber */
  margin-top: 0.1rem;
}

.certificate-warning p {
  margin: 0;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.cancel-button {
  padding: 0.5rem 1.5rem;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: var(--color-text);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.connect-button, .retry-button {
  padding: 0.5rem 1.5rem;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.connect-button:hover, .retry-button:hover {
  background-color: #6d28d9;
}

.connect-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.retry-button {
  background-color: #3b82f6; /* Blue */
}

.retry-button:hover {
  background-color: #2563eb;
}
</style>