// services/features.ts
import { Feature, PlanId } from "../supabase/types";

// Feature definitions - single source of truth
export const FEATURES: Record<string, Feature> = {
  BASIC_MODULES: {
    id: "basic-modules",
    name: "Basic Template Modules",
    description: "Create simple templates with basic modules",
    availableInPlans: ["free", "pro"],
  },
  MARKDOWN_EXPORT: {
    id: "markdown-export",
    name: "Markdown Export",
    description: "Export templates to markdown format",
    availableInPlans: ["free", "pro"],
  },
  OBSIDIAN_INTEGRATION: {
    id: "obsidian-integration",
    name: "Obsidian Integration",
    description: "Directly integrate with your Obsidian vault",
    availableInPlans: ["pro"],
  },
  PREBUILT_TEMPLATES: {
    id: "prebuilt-templates",
    name: "Prebuilt Templates",
    description: "Access pre-built templates from the Kuro currated library",
    availableInPlans: ["pro"],
  },
  ADVANCED_MODULES: {
    id: "advanced-modules",
    name: "Advanced Template Modules",
    description: "Access to advanced template building modules",
    availableInPlans: ["pro"],
  },
};

// Helper functions to work with features
export const featuresService = {
  /**
   * Get a feature by its ID
   */
  getFeature(featureId: string): Feature | undefined {
    return Object.values(FEATURES).find((f) => f.id === featureId);
  },

  /**
   * Check if a feature is available in a given plan
   */
  isFeatureInPlan(featureId: string, planId: PlanId): boolean {
    const feature = this.getFeature(featureId);
    if (!feature) return false;
    return feature.availableInPlans.includes(planId);
  },

  /**
   * Get all features available for a specific plan
   */
  getPlanFeatures(planId: PlanId): Feature[] {
    return Object.values(FEATURES).filter((feature) =>
      feature.availableInPlans.includes(planId)
    );
  },

  /**
   * Get all features that would be newly available by upgrading
   */
  getUpgradeFeatures(currentPlanId: PlanId, targetPlanId: PlanId): Feature[] {
    if (currentPlanId === targetPlanId) return [];

    return Object.values(FEATURES).filter(
      (feature) =>
        !feature.availableInPlans.includes(currentPlanId) &&
        feature.availableInPlans.includes(targetPlanId)
    );
  },
};

export default featuresService;
