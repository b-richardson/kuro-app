<template>
  <ScrollContainer>
    <div class="obsidian-onboarding">
      <div class="onboarding-header">
        <h2>Connect Your Obsidian Vault</h2>
        <p class="onboarding-description">
          Link your Obsidian notes to enable powerful template creation and
          synchronization.
        </p>
      </div>

      <!-- Step indicator -->
      <div class="step-indicator">
        <div
          v-for="(step, index) in totalSteps"
          :key="index"
          class="step-dot"
          :class="{
            active: currentStep === index + 1,
            completed: currentStep > index + 1,
          }"
        ></div>
      </div>

      <!-- Step 1: Plugin Installation -->
      <div v-if="currentStep === 1" class="onboarding-step">
        <h3>Step 1: Install the Local REST API Plugin</h3>

        <div class="instruction-card glass-card">
          <div class="instruction">
            <div class="instruction-number">1</div>
            <div class="instruction-content">
              <p><strong>Open Obsidian</strong> and navigate to Settings</p>
              <img
                src="https://parastudios.de/introducing-and-using-obsidian/obsidian-screenshot.png"
                alt="Obsidian Settings"
                class="instruction-image"
              />
            </div>
          </div>

          <div class="instruction">
            <div class="instruction-number">2</div>
            <div class="instruction-content">
              <p>
                Go to <strong>Community Plugins</strong> →
                <strong>Browse</strong>
              </p>
              <img
                src="https://parastudios.de/introducing-and-using-obsidian/obsidian-screenshot.png"
                alt="Community Plugins"
                class="instruction-image"
              />
            </div>
          </div>

          <div class="instruction">
            <div class="instruction-number">3</div>
            <div class="instruction-content">
              <p>Search for <strong>"Local REST API"</strong></p>
              <img
                src="https://parastudios.de/introducing-and-using-obsidian/obsidian-screenshot.png"
                alt="Search Plugin"
                class="instruction-image"
              />
            </div>
          </div>

          <div class="instruction">
            <div class="instruction-number">4</div>
            <div class="instruction-content">
              <p>
                Click <strong>Install</strong> and then <strong>Enable</strong>
              </p>
              <img
                src="https://parastudios.de/introducing-and-using-obsidian/obsidian-screenshot.png"
                alt="Enable Plugin"
                class="instruction-image"
              />
            </div>
          </div>
        </div>

        <div class="onboarding-actions">
          <button class="secondary-button" @click="skipIntegration">
            Skip for now
          </button>
          <button class="primary-button" @click="nextStep">
            I've installed the plugin
          </button>
        </div>
      </div>

      <!-- Step 2: API Key Generation -->
      <div v-else-if="currentStep === 2" class="onboarding-step">
        <h3>Step 2: Generate an API Key</h3>

        <div class="instruction-card glass-card">
          <div class="instruction">
            <div class="instruction-number">1</div>
            <div class="instruction-content">
              <p>
                In Obsidian, open <strong>Settings</strong> →
                <strong>Local REST API Plugin</strong>
              </p>
              <img
                src="https://parastudios.de/introducing-and-using-obsidian/obsidian-screenshot.png"
                alt="REST API Settings"
                class="instruction-image"
              />
            </div>
          </div>

          <div class="instruction">
            <div class="instruction-number">2</div>
            <div class="instruction-content">
              <p>Click <strong>Generate API Key</strong></p>
              <img
                src="https://parastudios.de/introducing-and-using-obsidian/obsidian-screenshot.png"
                alt="Generate API Key"
                class="instruction-image"
              />
            </div>
          </div>

          <div class="instruction">
            <div class="instruction-number">3</div>
            <div class="instruction-content">
              <p><strong>Copy</strong> your new API key</p>
              <img
                src="https://parastudios.de/introducing-and-using-obsidian/obsidian-screenshot.png"
                alt="Copy API Key"
                class="instruction-image"
              />
            </div>
          </div>
        </div>

        <div class="onboarding-actions">
          <button class="secondary-button" @click="prevStep">Back</button>
          <button class="primary-button" @click="nextStep">
            I've copied my API key
          </button>
        </div>
      </div>

      <!-- Step 3: Input API Key -->
      <div v-else-if="currentStep === 3" class="onboarding-step">
        <h3>Step 3: Connect Your Vault</h3>

        <div class="api-key-form glass-card">
          <label for="api-port">Obsidian REST API Port:</label>
          <input
            type="number"
            id="api-port"
            v-model="apiPort"
            placeholder="e.g., 27124"
            @input="validateApiPort"
          />

          <label for="api-key">Paste Your Obsidian REST API Key:</label>
          <input
            type="password"
            id="api-key"
            v-model="apiKey"
            placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j"
            @input="validateApiKey"
          />

          <div class="security-notice">
            <i class="fas fa-shield-alt"></i>
            <p>
              Your API key and port are encrypted and then stored securely in
              our database.
            </p>
          </div>

          <div v-if="apiPortError || apiKeyError" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ apiPortError || apiKeyError }}</span>
          </div>
        </div>

        <!-- (Browser certificate note, etc. stays the same.) -->

        <div class="onboarding-actions">
          <button class="secondary-button" @click="prevStep">Back</button>
          <button
            class="primary-button"
            @click="testConnection"
            :disabled="
              !apiKey ||
              !apiPort ||
              !!apiKeyError ||
              !!apiPortError ||
              isConnecting
            "
          >
            <span v-if="isConnecting">
              <i class="fas fa-spinner fa-spin"></i> Connecting...
            </span>
            <span v-else>Connect to Obsidian</span>
          </button>
        </div>
      </div>

      <!-- Step 4: Connection Success -->
      <div v-else-if="currentStep === 4" class="onboarding-step">
        <div class="success-card glass-card">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Successfully Connected!</h3>
          <p>
            Your Obsidian vault has been connected. We've found
            {{ vaultStats.files }} notes across
            {{ vaultStats.folders }} folders.
          </p>

          <div class="vault-summary">
            <div class="summary-item">
              <span class="summary-label">Vault Name:</span>
              <span class="summary-value">{{ vaultInfo.name }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Notes:</span>
              <span class="summary-value">{{ vaultStats.files }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Connection Status:</span>
              <span class="summary-value success">Connected</span>
            </div>
          </div>
        </div>

        <div class="onboarding-actions">
          <button class="primary-button" @click="finishOnboarding">
            Continue to Template Builder
          </button>
        </div>
      </div>
    </div>
  </ScrollContainer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useObsidianStore } from "@/stores/obsidian";
import { useAuthStore } from "@/stores/auth";
import { openCertificateAcceptPage } from "@/utils/certificateHelper";
import ScrollContainer from "@/components/UI/ScrollContainer.vue";
import { saveObsidianIntegration } from "@/services/supabase";

const router = useRouter();
const obsidianStore = useObsidianStore();

// Step management
const currentStep = ref(1);
const totalSteps = 4;

// Form data
const apiPort = ref("");
const apiPortError = ref("");
const apiKey = ref("");
const apiKeyError = ref("");
const isConnecting = ref(false);

// Connection information
const vaultInfo = ref({
  name: "",
  path: "",
});
const vaultStats = ref({
  files: 0,
  folders: 0,
});

// Validate API port
const validateApiPort = () => {
  if (!apiPort.value) {
    apiPortError.value = "Port is required";
    return false;
  }

  // Basic numeric check
  const portNumber = parseInt(apiPort.value, 10);
  if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
    apiPortError.value = "Invalid port number";
    return false;
  }

  apiPortError.value = "";
  return true;
};

