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
            <div
              class="profile-avatar"
              :class="{ 'pro-user': userStore.isSubscribed }"
            >
              {{ getInitials(authStore.user?.email || "") }}
              <span v-if="userStore.isSubscribed" class="pro-badge">PRO</span>
            </div>
            <div class="profile-details">
              <div class="profile-email">{{ authStore.user?.email }}</div>
              <div class="profile-subscription">
                <template v-if="userStore.isSubscribed">
                  {{ getSubscriptionTypeLabel }}
                  <span
                    v-if="userStore.profile?.subscription_period_end"
                    class="subscription-date"
                  >
                    (Renews:
                    {{ formatDate(userStore.profile.subscription_period_end) }})
                  </span>
                </template>
                <template v-else> Free Plan </template>
              </div>
              <div class="profile-joined" v-if="authStore.user?.created_at">
                Joined {{ formatDate(authStore.user.created_at) }}
              </div>
            </div>
          </div>

          <div class="subscription-actions" v-if="!userStore.isSubscribed">
            <router-link to="/pricing" class="primary-button">
              <i class="fas fa-crown"></i> Upgrade to Pro
            </router-link>
          </div>
          <div class="subscription-actions" v-else>
            <button class="secondary-button" @click="manageSubscription">
              <i class="fas fa-cog"></i> Manage Subscription
            </button>
          </div>
        </div>

        <div class="settings-divider"></div>

        <!-- Password Section -->
        <div class="settings-section">
          <h2 class="settings-section__title">Security</h2>

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
        </div>

        <div class="settings-divider"></div>

        <!-- Obsidian Integration -->
        <ObsidianStatusCard />

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

        <!-- Data Management -->
        <div class="settings-section">
          <h2 class="settings-section__title">Data Management</h2>
          <div class="settings-option">
            <button class="danger-button" @click="confirmClearTemplates">
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
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import ConfirmationDialog from "../components/UI/ConfirmationDialog.vue";
import { useTemplateStore } from "../stores/template";
import { useUIStore } from "../stores/ui";
import { usePreferencesStore } from "../stores/preferences";
import { useAuthStore } from "../stores/auth";
import { useUserStore } from "../stores/userStore";
import ObsidianStatusCard from "../components/Layout/ObsidianStatusIndicator.vue";
import { subscriptionService } from "../services/supabase/subscriptions";

const router = useRouter();
const templateStore = useTemplateStore();
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();
const authStore = useAuthStore();
const userStore = useUserStore();

const theme = ref("dark");
const showPasswordChange = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const authUpdating = ref(false);

// Computed values
const passwordStrength = computed(() => {
  if (!newPassword.value) return 0;
  let strength = 0;
  if (newPassword.value.length >= 8) strength++;
  if (/\d/.test(newPassword.value)) strength++;
  if (/[a-z]/.test(newPassword.value) && /[A-Z]/.test(newPassword.value))
    strength++;
  if (/[^a-zA-Z0-9]/.test(newPassword.value)) strength++;
  return strength;
});

const getPasswordStrengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return "weak";
  if (strength === 2) return "medium";
  if (strength === 3) return "good";
  return "strong";
});

const getPasswordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return "Weak";
  if (strength === 2) return "Medium";
  if (strength === 3) return "Good";
  return "Strong";
});

const canUpdatePassword = computed(() => {
  return (
    currentPassword.value.length > 0 &&
    newPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value &&
    passwordStrength.value >= 2
  );
});

const getSubscriptionTypeLabel = computed(() => {
  console.log("User profile:", userStore.profile); // Debug - check what's in the profile

  if (!userStore.profile?.subscription_plan) return "Free Plan";

  // Handle both new format (pro-monthly, pro-annual) and old format (pro)
  const plan = userStore.profile.subscription_plan;
  console.log("Subscription plan:", plan); // Debug - check the actual plan

  if (plan === "pro-monthly") return "Pro Monthly";
  if (plan === "pro-annual") return "Pro Annual";
  if (plan === "pro") return "Pro Subscription";
  if (plan === "free") return "Free Plan";

  return plan.charAt(0).toUpperCase() + plan.slice(1); // Capitalize any other plan
});

// Lifecycle hooks
onMounted(() => {
  // Load preferences
  preferencesStore.loadPreferences();
  theme.value = preferencesStore.editorTheme || "dark";

  // Set last visited view
  preferencesStore.setLastVisitedView("settings");

  // Ensure user profile is loaded
  if (authStore.isAuthenticated && !userStore.profile) {
    userStore.fetchUserProfile();
  }
});

