<!-- components/billing/SubscribeButton.vue -->
<template>
  <button class="subscribe-button" @click="handleSubscribe" :disabled="loading">
    {{ loading ? "Processing..." : buttonText }}
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import { useAuthStore } from "@/stores/auth"; // Import your auth store
import { useRouter } from "vue-router"; // For redirecting if not logged in

// Define prop types
type BillingCycle = "monthly" | "annual";

// Get the auth store
const authStore = useAuthStore();
const router = useRouter();

// Props with TypeScript interface
const props = defineProps<{
  billingCycle: BillingCycle;
}>();

// State
const loading = ref(false);

// Computed values
const buttonText = computed(() => {
  return props.billingCycle === "monthly"
    ? "Subscribe Monthly - $4.99"
    : "Subscribe Annually - $47.90 (Save 20%)";
});

// Methods
const handleSubscribe = async () => {
  loading.value = true;

  try {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      // User is not logged in, redirect to login
      router.push("/login?redirect=/pricing");
      return;
    }

    // Determine which price ID to use based on billing cycle
    const priceId =
      props.billingCycle === "monthly"
        ? import.meta.env.VITE_MONTHLY_PRICE_ID
        : import.meta.env.VITE_ANNUAL_PRICE_ID;

    console.log(
      "Creating checkout for",
      props.billingCycle,
      "plan with price ID:",
      priceId
    );

    // Call your Edge Function with the auth token from the store
    const response = await fetch(import.meta.env.VITE_CHECKOUT_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include the authentication token from your store
        Authorization: `Bearer ${authStore.session?.access_token}`,
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Checkout error response:", errorText);
      throw new Error("Failed to create checkout session");
    }

    const { sessionId } = await response.json();
    console.log("Got session ID:", sessionId);

    // Redirect to Stripe checkout
    const stripe = await loadStripe(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    );
    if (stripe) {
      console.log("Redirecting to checkout...");
      await stripe.redirectToCheckout({ sessionId });
    } else {
      throw new Error("Failed to load Stripe");
    }
  } catch (error) {
    console.error("Error initiating checkout:", error);
    alert("There was an error initiating checkout. Please try again later.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.subscribe-button {
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-primary-dark)
  );
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  width: 100%;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1rem;
}

.subscribe-button:hover {
  background: linear-gradient(
    90deg,
    var(--color-primary-dark),
    var(--color-primary)
  );
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(136, 102, 233, 0.3);
}

.subscribe-button:disabled {
  background: #818cf8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
