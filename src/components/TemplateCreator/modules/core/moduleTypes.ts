/**
 * Type definitions for the module system
 */

export type ModuleType =
  | "text"
  | "header"
  | "checklist"
  | "table"
  | "divider"
  | "codeBlock"
  // Templater plugin modules
  | "templaterField"
  | "templaterDateAndTime"
  | "templaterUserInput"
  | "templaterFileProperty"
  | "templaterConditionalContent"
  | "templaterValueTransformation"
  | "templaterTemplateVariables"
  // Dataview plugin modules
  | "dataviewQuery"
  | "dataviewListQuery"
  | "dataviewTableQuery"
  | "dataviewTaskQuery"
  | "dataviewCalendarQuery"
  | "dataviewInlineFields";

export type PluginType = "templater" | "dataview" | null;

export interface ModuleMetadata {
  level?: number;
  columns?: number;
  delimiter?: string;
  [key: string]: any;
}

export interface TemplateModule {
  id: string;
  type: ModuleType;
  content: string[];
  pluginType: PluginType;
  metadata?: ModuleMetadata;
}

export interface ModuleComponentProps {
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}

export interface ModuleComponentEmits {
  (e: "update:content", content: string[]): void;
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete"): void;
  (e: "select"): void;
  (e: "duplicate"): void;
  (e: "module-change"): void;
}

// Toast related types
export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  type?: ToastType;
  timeout?: number;
  action?: ToastAction;
}

export interface ToastAction {
  text: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timeout: number;
  action?: ToastAction;
}
