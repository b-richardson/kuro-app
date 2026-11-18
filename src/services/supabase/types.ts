// src/services/supabase/types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          created_at: string | null;
          last_modified: string | null;
          is_public: boolean | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          description?: string | null;
          created_at?: string | null;
          last_modified?: string | null;
          is_public?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          description?: string | null;
          created_at?: string | null;
          last_modified?: string | null;
          is_public?: boolean | null;
        };
      };
      template_modules: {
        Row: {
          id: string;
          template_id: string | null;
          type: string;
          plugin_type: string | null;
          content: Json;
          metadata: Json | null;
          order: number;
          created_at: string | null;
          last_modified: string | null;
        };
        Insert: {
          id?: string;
          template_id?: string | null;
          type: string;
          plugin_type?: string | null;
          content: Json;
          metadata?: Json | null;
          order: number;
          created_at?: string | null;
          last_modified?: string | null;
        };
        Update: {
          id?: string;
          template_id?: string | null;
          type?: string;
          plugin_type?: string | null;
          content?: Json;
          metadata?: Json | null;
          order?: number;
          created_at?: string | null;
          last_modified?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Subscription Related Types
export type BillingCycle = "monthly" | "annual";

// Plan identifier type
export type PlanId = "free" | "pro";

// Feature definition interface
export interface Feature {
  id: string;
  name: string;
  description?: string;
  availableInPlans: PlanId[];
}

// Plan interface
export interface Plan {
  id: PlanId;
  name: string;
  features: string[];
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
}

// Interface for user_profiles table
export interface UserProfile {
  id: string;
  name: string | null;
  created_at: string | null;
  last_login: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  subscription_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_period_start: string | null;
  subscription_period_end: string | null;
  stripe_payment_method_id: string | null;
}

// Interface for user_settings table
export interface UserSettings {
  id: string;
  created_at: string; // ISO timestamp
  updated_at: string | null;
  user_id: string | null;
  encrypted_obsidian_api_key: string | null;
  encrypted_obsidian_port: string | null;
}
