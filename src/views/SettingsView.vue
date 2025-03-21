<template>
  <div class="settings-view">
    <div class="settings-container">
      <div class="settings-header glass-card">
        <h1 class="settings-header__title">Settings</h1>
      </div>
      
      <div class="settings-content glass-card">
        <!-- Account Info Section -->
        <div class="settings-section">
          <h2 class="settings-section__title">Account Information</h2>
          
          <div class="profile-summary">
            <div class="profile-avatar">
              {{ getInitials(authStore.user?.name || '') }}
            </div>
            <div class="profile-details">
              <div class="profile-name">{{ authStore.user?.name }}</div>
              <div class="profile-email">{{ authStore.user?.email }}</div>
              <div class="profile-joined">Joined {{ formatDate(authStore.user?.createdAt) }}</div>
            </div>
          </div>
          
          <div class="settings-option">
            <label for="email">Email Address</label>
            <div class="input-with-button">
              <input
                type="email"
                id="email"
                v-model="emailAddress"
                placeholder="Your email address"
              />
              <button 
                class="action-button"
                @click="updateEmail"
                :disabled="emailAddress === authStore.user?.email"
              >
                Update
              </button>
            </div>
          </div>
          
          <div class="settings-option">
            <label>Password</label>
            <button class="secondary-button" @click="showPasswordChange = true">
              <i class="fas fa-key"></i> Change Password
            </button>
          </div>
          
          <div v-if="showPasswordChange" class="password-change-form">
            <div class="form-group">
              <label for="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                v-model="currentPassword"
                placeholder="Enter current password"
              />
            </div>
            
            <div class="form-group">
              <label for="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                v-model="newPassword"
                placeholder="Enter new password"
              />
            </div>
            
            <div class="form-group">
              <label for="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                v-model="confirmPassword"
                placeholder="Confirm new password"
              />
            </div>
            
            <div class="password-strength" v-if="newPassword">
              <div class="strength-label">Password Strength:</div>
              <div class="strength-meter">
                <div
                  class="strength-value"
                  :style="{ width: `${passwordStrength * 25}%` }"
                  :class="getPasswordStrengthClass"
                ></div>
              </div>
              <div class="strength-text" :class="getPasswordStrengthClass">
                {{ getPasswordStrengthText }}
              </div>
            </div>
            
            <div class="form-actions">
              <button class="cancel-button" @click="cancelPasswordChange">
                Cancel
              </button>
              <button
                class="action-button"
                @click="updatePassword"
                :disabled="!canUpdatePassword || authUpdating"
              >
                <i v-if="authUpdating" class="fas fa-spinner fa-spin"></i>
                <span v-else>Update Password</span>
              </button>
            </div>
          </div>
          
          <div class="settings-option">
            <label>Connected Accounts</label>
            <div class="connected-accounts">
              <div class="connection-item">
                <i class="fab fa-google"></i>
                <span>Google</span>
                <button class="connection-button" @click="connectGoogle">
                  {{ googleConnected ? 'Disconnect' : 'Connect' }}
                </button>
              </div>
              
              <div class="connection-item">
                <i class="fab fa-github"></i>
                <span>GitHub</span>
                <button class="connection-button" @click="connectGithub">
                  {{ githubConnected ? 'Disconnect' : 'Connect' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="settings-divider"></div>
        
        <!-- Subscription Section -->
        <div class="settings-section">
          <h2 class="settings-section__title">Subscription</h2>
          
          <div class="subscription-card">
            <div class="subscription-header">
              <h3 class="subscription-plan">{{ getPlanLabel(authStore.user?.subscription?.plan) }}</h3>
              <div class="subscription-status" :class="getStatusClass">
                {{ getStatusLabel(authStore.user?.subscription?.status) }}
              </div>
            </div>
            
            <div class="subscription-details">
              <div v-if="authStore.user?.subscription?.expiresAt" class="subscription-info">
                <span>Renews on {{ formatDate(authStore.user?.subscription?.expiresAt) }}</span>
              </div>
              <div class="subscription-features">
                <div class="feature-item">
                  <i class="fas fa-check"></i>
                  <span>{{ getPlanFeatures(authStore.user?.subscription?.plan).templates }} Template Limit</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-check"></i>
                  <span>{{ getPlanFeatures(authStore.user?.subscription?.plan).sections }} Sections Per Template</span>
                </div>
                <div class="feature-item" v-if="getPlanFeatures(authStore.user?.subscription?.plan).cloudStorage">
                  <i class="fas fa-check"></i>
                  <span>Cloud Storage</span>
                </div>
                <div class="feature-item" v-if="getPlanFeatures(authStore.user?.subscription?.plan).sharing">
                  <i class="fas fa-check"></i>
                  <span>Template Sharing</span>
                </div>
                <div class="feature-item" v-if="getPlanFeatures(authStore.user?.subscription?.plan).themes">
                  <i class="fas fa-check"></i>
                  <span>Custom Themes</span>
                </div>
              </div>
            </div>
            
            <div class="subscription-actions">
              <button class="primary-button" @click="openChangePlan">
                <i class="fas fa-sync-alt"></i> Change Plan
              </button>
              
              <button v-if="authStore.user?.subscription?.status === 'active'" class="secondary-button" @click="openUpdatePayment">
                <i class="fas fa-credit-card"></i> Update Payment Method
              </button>
              
              <button v-if="authStore.user?.subscription?.status === 'active'" class="danger-button" @click="openCancelSubscription">
                <i class="fas fa-times-circle"></i> Cancel Subscription
              </button>
              
              <button v-if="authStore.user?.subscription?.status === 'canceled'" class="primary-button" @click="openReactivateSubscription">
                <i class="fas fa-redo"></i> Reactivate Subscription
              </button>
            </div>
          </div>
          
          <div v-if="showBillingCycle" class="billing-cycle-toggle">
            <label>Billing Cycle</label>
            <div class="toggle-container">
              <span :class="{ 'active': billingCycle === 'monthly' }">Monthly</span>
              <label class="toggle">
                <input
                  type="checkbox"
                  v-model="annualBilling"
                  @change="toggleBillingCycle"
                />
                <span class="toggle-slider"></span>
              </label>
              <span :class="{ 'active': billingCycle === 'annual' }">Annual <span class="discount">Save 20%</span></span>
            </div>
          </div>
        </div>
        
        <div class="settings-divider"></div>
        
        <!-- Appearance Section -->
        <div class="settings-section">
          <h2 class="settings-section__title">Appearance</h2>
          <div class="settings-option">
            <label for="theme">Theme</label>
            <select id="theme" v-model="theme" @change="updateTheme">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>
        
        <div class="settings-divider"></div>
        
        <!-- Export Settings -->
        <div class="settings-section">
          <h2 class="settings-section__title">Export Settings</h2>
          <div class="settings-option">
            <label for="export-profile">Default Export Profile</label>
            <select id="export-profile" v-model="exportProfileId" @change="updateExportProfile">
              <option v-for="profile in exportProfiles" :key="profile.id" :value="profile.id">
                {{ profile.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="settings-divider"></div>
        
        <!-- Editor Settings -->
        <div class="settings-section">
          <h2 class="settings-section__title">Editor Settings</h2>
          <div class="settings-option">
            <label for="editor-width">Default Editor Panel Width (%)</label>
            <input 
              type="range" 
              id="editor-width" 
              v-model="editorWidth" 
              min="20" 
              max="80" 
              step="5"
              @change="updateEditorWidth"
            />
            <span class="settings-value">{{ editorWidth }}%</span>
          </div>
        </div>
        
        <div class="settings-divider"></div>
        
        <!-- Storage Management -->
        <div class="settings-section">
          <h2 class="settings-section__title">Storage Management</h2>
          <div class="settings-option">
            <button class="danger-button" @click="confirmClearStorage">
              <i class="fas fa-trash"></i> Clear All Templates
            </button>
            <p class="settings-description">
              This action will delete all your templates and cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      v-if="uiStore.showConfirmDialog"
      :title="uiStore.confirmDialogTitle"
      :message="uiStore.confirmDialogMessage"
      :confirm-button-text="uiStore.confirmDialogConfirmText"
      :cancel-button-text="uiStore.confirmDialogCancelText"
      @confirm="uiStore.handleConfirmDialogConfirm()"
      @cancel="uiStore.handleConfirmDialogCancel()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmationDialog from '../components/UI/ConfirmationDialog.vue';
import { useTemplateStore, useUIStore, usePreferencesStore } from '../stores';
import { useAuthStore } from '../stores/auth';

// Get stores and router
const router = useRouter();
const templateStore = useTemplateStore();
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();
const authStore = useAuthStore();

// Reactive state for appearance & editor
const theme = ref('dark');
const exportProfileId = ref('');
const editorWidth = ref(50);

// Reactive state for account management
const emailAddress = ref('');
const showPasswordChange = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const authUpdating = ref(false);

// Reactive state for OAuth connections
const googleConnected = ref(false);
const githubConnected = ref(false);

// Reactive state for subscription
const showBillingCycle = ref(false);
const billingCycle = ref('monthly');
const annualBilling = ref(false);

// Computed properties
const exportProfiles = computed(() => {
  return preferencesStore.exportProfiles;
});

const passwordStrength = computed(() => {
  if (!newPassword.value) return 0;
  
  let strength = 0;
  
  // Length check
  if (newPassword.value.length >= 8) strength++;
  
  // Contains number
  if (/\d/.test(newPassword.value)) strength++;
  
  // Contains lowercase and uppercase
  if (/[a-z]/.test(newPassword.value) && /[A-Z]/.test(newPassword.value)) strength++;
  
  // Contains special character
  if (/[^a-zA-Z0-9]/.test(newPassword.value)) strength++;
  
  return strength;
});

const getPasswordStrengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return 'weak';
  if (strength === 2) return 'medium';
  if (strength === 3) return 'good';
  return 'strong';
});

const getPasswordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return 'Weak';
  if (strength === 2) return 'Medium';
  if (strength === 3) return 'Good';
  return 'Strong';
});

