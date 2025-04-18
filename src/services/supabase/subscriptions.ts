// services/supabase/subscriptions.ts
import { loadStripe } from "@stripe/stripe-js";
import { BillingCycle, Plan, PlanId } from "./types";
import { featuresService } from "@/services/features/features";

// Plan definitions
export const plans: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    features: [
      "Basic template modules",
      "Unlimited template creation",
      "Markdown export",
      "Community support",
    ],
    monthlyPrice: 0,
    annualPrice: 0,
  },
  pro: {
    id: "pro",
    name: "Pro",
    features: [
      "Everything in Free plan",
      "All template modules including Templater & Dataview",
      "Direct Obsidian vault integration",
      "True-to-Obsidian preview",
      "Template library access",
      "Template sharing & importing",
      "Faster updates & new modules",
      "Priority support",
    ],
    monthlyPrice: 4.99,
    annualPrice: 47.9,
    popular: true,
  },
};

// Subscription service
export const subscriptionService = {
  // Plan-related methods
  getAllPlans(): Plan[] {
    return Object.values(plans);
  },

  getPlan(planId: PlanId): Plan | undefined {
    return plans[planId];
  },

  getPlanPrice(planId: PlanId, billingCycle: BillingCycle): number {
    const plan = this.getPlan(planId);
    if (!plan) return 0;

    return billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  },

  getAnnualSavingsPercentage(planId: PlanId): number {
    const plan = this.getPlan(planId);
    if (!plan || plan.monthlyPrice === 0) return 0;

    const monthlyCostForYear = plan.monthlyPrice * 12;
    const savings = monthlyCostForYear - plan.annualPrice;
    return Math.round((savings / monthlyCostForYear) * 100);
  },

  // Feature access checking
  canAccessFeature(planId: PlanId, featureId: string): boolean {
    return featuresService.isFeatureInPlan(featureId, planId);
  },

  // Subscription-related methods
  async createCheckoutSession(
    accessToken: string,
    billingCycle: BillingCycle
  ): Promise<string> {
    // Determine which price ID to use based on billing cycle
    const priceId =
      billingCycle === "monthly"
        ? import.meta.env.VITE_MONTHLY_PRICE_ID
        : import.meta.env.VITE_ANNUAL_PRICE_ID;

    const response = await fetch(import.meta.env.VITE_CHECKOUT_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Checkout error response:", errorText);
      throw new Error("Failed to create checkout session");
    }

    const { sessionId } = await response.json();
    return sessionId;
  },

  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await loadStripe(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    );

    if (!stripe) {
      throw new Error("Failed to load Stripe");
    }

    await stripe.redirectToCheckout({ sessionId });
  },

  async initiateSubscription(
    accessToken: string,
    billingCycle: BillingCycle
  ): Promise<void> {
    const sessionId = await this.createCheckoutSession(
      accessToken,
      billingCycle
    );
    await this.redirectToCheckout(sessionId);
  },
};

export default subscriptionService;
