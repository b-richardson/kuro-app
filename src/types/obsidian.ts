/**
 * Type definitions for Obsidian REST API integration
 * Based on the Local REST API plugin specification
 */

/**
 * Error response from the Obsidian API
 */
export interface ObsidianApiError {
  errorCode: number;
  message: string;
}

/**
 * Error information used for handling connection issues
 */
export interface ConnectionError {
  code: string;
  message: string;
  originalError?: Error;
}

/**
 * API server status response
 */
export interface ApiStatusResponse {
  authenticated: boolean;
  ok: string;
  service: string;
  versions: {
    obsidian: string;
    self: string;
  };
}

/**
 * Basic vault information
 */
export interface VaultInfo {
  name: string;
  path: string;
  files?: string[];
  folders?: string[];
}

/**
 * Basic vault statistics
 */
export interface VaultStats {
  files: number;
  folders: number;
}

/**
 * File information structure
 */
export interface FileInfo {
  name: string;
  path: string;
  folder: string;
  extension: string;
  mtime?: number;
  ctime?: number;
  size?: number;
}

/**
 * Folder information structure
 */
export interface FolderInfo {
  name: string;
  path: string;
  parent: string;
}

/**
 * Folder contents structure
 */
export interface FolderContents {
  files: FileInfo[];
  folders: FolderInfo[];
}

/**
 * Note file statistics
 */
export interface NoteStat {
  ctime: number;
  mtime: number;
  size: number;
}

/**
 * Note metadata structure
 */
export interface NoteMetadata {
  tags?: string[];
  frontmatter?: Record<string, any>;
}

/**
 * JSON representation of a note from API
 */
export interface NoteJson {
  content: string;
  frontmatter: Record<string, any>;
  path: string;
  stat: NoteStat;
  tags: string[];
}

/**
 * Folder structure node representing a folder
 */
export interface FolderStructureNode {
  name: string;
  path: string;
  type: 'folder';
  children: (FolderStructureNode | FileStructureNode)[];
}

/**
 * Folder structure node representing a file
 */
export interface FileStructureNode {
  name: string;
  path: string;
  type: 'file';
}

/**
 * Command information structure
 */
export interface ObsidianCommand {
  id: string;
  name: string;
}

/**
 * Commands response from API
 */
export interface CommandsResponse {
  commands: ObsidianCommand[];
}

/**
 * Search result item
 */
export interface SearchResultItem {
  filename: string;
  result: any;
}

/**
 * Simple search match information
 */
export interface SearchMatch {
  start: number;
  end: number;
}

/**
 * Simple search match result
 */
export interface SearchMatchResult {
  match: SearchMatch;
  context: string;
}

/**
 * Simple search result with matches
 */
export interface SimpleSearchResult {
  filename: string;
  matches: SearchMatchResult[];
  score: number;
}

/**
 * Parameters for patching a note
 */
export interface PatchNoteParams {
  operation: 'append' | 'prepend' | 'replace';
  targetType: 'heading' | 'block' | 'frontmatter';
  target: string;
  content: string;
  targetDelimiter?: string;
  trimTargetWhitespace?: boolean;
  contentType?: 'text/markdown' | 'application/json';
}

/**
 * Type of periodic note
 */
export type PeriodicNoteType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Configuration for API connection
 */
export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

/**
 * Available API endpoints
 */
export enum ApiEndpoint {
  Status = '/',
  Vault = '/vault/',
  VaultFile = '/vault/:path',
  VaultDirectory = '/vault/:path/',
  Active = '/active/',
  Commands = '/commands/',
  Command = '/commands/:commandId/',
  Open = '/open/:filename',
  PeriodicNote = '/periodic/:period/',
  Search = '/search/',
  SimpleSearch = '/search/simple/'
}