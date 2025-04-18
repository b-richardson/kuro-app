// src/services/stripeService.ts
import { loadStripe } from "@stripe/stripe-js";

// Your publishable key from the Stripe Dashboard
const STRIPE_PUBLISHABLE_KEY = "pk_test_your_publishable_key";
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Function to redirect to Stripe Checkout
export const redirectToCheckout = async (priceId: string) => {
  try {
    const stripe = await getStripe();

    // Call your backend function that creates a Checkout Session
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      console.error(result.error.message);
    }
  } catch (error) {
    console.error("Error redirecting to checkout:", error);
  }
};
