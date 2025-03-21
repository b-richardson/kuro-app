/**
 * Available view modes for the markdown preview
 */
export type ViewMode = 'Rendered' | 'Markdown' | 'Source';

/**
 * Available export profiles for templates
 */
export type ExportProfile = 'plain' | 'templater' | 'dataview' | 'full';

/**
 * Configuration for an export profile
 */
export interface ExportProfileConfig {
  id: ExportProfile;
  name: string;
  icon: string;
  description?: string;
}

/**
 * Available export profiles with their configurations
 */
export const EXPORT_PROFILES: ExportProfileConfig[] = [
  { 
    id: 'plain', 
    name: 'Plain Markdown', 
    icon: 'fas fa-file-alt', 
    description: 'Converts all plugin-specific syntax to plain markdown. Works without any plugins.' 
  },
  { 
    id: 'templater', 
    name: 'Templater-Ready', 
    icon: 'fas fa-bolt', 
    description: 'Maintains Templater fields but converts other plugin syntax to plain markdown.' 
  },
  { 
    id: 'dataview', 
    name: 'Dataview-Compatible', 
    icon: 'fas fa-database', 
    description: 'Preserves Dataview queries but converts other plugin syntax to plain markdown.' 
  },
  { 
    id: 'full', 
    name: 'Full Plugin Suite', 
    icon: 'fas fa-plug', 
    description: 'Keeps all plugin-specific syntax (Templater, Dataview, Kanban) intact.' 
  }
];

/**
 * Get the default export profile
 */
export function getDefaultExportProfile(): ExportProfile {
  return 'full';
}

/**
 * Get an export profile config by ID
 */
export function getExportProfileById(profileId: ExportProfile): ExportProfileConfig | undefined {
  return EXPORT_PROFILES.find(profile => profile.id === profileId);
}

/**
 * Get the name of an export profile by ID
 */
export function getExportProfileName(profileId: ExportProfile): string {
  const profile = getExportProfileById(profileId);
  return profile ? profile.name : 'Unknown Profile';
}