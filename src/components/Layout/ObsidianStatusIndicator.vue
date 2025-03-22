<template>
  <div class="obsidian-status-container">
    <div 
      class="obsidian-status" 
      v-if="obsidianStore.isConnected"
      @click="showVaultInfo = true"
    >
      <div class="status-indicator connected"></div>
      <span>Obsidian Connected</span>
    </div>
    
    <div 
      class="obsidian-status error" 
      v-else-if="obsidianStore.hasConnectionError"
      @click="handleConnectionError"
    >
      <div class="status-indicator error"></div>
      <span>Obsidian Connection Error</span>
    </div>
    
    <div 
      class="obsidian-status not-connected" 
      v-else-if="authStore.isAuthenticated && !obsidianStore.integrationSkipped"
      @click="navigateToConnect"
    >
      <div class="status-indicator not-connected"></div>
      <span>Connect Obsidian</span>
    </div>
    
    <!-- Vault Info Dialog -->
    <div class="vault-info-dialog glass-card" v-if="showVaultInfo">
      <div class="dialog-header">
        <h3>Obsidian Vault Connection</h3>
        <button class="close-button" @click="showVaultInfo = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="dialog-content">
        <div class="info-item">
          <span class="info-label">Status:</span>
          <span class="info-value success">Connected</span>
        </div>
        <div class="info-item">
          <span class="info-label">Vault Name:</span>
          <span class="info-value">{{ obsidianStore.vaultName || 'Unknown' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Notes:</span>
          <span class="info-value">{{ obsidianStore.fileList.filter(f => f.endsWith('.md')).length }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Folders:</span>
          <span class="info-value">{{ obsidianStore.folderList.length }}</span>
        </div>
      </div>
      <div class="dialog-actions">
        <button class="secondary-button" @click="disconnectVault">Disconnect</button>
        <button class="primary-button" @click="showVaultInfo = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useObsidianStore } from '@/stores/obsidian';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { openCertificateAcceptPage } from '@/utils/certificateHelper';

const router = useRouter();
const obsidianStore = useObsidianStore();
const authStore = useAuthStore();
const uiStore = useUIStore();

const showVaultInfo = ref(false);

const navigateToConnect = () => {
  router.push({ name: 'obsidian-connect' });
};

const handleConnectionError = () => {
  const error = obsidianStore.connectionError;
  
  if (error?.code === 'CERT_ERROR') {
    uiStore.showConfirmationDialog(
      'Certificate Error',
      'There is a security certificate issue with your Obsidian connection. Would you like to open the certificate page to accept it?',
      'Open Certificate Page',
      'Cancel',
      () => {
        openCertificateAcceptPage();
      }
    );
  } else {
    uiStore.showConfirmationDialog(
      'Connection Error',
      `Failed to connect to Obsidian: ${error?.message || 'Unknown error'}. Would you like to reconfigure your connection?`,
      'Reconfigure',
      'Cancel',
      () => {
        navigateToConnect();
      }
    );
  }
};

const disconnectVault = () => {
  uiStore.showConfirmationDialog(
    'Disconnect Obsidian',
    'Are you sure you want to disconnect from your Obsidian vault? Your API key will be removed from storage.',
    'Disconnect',
    'Cancel',
    () => {
      obsidianStore.disconnectVault();
      showVaultInfo.value = false;
      uiStore.showToast('Disconnected from Obsidian vault', 'info');
    }
  );
};
</script>

<style scoped>
.obsidian-status-container {
  position: relative;
}

.obsidian-status {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.1);
  margin-left: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.obsidian-status:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-indicator.connected {
  background-color: #10b981; /* Green */
  box-shadow: 0 0 6px #10b981;
}

.status-indicator.error {
  background-color: #ef4444; /* Red */
  box-shadow: 0 0 6px #ef4444;
}

.status-indicator.not-connected {
  background-color: #f59e0b; /* Amber */
  box-shadow: 0 0 6px #f59e0b;
}

.obsidian-status span {
  font-size: 0.85rem;
  white-space: nowrap;
}

.obsidian-status.error {
  background-color: rgba(239, 68, 68, 0.1);
}

.obsidian-status.not-connected {
  background-color: rgba(245, 158, 11, 0.1);
}

/* Vault Info Dialog */
.vault-info-dialog {
  position: absolute;
  top: 40px;
  right: 0;
  width: 300px;
  z-index: 100;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
  margin-bottom: 12px;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.close-button {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 5px;
}

.close-button:hover {
  color: var(--color-text);
}

.dialog-content {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-label {
  font-weight: 500;
  width: 100px;
}

.info-value {
  flex: 1;
}

.info-value.success {
  color: #10b981;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
}

.primary-button, .secondary-button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button {
  background-color: #7c3aed;
  color: white;
  border: none;
}

.primary-button:hover {
  background-color: #6d28d9;
}

.secondary-button {
  background-color: transparent;
  color: #7c3aed;
  border: 1px solid #7c3aed;
}

.secondary-button:hover {
  background-color: rgba(124, 58, 237, 0.05);
}

/* Glass card styling */
.glass-card {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.theme-dark .glass-card {
  background-color: rgba(30, 30, 46, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}
</style>