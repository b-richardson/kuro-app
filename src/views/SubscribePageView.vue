<template>
  <div class="subscribe-page">
    <div class="container">
      <div class="subscribe-card">
        <h1 class="subscribe-title">
          {{ planTitle }}
        </h1>
        <p class="subscribe-description">
          {{ planDescription }}
        </p>

        <div class="price-display">
          <span class="currency">$</span>
          <span class="amount">{{ planPrice }}</span>
          <span class="period">/{{ billingPeriod }}</span>
        </div>

        <ul class="feature-list">
          <li v-for="feature in proPlanFeatures" :key="feature">
            <i class="icon-check"></i>
            <span>{{ feature }}</span>
          </li>
        </ul>

        <SubscribeButton :billing-cycle="billingCycle" />

        <p class="guarantee">7-day money-back guarantee, no questions asked</p>

        <div class="alternative-option">
          <p>
            {{ alternativeOptionText }}
            <router-link :to="alternativeOptionRoute" class="alternative-link">
              {{ alternativeOptionLinkText }}
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import SubscribeButton from "@/components/subscription/SubscribeButton.vue";

const route = useRoute();
const planType = computed(() => (route.params.plan as string) || "monthly");
const billingCycle = computed(() =>
  planType.value === "annual" ? "annual" : "monthly"
);

// Plan features
const proPlanFeatures = [
  "All template modules including Templater & Dataview",
  "Direct Obsidian vault integration",
  "True-to-Obsidian preview",
  "Template library access",
  "Template sharing & importing",
  "Priority support",
  "7-day money-back guarantee",
];

// Plan details based on the selected plan
const planTitle = computed(() =>
  billingCycle.value === "monthly" ? "Kuro Pro - Monthly" : "Kuro Pro - Annual"
);

const planDescription = computed(() =>
  billingCycle.value === "monthly"
    ? "Full access to all Pro features with flexible monthly billing."
    : "Get all Pro features at our best price with annual billing. Save 20%!"
);

const planPrice = computed(() =>
  billingCycle.value === "monthly" ? "4.99" : "47.90"
);

const billingPeriod = computed(() =>
  billingCycle.value === "monthly" ? "month" : "year"
);

// Text for alternative billing option
const alternativeOptionText = computed(() =>
  billingCycle.value === "monthly"
    ? "Looking for a better deal?"
    : "Need more flexibility?"
);

const alternativeOptionLinkText = computed(() =>
  billingCycle.value === "monthly"
    ? "Switch to annual billing and save 20%"
    : "Switch to monthly billing"
);

const alternativeOptionRoute = computed(() =>
  billingCycle.value === "monthly" ? "/subscribe/annual" : "/subscribe/monthly"
);
</script>

<style scoped>
/* Similar styling to your pricing page, but focused on a single plan */
.subscribe-page {
  background-color: var(--color-background);
  padding: 6rem 0;
  min-height: 100vh;
}

.container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
}

.subscribe-card {
  background: var(--color-surface);
  border-radius: 1rem;
  border: 1px solid var(--color-primary);
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 20px 40px rgba(136, 102, 233, 0.1);
}

.subscribe-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-secondary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.subscribe-description {
  font-size: 1.125rem;
  color: var(--color-text-light);
  margin-bottom: 2rem;
}

.price-display {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 2rem;
}

.currency {
  font-size: 2rem;
  vertical-align: super;
}

.period {
  font-size: 1.25rem;
  color: var(--color-text-light);
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  text-align: left;
}

.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--color-text-light);
}

.feature-list li i {
  color: var(--color-primary);
  font-size: 1.125rem;
}

.guarantee {
  font-size: 0.875rem;
  text-align: center;
  color: var(--color-text-light);
  margin-top: 1.5rem;
}

.alternative-option {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.alternative-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.alternative-link:hover {
  text-decoration: underline;
}
</style>