const canUpdatePassword = computed(() => {
  return (
    currentPassword.value.length > 0 &&
    newPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value &&
    passwordStrength.value >= 2
  );
});

const getStatusClass = computed(() => {
  const status = authStore.user?.subscription?.status;
  if (status === 'active') return 'status-active';
  if (status === 'canceled') return 'status-canceled';
  return 'status-expired';
});

// Lifecycle hooks
onMounted(() => {
  // Load all settings from stores
  preferencesStore.loadPreferences();
  
  // Set current values
  theme.value = preferencesStore.editorTheme || 'dark';
  exportProfileId.value = preferencesStore.activeExportProfileId || '';
  editorWidth.value = uiStore.editorWidth;
  
  // Set user info
  if (authStore.user) {
    emailAddress.value = authStore.user.email;
  }
  
  // Set the last visited view to 'settings'
  preferencesStore.setLastVisitedView('settings');
});

// Helper methods
const getInitials = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const getPlanLabel = (plan: string | undefined) => {
  switch (plan) {
    case 'free': return 'Free Plan';
    case 'premium': return 'Premium Plan';
    case 'pro': return 'Pro Plan';
    default: return 'Free Plan';
  }
};

const getStatusLabel = (status: string | undefined) => {
  switch (status) {
    case 'active': return 'Active';
    case 'canceled': return 'Canceled';
    case 'expired': return 'Expired';
    default: return 'Inactive';
  }
};

