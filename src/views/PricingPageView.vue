<template>
  <ScrollContainer>
    <div class="pricing-page">
      <div class="container">
        <div class="section-heading">
          <h1 class="section-title">Choose Your Plan</h1>
          <p class="section-subtitle">
            Start building better templates today with a plan that fits your
            needs
          </p>
        </div>

        <div class="pricing-toggle">
          <span :class="{ active: billingCycle === 'monthly' }">Monthly</span>
          <button
            class="toggle-switch"
            :class="{ toggled: billingCycle === 'annual' }"
            @click="toggleBillingCycle"
            aria-label="Toggle billing cycle"
          >
            <span class="toggle-slider"></span>
          </button>
          <span :class="{ active: billingCycle === 'annual' }">
            Annual
            <span class="discount-badge">Save 20%</span>
          </span>
        </div>

        <div class="pricing-cards">
          <div class="pricing-card">
            <div class="card-header">
              <h3 class="card-title">Free</h3>
              <div class="price">
                <span class="currency">$</span>
                <span class="amount">0</span>
                <span class="period">/forever</span>
              </div>
              <p class="price-subtitle">Always free</p>
            </div>

            <ul class="feature-list">
              <li v-for="feature in freePlanFeatures" :key="feature">
                <i class="icon-check"></i>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <p class="current-plan">Your current plan</p>
          </div>

          <div class="pricing-card featured">
            <div class="popular-badge">Most Popular</div>
            <div class="card-header">
              <h3 class="card-title">Pro</h3>
              <div class="price">
                <span class="currency">$</span>
                <span class="amount">{{ proPlanPrice }}</span>
                <span class="period">/{{ billingPeriod }}</span>
              </div>
              <p class="price-subtitle">{{ billingNote }}</p>
            </div>

            <ul class="feature-list">
              <li v-for="feature in proPlanFeatures" :key="feature">
                <i class="icon-check"></i>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <SubscribeButton :billing-cycle="billingCycle" />

            <p class="guarantee">
              7-day money-back guarantee, no questions asked
            </p>
          </div>
        </div>

        <div class="pricing-note">
          <i class="icon-shield"></i>
          <p>Upgrade, downgrade, or cancel anytime. No hidden fees.</p>
        </div>
      </div>
    </div>
  </ScrollContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import SubscribeButton from "@/components/billing/SubscribeButton.vue";
import ScrollContainer from "@/components/UI/ScrollContainer.vue";

type BillingCycle = "monthly" | "annual";

const route = useRoute();
const billingCycle = ref<BillingCycle>("monthly");

const freePlanFeatures = [
  "Basic template modules",
  "Unlimited template creation",
  "Markdown export",
  "Community support",
];

const proPlanFeatures = [
  "Everything in Free plan",
  "All template modules including Templater & Dataview",
  "Direct Obsidian vault integration",
  "True-to-Obsidian preview",
  "Template library access",
  "Template sharing & importing",
  "Faster updates & new modules",
  "Priority support",
];

const toggleBillingCycle = () => {
  billingCycle.value = billingCycle.value === "monthly" ? "annual" : "monthly";
};

const proPlanPrice = computed(() => {
  return billingCycle.value === "monthly" ? "4.99" : "47.90";
});

const billingPeriod = computed(() => {
  return billingCycle.value === "monthly" ? "month" : "year";
});

const billingNote = computed(() => {
  return billingCycle.value === "monthly"
    ? "Billed monthly, cancel anytime"
    : "Billed annually (save 20%)";
});

onMounted(() => {
  // Check if we have a billing cycle specified in the route
  if (route.query.plan === "annual") {
    billingCycle.value = "annual";
  }
});
</script>

<style scoped>
.pricing-page {
  background-color: var(--color-background);
  padding: 6rem 0;
  min-height: 100vh;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-heading {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
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

.section-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-light);
  max-width: 700px;
  margin: 0 auto;
}

.pricing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 3rem 0;
  font-size: 1rem;
  color: var(--color-text-light);
}

.pricing-toggle span {
  transition: color 0.3s;
}

.pricing-toggle span.active {
  color: var(--color-text);
  font-weight: 500;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background: var(--color-surface-dark);
  border-radius: 100px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-switch:hover {
  background: var(--color-surface);
}

.toggle-switch.toggled {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: var(--color-text);
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch.toggled .toggle-slider {
  transform: translateX(24px);
  background: white;
}

.discount-badge {
  display: inline-block;
  background: rgba(136, 102, 233, 0.1);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

.pricing-cards {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0 3rem;
  flex-wrap: wrap;
}

.pricing-card {
  background: var(--color-surface);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  padding: 2rem;
  width: 100%;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s;
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.pricing-card.featured {
  border-color: var(--color-primary);
  background: var(--color-surface-dark);
  box-shadow: 0 20px 40px rgba(136, 102, 233, 0.1);
  transform: scale(1.05);
}

.pricing-card.featured:hover {
  transform: scale(1.05) translateY(-5px);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 1rem;
  border-radius: 1rem;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-title {
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.price {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-text);
}

.currency {
  font-size: 1.5rem;
  vertical-align: super;
}

.period {
  font-size: 1rem;
  color: var(--color-text-light);
}

.price-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin-top: 0.5rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
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

.current-plan {
  text-align: center;
  color: var(--color-text-light);
  background: var(--color-surface-dark);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-top: auto;
}

.guarantee {
  font-size: 0.875rem;
  text-align: center;
  color: var(--color-text-light);
  margin-top: 1.5rem;
}

.pricing-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-text-light);
  text-align: center;
  font-size: 0.875rem;
}

.pricing-note i {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .pricing-cards {
    flex-direction: column;
    align-items: center;
  }

  .pricing-card.featured {
    transform: none;
  }

  .pricing-card.featured:hover {
    transform: translateY(-5px);
  }
}
</style>
