<template>
  <div class="dashboard-container">
    <UserGreeting />
    <RecentTemplates />
    <RecentActivity />
    <QuickLinks />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useTemplateStore } from "@/stores/template";
import UserGreeting from "@/components/dashboard/UserGreeting.vue";
import RecentTemplates from "@/components/dashboard/RecentTemplates.vue";
import RecentActivity from "@/components/dashboard/RecentActivity.vue";
import QuickLinks from "@/components/dashboard/QuickLinks.vue";

const templateStore = useTemplateStore();

onMounted(async () => {
  try {
    await templateStore.loadTemplates();
  } catch (err) {
    console.error("Error loading templates:", err);
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: var(--spacing-md);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Animation for entering elements */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-container > * {
  animation: fadeIn 0.4s ease-out both;
}

.dashboard-container > *:nth-child(1) {
  animation-delay: 0s;
}

.dashboard-container > *:nth-child(2) {
  animation-delay: 0.1s;
}

.dashboard-container > *:nth-child(3) {
  animation-delay: 0.2s;
}

.dashboard-container > *:nth-child(4) {
  animation-delay: 0.3s;
}

/* Loading state styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  margin-top: 50px;
}

.loading-container p {
  margin-top: 20px;
  font-size: 1.2rem;
  color: var(--color-text-secondary);
}

/* Unauthorized state styles */
.unauthorized-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.unauthorized-content {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  max-width: 400px;
  animation: fadeIn 0.4s ease-out;
}

.unauthorized-content i {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.unauthorized-content h2 {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.unauthorized-content p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.login-button {
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid var(--color-text-tertiary);
  border-bottom-color: var(--color-primary);
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Customize component colors to match theme */
.user-greeting {
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb), 0.05),
    rgba(var(--color-primary-rgb), 0.1)
  );
}

.greeting-text {
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  -webkit-background-clip: text;
  background-clip: text;
}

.primary-action-button {
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text);
}

.section-header h3 i {
  color: var(--color-primary);
}

/* Responsive styling */
@media (max-width: 768px) {
  .dashboard-container {
    padding: var(--spacing-sm);
    gap: var(--spacing-md);
  }
}
</style>