const getPlanFeatures = (plan: string | undefined) => {
  switch (plan) {
    case 'free':
      return {
        templates: '3',
        sections: '5',
        cloudStorage: false,
        sharing: false,
        themes: false
      };
    case 'premium':
      return {
        templates: 'Unlimited',
        sections: 'Unlimited',
        cloudStorage: true,
        sharing: true,
        themes: false
      };
    case 'pro':
      return {
        templates: 'Unlimited',
        sections: 'Unlimited',
        cloudStorage: true,
        sharing: true,
        themes: true
      };
    default:
      return {
        templates: '3',
        sections: '5',
        cloudStorage: false,
        sharing: false,
        themes: false
      };
  }
};

// Methods for appearance & editor
const updateTheme = () => {
  preferencesStore.setEditorTheme(theme.value);
  document.documentElement.setAttribute('data-theme', theme.value);
};

const updateExportProfile = () => {
  preferencesStore.setActiveExportProfile(exportProfileId.value);
  uiStore.showToast('Export profile updated', 'success');
};

const updateEditorWidth = () => {
  uiStore.setEditorWidth(Number(editorWidth.value));
  preferencesStore.saveEditorWidth(Number(editorWidth.value));
};

// Methods for account management
const updateEmail = async () => {
  if (!emailAddress.value || emailAddress.value === authStore.user?.email) return;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailAddress.value)) {
    uiStore.showToast('Please enter a valid email address', 'error');
    return;
  }
  
  authUpdating.value = true;
  
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock updating the user's email
    if (authStore.user) {
      // This is just for demo - in a real app, the authStore would have an updateEmail method
      authStore.user = {
        ...authStore.user,
        email: emailAddress.value
      };
    }
    
    uiStore.showToast('Email updated successfully', 'success');
  } catch (error) {
    uiStore.showToast('Failed to update email', 'error');
  } finally {
    authUpdating.value = false;
  }
};