// Methods
const getInitials = (email: string) => {
  if (!email) return "";

  // Get initials from email (first letter of username)
  const username = email.split("@")[0];
  return username.charAt(0).toUpperCase();
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const updateTheme = () => {
  preferencesStore.setEditorTheme(theme.value);
  document.documentElement.setAttribute("data-theme", theme.value);
};

const updatePassword = async () => {
  if (!canUpdatePassword.value) return;
  authUpdating.value = true;

  try {
    // Call Supabase to update password - returns boolean
    const success = await authStore.updatePassword(newPassword.value);

    if (!success) {
      throw new Error("Failed to update password");
    }

    uiStore.showToast("Password updated successfully", "success");
    cancelPasswordChange();
  } catch (error) {
    uiStore.showToast(`Failed to update password: ${error}`, "error");
  } finally {
    authUpdating.value = false;
  }
};

const cancelPasswordChange = () => {
  showPasswordChange.value = false;
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
};

const manageSubscription = async () => {
  // Here you would redirect to Stripe customer portal
  // or your subscription management page
  uiStore.showToast("Subscription management coming soon", "info");
};

const confirmClearTemplates = () => {
  uiStore.showConfirmationDialog(
    "Clear All Templates",
    "Are you sure you want to delete all templates? This action cannot be undone.",
    "Delete All",
    "Cancel",
    clearAllTemplates,
    () => {}
  );
};

const clearAllTemplates = async () => {
  console.log("Clearing all templates...");
};
</script>

<style scoped>
.settings-view {
  display: flex;
  justify-content: center;
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
}

.settings-container {
  width: 100%;
  max-width: 800px;
}

.settings-header {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 12px;
}

.settings-header__title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.settings-content {
  padding: 2rem;
  border-radius: 12px;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section__title {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.profile-summary {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-right: 1.5rem;
  position: relative;
}

.profile-avatar.pro-user {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-accent)
  );
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.pro-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background-color: gold;
  color: #333;
  font-size: 0.6rem;
  font-weight: bold;
  padding: 3px 6px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.profile-details {
  flex: 1;
}

.profile-email {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.profile-subscription {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.subscription-date {
  font-size: 0.9rem;
  opacity: 0.8;
}

.profile-joined {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.subscription-actions {
  margin-top: 1.5rem;
}

.settings-option {
  margin-bottom: 1.5rem;
}

.settings-option label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.settings-option select,
.settings-option input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-input);
  color: var(--color-text);
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.settings-option select:focus,
.settings-option input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.settings-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 2rem 0;
  opacity: 0.5;
}

.password-change-form {
  background-color: var(--color-bg-light);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid var(--color-border);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.password-strength {
  margin-top: 1rem;
}

.strength-label {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.strength-meter {
  height: 8px;
  background-color: var(--color-bg-dark);
  border-radius: 4px;
  overflow: hidden;
}

.strength-value {
  height: 100%;
  transition: width 0.3s;
}

.strength-value.weak {
  background-color: #ff4d4d;
}

.strength-value.medium {
  background-color: #ffb84d;
}

.strength-value.good {
  background-color: #4da6ff;
}

.strength-value.strong {
  background-color: #4dff4d;
}

.strength-text {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-align: right;
}

.strength-text.weak {
  color: #ff4d4d;
}

.strength-text.medium {
  color: #ffb84d;
}

.strength-text.good {
  color: #4da6ff;
}

.strength-text.strong {
  color: #4dff4d;
}

.primary-button,
.secondary-button,
.danger-button,
.action-button,
.cancel-button {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-button {
  background-color: var(--color-primary);
  color: white;
}

.primary-button:hover {
  background-color: var(--color-primary-dark);
}

.secondary-button {
  background-color: var(--color-bg-light);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.secondary-button:hover {
  background-color: var(--color-bg);
}

.danger-button {
  background-color: var(--color-danger);
  color: white;
}

.danger-button:hover {
  background-color: var(--color-danger-dark, #d32f2f);
}

.action-button {
  background-color: var(--color-primary);
  color: white;
}

.action-button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button {
  background-color: transparent;
  color: var(--color-text);
}

.cancel-button:hover {
  background-color: var(--color-bg-light);
}

.settings-description {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .settings-view {
    padding: 1rem;
  }

  .settings-content {
    padding: 1.5rem;
  }

  .profile-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-avatar {
    margin-bottom: 1rem;
    margin-right: 0;
  }
}
</style>