// Input validation
const validateApiKey = () => {
  if (!apiKey.value) {
    apiKeyError.value = "API key is required";
    return false;
  }

  // Simple validation - adjust as needed for actual API key format
  if (apiKey.value.length < 10) {
    apiKeyError.value = "API key seems too short";
    return false;
  }

  apiKeyError.value = "";
  return true;
};

// Navigation functions
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const skipIntegration = () => {
  // User opts out of Obsidian integration
  obsidianStore.setIntegrationSkipped(true);
  router.push({ name: "dashboard" });
};

// API connection test
const testConnection = async () => {
  const authStore = useAuthStore();

  // Validate the API key and port inputs
  if (!validateApiPort() || !validateApiKey()) return;

  isConnecting.value = true;

  try {
    // Step 1: Test the Obsidian connection
    await obsidianStore.connectToVault(apiKey.value, apiPort.value);
    vaultInfo.value = await obsidianStore.getVaultInfo();
    vaultStats.value = await obsidianStore.getVaultStats();

    console.log("Auth state:", {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
      userId: authStore.user?.id,
    });

    // Step 2: Ensure the user is authenticated
    if (!authStore.isAuthenticated) {
      throw new Error("You must log in to save your Obsidian integration.");
    }

    const userId = authStore.user?.id;
    if (!userId) throw new Error("Failed to retrieve authenticated user ID");

    console.log("Attempting to save Obsidian integration to Supabase...");
    console.log("User ID:", userId);
    console.log("API Key length:", apiKey.value.length);
    console.log("Port:", apiPort.value);

    // Step 3: Save integration settings to Supabase
    const saveResult = await saveObsidianIntegration(
      userId,
      apiKey.value,
      apiPort.value
    );

    console.log("Save result:", saveResult);

    if (saveResult.error) {
      console.error(
        "Failed to save integration in Supabase:",
        saveResult.error
      );
      throw new Error("Unable to save your Obsidian integration securely.");
    }
    // Step 4: Move to the next onboarding step
    nextStep();
  } catch (error) {
    console.error("Connection test failed:", error);

    const errorMessage = (error as { message?: string })?.message;

    if (errorMessage?.includes("CERT_ERROR")) {
      apiKeyError.value =
        "Certificate error. Please accept the self-signed certificate in your browser.";
    } else if (errorMessage?.includes("CONNECTION_ERROR")) {
      apiKeyError.value =
        "Could not connect to Obsidian. Ensure the Local REST API Plugin is enabled.";
    } else if (errorMessage?.includes("AUTH_ERROR")) {
      apiKeyError.value = "Authentication failed. Double-check your API key.";
    } else {
      apiKeyError.value =
        "Connection failed. Ensure Obsidian is running with the Local REST API plugin enabled.";
    }
  } finally {
    isConnecting.value = false;
  }
};

