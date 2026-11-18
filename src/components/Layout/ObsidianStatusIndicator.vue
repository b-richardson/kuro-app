<template>
  <div class="obsidian-connection glass-card">
    <div class="section-header">
      <h2 class="settings-section__title">Obsidian Integration</h2>
    </div>

    <div class="connection-summary">
      <div class="status-icon" :class="statusClass">
        <i :class="statusIcon"></i>
      </div>

      <div class="connection-info">
        <div class="connection-status">
          <strong>Status:</strong> {{ statusLabel }}
        </div>

        <div v-if="obsidianStore.isConnected" class="vault-details">
          <div>
            <strong>Vault:</strong> {{ obsidianStore.vaultName || "Unknown" }}
          </div>
          <div><strong>Notes:</strong> {{ noteCount }}</div>
          <div><strong>Folders:</strong> {{ folderCount }}</div>
        </div>
      </div>

      <div class="connection-controls">
        <button class="primary-button" @click="handleAction">
          {{ actionLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useObsidianStore } from "@/stores/obsidian";
import { useUIStore } from "@/stores/ui";
import { openCertificateAcceptPage } from "@/utils/certificateHelper";

const router = useRouter();
const obsidianStore = useObsidianStore();
const uiStore = useUIStore();

const statusLabel = computed(() => {
  if (obsidianStore.isConnected) return "Connected";
  if (obsidianStore.hasConnectionError) return "Connection Error";
  return "Not Connected";
});

const statusClass = computed(() => {
  if (obsidianStore.isConnected) return "connected";
  if (obsidianStore.hasConnectionError) return "error";
  return "not-connected";
});

const statusIcon = computed(() => {
  if (obsidianStore.isConnected) return "fas fa-plug";
  if (obsidianStore.hasConnectionError) return "fas fa-exclamation-triangle";
  return "fas fa-plug-circle-xmark";
});

const actionLabel = computed(() => {
  if (obsidianStore.isConnected) return "Disconnect";
  if (obsidianStore.hasConnectionError) return "Reconfigure";
  return "Connect";
});

const handleAction = () => {
  if (obsidianStore.isConnected) {
    uiStore.showConfirmationDialog(
      "Disconnect from Obsidian",
      "This will remove your Obsidian vault connection. Do you want to proceed?",
      "Disconnect",
      "Cancel",
      () => {
        obsidianStore.disconnectVault();
        uiStore.showToast("Disconnected from Obsidian", "info");
      }
    );
  } else if (obsidianStore.hasConnectionError) {
    const error = obsidianStore.connectionError;
    if (error?.code === "CERT_ERROR") {
      uiStore.showConfirmationDialog(
        "Certificate Error",
        "There is a certificate trust issue. Do you want to view the certificate page?",
        "Open Certificate Page",
        "Cancel",
        () => openCertificateAcceptPage()
      );
    } else {
      router.push({ name: "obsidian-connect" });
    }
  } else {
    router.push({ name: "obsidian-connect" });
  }
};

const noteCount = computed(
  () => obsidianStore.fileList.filter((f) => f.endsWith(".md")).length
);

const folderCount = computed(() => obsidianStore.folderList.length);
</script>

<style scoped>
.obsidian-connection {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.connection-summary {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.status-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
}

.status-icon.connected {
  color: #10b981;
  border-color: #10b981;
}

.status-icon.error {
  color: #ef4444;
  border-color: #ef4444;
}

.status-icon.not-connected {
  color: #f59e0b;
  border-color: #f59e0b;
}

.connection-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: 0.95rem;
}

.vault-details {
  margin-top: var(--spacing-sm);
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.connection-controls {
  display: flex;
  align-items: center;
}

.primary-button {
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: 0.2s all ease;
}

.primary-button:hover {
  background: var(--color-primary-dark);
}
</style>