const updatePassword = async () => {
  if (!canUpdatePassword.value) return;
  
  authUpdating.value = true;
  
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    uiStore.showToast('Password updated successfully', 'success');
    cancelPasswordChange();
  } catch (error) {
    uiStore.showToast('Failed to update password', 'error');
  } finally {
    authUpdating.value = false;
  }
};

const cancelPasswordChange = () => {
  showPasswordChange.value = false;
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
};

// Methods for OAuth connections
const connectGoogle = async () => {
  if (googleConnected.value) {
    // Disconnect
    uiStore.showConfirmationDialog(
      'Disconnect Google Account',
      'Are you sure you want to disconnect your Google account?',
      'Disconnect',
      'Cancel',
      async () => {
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 500));
          googleConnected.value = false;
          uiStore.showToast('Google account disconnected', 'success');
        } catch (error) {
          uiStore.showToast('Failed to disconnect Google account', 'error');
        }
      },
      () => {}
    );
  } else {
    // Connect
    try {
      // In a real app, this would open OAuth flow
      await new Promise(resolve => setTimeout(resolve, 800));
      googleConnected.value = true;
      uiStore.showToast('Google account connected', 'success');
    } catch (error) {
      uiStore.showToast('Failed to connect Google account', 'error');
    }
  }
};

const connectGithub = async () => {
  if (githubConnected.value) {
    // Disconnect
    uiStore.showConfirmationDialog(
      'Disconnect GitHub Account',
      'Are you sure you want to disconnect your GitHub account?',
      'Disconnect',
      'Cancel',
      async () => {
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 500));
          githubConnected.value = false;
          uiStore.showToast('GitHub account disconnected', 'success');
        } catch (error) {
          uiStore.showToast('Failed to disconnect GitHub account', 'error');
        }
      },
      () => {}
    );
  } else {
    // Connect
    try {
      // In a real app, this would open OAuth flow
      await new Promise(resolve => setTimeout(resolve, 800));
      githubConnected.value = true;
      uiStore.showToast('GitHub account connected', 'success');
    } catch (error) {
      uiStore.showToast('Failed to connect GitHub account', 'error');
    }
  }
};

// Methods for subscription management
const toggleBillingCycle = () => {
  billingCycle.value = annualBilling.value ? 'annual' : 'monthly';
};

const openChangePlan = () => {
  showBillingCycle.value = true;
  
  uiStore.showConfirmationDialog(
    'Change Subscription Plan',
    'Select your new subscription plan:',
    'Continue',
    'Cancel',
    () => {
      // In a real app, this would navigate to a payment page
      uiStore.showToast('This would redirect to payment page in a real app', 'info');
    },
    () => {
      showBillingCycle.value = false;
    }
  );
};

const openUpdatePayment = () => {
  // In a real app, this would open a payment method update UI
  uiStore.showToast('This would open payment method update in a real app', 'info');
};

const openCancelSubscription = () => {
  uiStore.showConfirmationDialog(
    'Cancel Subscription',
    'Are you sure you want to cancel your subscription? You\'ll still have access until the end of your current billing period.',
    'Cancel Subscription',
    'Keep Subscription',
    async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock updating the subscription status
        if (authStore.user) {
          authStore.user = {
            ...authStore.user,
            subscription: {
              ...authStore.user.subscription,
              status: 'canceled'
            }
          };
        }
        
        uiStore.showToast('Subscription canceled successfully', 'success');
      } catch (error) {
        uiStore.showToast('Failed to cancel subscription', 'error');
      }
    },
    () => {}
  );
};

const openReactivateSubscription = () => {
  uiStore.showConfirmationDialog(
    'Reactivate Subscription',
    'Would you like to reactivate your subscription?',
    'Reactivate',
    'Cancel',
    async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock updating the subscription status
        if (authStore.user) {
          authStore.user = {
            ...authStore.user,
            subscription: {
              ...authStore.user.subscription,
              status: 'active'
            }
          };
        }
        
        uiStore.showToast('Subscription reactivated successfully', 'success');
      } catch (error) {
        uiStore.showToast('Failed to reactivate subscription', 'error');
      }
    },
    () => {}
  );
};

