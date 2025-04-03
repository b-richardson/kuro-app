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
      template_tags: {
        Row: {
          template_id: string;
          tag: string;
        };
        Insert: {
          template_id: string;
          tag: string;
        };
        Update: {
          template_id?: string;
          tag?: string;
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
