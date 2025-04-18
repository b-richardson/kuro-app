<!-- components/subscription/FeatureGate.vue -->
<template>
  <div>
    <!-- Show content if user has access -->
    <slot v-if="hasAccess"></slot>

    <!-- Otherwise show upsell message (unless disabled) -->
    <div v-else-if="!hideUpsell" class="feature-gate-upsell">
      <slot name="upsell">
        <div class="upgrade-prompt">
          <h3>{{ title || "Pro Feature" }}</h3>
          <p>{{ message || "This feature requires a Pro subscription." }}</p>
          <router-link to="/pricing" class="upgrade-button">
            Upgrade Now
          </router-link>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@/stores/userStore";

const props = defineProps<{
  feature: string;
  title?: string;
  message?: string;
  hideUpsell?: boolean;
}>();

const userStore = useUserStore();

const hasAccess = computed(() => {
  return userStore.canAccessFeature(props.feature);
});
</script>

<style scoped>
.feature-gate-upsell {
  background: var(--color-bg-light);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  border: 1px dashed var(--color-border);
}

.upgrade-prompt h3 {
  margin-top: 0;
  color: var(--color-primary);
}

.upgrade-button {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 1rem;
}
</style>