// Methods for storage management
const confirmClearStorage = () => {
  uiStore.showConfirmationDialog(
    'Clear All Templates',
    'Are you sure you want to delete all templates? This action cannot be undone.',
    'Delete All',
    'Cancel',
    clearAllTemplates,
    () => {}
  );
};

const clearAllTemplates = () => {
  templateStore.clearAllTemplates();
  uiStore.showToast('All templates have been deleted', 'success');
};
</script>

<style scoped>
.settings-view {
  height: 100vh;
  width: 100%;
  overflow-y: auto;
}

.settings-container {
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.settings-header__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-content {
  padding: var(--spacing-lg);
}

.settings-section {
  margin-bottom: var(--spacing-lg);
}

.settings-section__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md);
  color: var(--color-text);
}

.settings-option {
  margin-bottom: var(--spacing-md);
}

.settings-option label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.settings-option select,
.settings-option input[type="text"],
.settings-option input[type="email"],
.settings-option input[type="password"],
.settings-option input[type="number"] {
  width: 100%;
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-xs);
}

.settings-option input[type="range"] {
  width: 100%;
  margin-bottom: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.05);
  height: 8px;
  border-radius: var(--radius-full);
  outline: none;
  -webkit-appearance: none;
}

.settings-option input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

.settings-value {
  display: inline-block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.settings-description {
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-xs);
}

.settings-divider {
  height: 1px;
  background: var(--glass-border);
  margin: var(--spacing-lg) 0;
}

/* Profile summary styles */
.profile-summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.profile-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.profile-email {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.profile-joined {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

/* Input with button */
.input-with-button {
  display: flex;
  gap: var(--spacing-sm);
}

.input-with-button input {
  flex: 1;
  margin-bottom: 0;
}

/* Button styles */
.action-button,
.secondary-button,
.cancel-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-button {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  border: none;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(var(--color-primary-rgb), 0.3);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.cancel-button {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

.danger-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: rgb(244, 67, 54);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.danger-button:hover {
  background: rgba(244, 67, 54, 0.2);
  transform: translateY(-1px);
}

/* Password change form */
.password-change-form {
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.password-strength {
  margin-top: var(--spacing-sm);
}

.strength-label {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-xs);
}

.strength-meter {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.strength-value {
  height: 100%;
  transition: all var(--transition-fast);
}

.strength-value.weak {
  background: #f44336;
}

.strength-value.medium {
  background: #ff9800;
}

.strength-value.good {
  background: #4caf50;
}

.strength-value.strong {
  background: #2196f3;
}

.strength-text {
  font-size: 0.8rem;
  text-align: right;
}

.strength-text.weak { color: #f44336; }
.strength-text.medium { color: #ff9800; }
.strength-text.good { color: #4caf50; }
.strength-text.strong { color: #2196f3; }

/* Connected accounts */
.connected-accounts {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.connection-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
}

.connection-item i {
  font-size: 1.25rem;
  width: 30px;
}

.connection-item span {
  flex: 1;
}

.connection-button {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.connection-button:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

/* Subscription card styles */
.subscription-card {
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  margin-bottom: var(--spacing-md);
}

.subscription-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.subscription-plan {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-primary);
}

.subscription-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-canceled {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.status-expired {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.subscription-details {
  margin-bottom: var(--spacing-md);
}

.subscription-info {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.subscription-features {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.9rem;
}

.feature-item i {
  color: var(--color-primary);
}

.subscription-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

/* Billing cycle toggle */
.billing-cycle-toggle {
  margin-top: var(--spacing-sm);
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xs);
}

.toggle-container span {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.toggle-container span.active {
  color: var(--color-text);
  font-weight: 500;
}

.discount {
  font-size: 0.75rem;
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  margin-left: var(--spacing-xs);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 34px;
  transition: .4s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 3px;
  background-color: var(--color-text);
  border-radius: 50%;
  transition: .4s;
}

input:checked + .toggle-slider {
  background-color: rgba(var(--color-primary-rgb), 0.5);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
  background-color: var(--color-primary);
}

@media (max-width: 640px) {
  .settings-container {
    padding: var(--spacing-md);
  }
  
  .settings-header {
    padding: var(--spacing-md) var(--spacing-md);
  }
  
  .settings-content {
    padding: var(--spacing-md);
  }
  
  .profile-summary {
    flex-direction: column;
    text-align: center;
  }
  
  .input-with-button {
    flex-direction: column;
  }
  
  .subscription-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .subscription-actions {
    flex-direction: column;
  }
}
</style>