const finishOnboarding = () => {
  router.push({ name: "dashboard" });
};
</script>

<style scoped>
.obsidian-onboarding {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.onboarding-header {
  text-align: center;
  margin-bottom: 2rem;
}

.onboarding-description {
  color: #666;
  font-size: 1.1rem;
}

.step-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ddd;
  margin: 0 6px;
}

.step-dot.active {
  background-color: #7c3aed;
  transform: scale(1.2);
}

.step-dot.completed {
  background-color: #10b981;
}

.onboarding-step {
  margin-bottom: 2rem;
}

.glass-card {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.instruction {
  display: flex;
  margin-bottom: 1.5rem;
}

.instruction:last-child {
  margin-bottom: 0;
}

.instruction-number {
  background-color: #7c3aed;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
  flex-shrink: 0;
}

.instruction-content {
  flex: 1;
}

.instruction-image {
  max-width: 100%;
  border-radius: 6px;
  margin-top: 0.5rem;
  border: 1px solid #eee;
}

.api-key-form {
  margin-bottom: 1.5rem;
}

.api-key-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.api-key-form input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.security-notice {
  display: flex;
  align-items: flex-start;
  font-size: 0.9rem;
  color: #666;
}

.security-notice i {
  color: #7c3aed;
  margin-right: 0.5rem;
  margin-top: 0.2rem;
}

.error-message {
  color: #ef4444;
  margin-top: 1rem;
  display: flex;
  align-items: center;
}

.error-message i {
  margin-right: 0.5rem;
}

.certificate-warning {
  background-color: rgba(254, 252, 232, 0.7);
  border-color: rgba(252, 211, 77, 0.3);
}

.warning-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.warning-header i {
  color: #f59e0b;
  margin-right: 0.5rem;
}

.warning-image {
  max-width: 100%;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #eee;
}

.success-card {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.vault-summary {
  margin-top: 1.5rem;
  text-align: left;
}

.summary-item {
  display: flex;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-weight: 500;
  width: 120px;
}

.summary-value {
  flex: 1;
}

.summary-value.success {
  color: #10b981;
  font-weight: 500;
}

.onboarding-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.primary-button,
.secondary-button {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
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

.primary-button:disabled {
  background-color: #c4b5fd;
  cursor: not-allowed;
}

.secondary-button {
  background-color: transparent;
  color: #7c3aed;
  border: 1px solid #7c3aed;
}

.secondary-button:hover {
  background-color: rgba(124, 58, 237, 0.05);
}
</style>
