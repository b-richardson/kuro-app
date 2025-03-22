/**
 * Obsidian API Service
 * 
 * Provides a unified interface for interacting with the Obsidian Local REST API plugin.
 * Handles all direct API calls, connection management, and error handling.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleCertificateError } from '@/utils/certificateHelper';
import {
  ApiConfig,
  ApiStatusResponse,
  CommandsResponse,
  ConnectionError,
  FolderContents,
  NoteJson,
  NoteMetadata,
  ObsidianCommand,
  PatchNoteParams,
  PeriodicNoteType,
  SearchResultItem,
  SimpleSearchResult,
  VaultInfo
} from '@/types/obsidian';

/**
 * Service for interacting with the Obsidian Local REST API
 */
export class ObsidianApiService {
  private api: AxiosInstance | null = null;
  private apiKey: string | null = null;
  private baseUrl: string = 'https://127.0.0.1:27124';

  /**
   * Initialize the API service with the given configuration
   * @param config - Optional API configuration
   */
  constructor(config?: Partial<ApiConfig>) {
    if (config) {
      this.initialize(config);
    }
  }

  /**
   * Initialize the API service with the given configuration
   * @param config - API configuration options
   */
  public initialize(config: Partial<ApiConfig>): void {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
    
    if (config.apiKey) {
      this.setApiKey(config.apiKey);
    }
  }

  /**
   * Set the API key for authentication
   * @param apiKey - The API key to use for authentication
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    
    // Create or update the axios instance with the new API key
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 30000, // Default timeout: 30 seconds
    });
  }

  /**
   * Clear the API key and reset the client
   */
  public clearApiKey(): void {
    this.apiKey = null;
    this.api = null;
  }

  /**
   * Check if the service is initialized with an API key
   * @returns True if the service has an API key, false otherwise
   */
  public isInitialized(): boolean {
    return !!this.api && !!this.apiKey;
  }

  /**
   * Check if the connection to Obsidian is valid
   * @returns True if connected, throws an error if not
   */
  public async checkConnection(): Promise<boolean> {
    try {
      const response = await this.get<ApiStatusResponse>('/');
      return response.data.authenticated === true;
    } catch (error) {
      const formattedError = this.handleApiError(error, 'Failed to connect to Obsidian');
      throw formattedError;
    }
  }

  /**
   * Get basic information about the vault
   * @returns Vault information
   */
  public async getVaultInfo(): Promise<VaultInfo> {
    try {
      const response = await this.get<VaultInfo>('/vault/');
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to get vault info');
    }
  }

  /**
   * Get the list of files and folders in the vault
   * @param path - Optional path within the vault to list (defaults to root)
   * @returns List of files and folders
   */
  public async listFiles(path: string = ''): Promise<VaultInfo> {
    try {
      // Construct the correct path, ensuring it ends with a slash for directories
      let requestPath = '/vault/';
      if (path) {
        const normalizedPath = path.endsWith('/') ? path : `${path}/`;
        requestPath = `/vault/${encodeURIComponent(normalizedPath)}`;
      }
      
      const response = await this.get<VaultInfo>(requestPath);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, `Failed to list files at path: ${path}`);
    }
  }

  /**
   * Get the content of a specific file
   * @param filePath - Path to the file within the vault
   * @param parseMetadata - Whether to return parsed metadata (as JSON)
   * @returns File content as string or JSON object with metadata
   */
  public async getFileContent(filePath: string, parseMetadata: boolean = false): Promise<string | NoteJson> {
    try {
      const config: AxiosRequestConfig = {};
      
      // If parseMetadata is true, request the JSON representation
      if (parseMetadata) {
        config.headers = {
          Accept: 'application/vnd.olrapi.note+json'
        };
      }
      
      const response = await this.get<string | NoteJson>(
        `/vault/${encodeURIComponent(filePath)}`,
        config
      );
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, `Failed to get file content for: ${filePath}`);
    }
  }

  /**
   * Create or update a file in the vault
   * @param filePath - Path to the file within the vault
   * @param content - Content to write to the file
   * @returns True if successful
   */
  public async createOrUpdateFile(filePath: string, content: string): Promise<boolean> {
    try {
      await this.put(
        `/vault/${encodeURIComponent(filePath)}`,
        content,
        {
          headers: {
            'Content-Type': 'text/markdown'
          }
        }
      );
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to create or update file: ${filePath}`);
    }
  }

  /**
   * Append content to an existing file
   * @param filePath - Path to the file within the vault
   * @param content - Content to append to the file
   * @returns True if successful
   */
  public async appendToFile(filePath: string, content: string): Promise<boolean> {
    try {
      await this.post(
        `/vault/${encodeURIComponent(filePath)}`,
        content,
        {
          headers: {
            'Content-Type': 'text/markdown'
          }
        }
      );
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to append to file: ${filePath}`);
    }
  }

  /**
   * Delete a file from the vault
   * @param filePath - Path to the file within the vault
   * @returns True if successful
   */
  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      await this.delete(`/vault/${encodeURIComponent(filePath)}`);
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to delete file: ${filePath}`);
    }
  }

  /**
   * Patch a note with content relative to a heading, block, or frontmatter
   * @param filePath - Path to the file within the vault
   * @param params - Parameters for the patch operation
   * @returns True if successful
   */
  public async patchNote(filePath: string, params: PatchNoteParams): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        'Operation': params.operation,
        'Target-Type': params.targetType,
        'Target': params.target,
        'Content-Type': params.contentType || 'text/markdown'
      };
      
      if (params.targetDelimiter) {
        headers['Target-Delimiter'] = params.targetDelimiter;
      }
      
      if (params.trimTargetWhitespace !== undefined) {
        headers['Trim-Target-Whitespace'] = params.trimTargetWhitespace ? 'true' : 'false';
      }
      
      await this.patch(
        `/vault/${encodeURIComponent(filePath)}`,
        params.content,
        { headers }
      );
      
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to patch note: ${filePath}`);
    }
  }

  /**
   * Get the content of the currently active file in Obsidian
   * @param parseMetadata - Whether to return parsed metadata (as JSON)
   * @returns File content as string or JSON object with metadata
   */
  public async getActiveFile(parseMetadata: boolean = false): Promise<string | NoteJson> {
    try {
      const config: AxiosRequestConfig = {};
      
      if (parseMetadata) {
        config.headers = {
          Accept: 'application/vnd.olrapi.note+json'
        };
      }
      
      const response = await this.get<string | NoteJson>('/active/', config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to get active file');
    }
  }

  /**
   * Update the content of the active file in Obsidian
   * @param content - New content for the active file
   * @returns True if successful
   */
  public async updateActiveFile(content: string): Promise<boolean> {
    try {
      await this.put(
        '/active/',
        content,
        {
          headers: {
            'Content-Type': 'text/markdown'
          }
        }
      );
      return true;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to update active file');
    }
  }

  /**
   * Append content to the active file in Obsidian
   * @param content - Content to append to the active file
   * @returns True if successful
   */
  public async appendToActiveFile(content: string): Promise<boolean> {
    try {
      await this.post(
        '/active/',
        content,
        {
          headers: {
            'Content-Type': 'text/markdown'
          }
        }
      );
      return true;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to append to active file');
    }
  }

  /**
   * Delete the currently active file in Obsidian
   * @returns True if successful
   */
  public async deleteActiveFile(): Promise<boolean> {
    try {
      await this.delete('/active/');
      return true;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to delete active file');
    }
  }

  /**
   * Get a list of all available commands in Obsidian
   * @returns List of available commands
   */
  public async getCommands(): Promise<ObsidianCommand[]> {
    try {
      const response = await this.get<CommandsResponse>('/commands/');
      return response.data.commands;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to get commands');
    }
  }

  /**
   * Execute a command in Obsidian
   * @param commandId - ID of the command to execute
   * @returns True if successful
   */
  public async executeCommand(commandId: string): Promise<boolean> {
    try {
      await this.post(`/commands/${encodeURIComponent(commandId)}/`, '');
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to execute command: ${commandId}`);
    }
  }

  /**
   * Open a file in Obsidian
   * @param filePath - Path to the file to open
   * @param newLeaf - Whether to open the file in a new leaf
   * @returns True if successful
   */
  public async openFile(filePath: string, newLeaf: boolean = false): Promise<boolean> {
    try {
      const url = `/open/${encodeURIComponent(filePath)}`;
      const params = newLeaf ? { newLeaf: 'true' } : undefined;
      
      await this.post(url, '', { params });
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to open file: ${filePath}`);
    }
  }

  /**
   * Get a periodic note
   * @param period - Type of periodic note
   * @param parseMetadata - Whether to return parsed metadata (as JSON)
   * @returns Periodic note content as string or JSON object with metadata
   */
  public async getPeriodicNote(period: PeriodicNoteType, parseMetadata: boolean = false): Promise<string | NoteJson> {
    try {
      const config: AxiosRequestConfig = {};
      
      if (parseMetadata) {
        config.headers = {
          Accept: 'application/vnd.olrapi.note+json'
        };
      }
      
      const response = await this.get<string | NoteJson>(`/periodic/${period}/`, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, `Failed to get ${period} periodic note`);
    }
  }

  /**
   * Update a periodic note
   * @param period - Type of periodic note
   * @param content - New content for the periodic note
   * @returns True if successful
   */
  public async updatePeriodicNote(period: PeriodicNoteType, content: string): Promise<boolean> {
    try {
      await this.put(
        `/periodic/${period}/`,
        content,
        {
          headers: {
            'Content-Type': 'text/markdown'
          }
        }
      );
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to update ${period} periodic note`);
    }
  }

  /**
   * Append content to a periodic note
   * @param period - Type of periodic note
   * @param content - Content to append to the periodic note
   * @returns True if successful
   */
  public async appendToPeriodicNote(period: PeriodicNoteType, content: string): Promise<boolean> {
    try {
      await this.post(
        `/periodic/${period}/`,
        content,
        {
          headers: {
            'Content-Type': 'text/markdown'
          }
        }
      );
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to append to ${period} periodic note`);
    }
  }

  /**
   * Delete a periodic note
   * @param period - Type of periodic note
   * @returns True if successful
   */
  public async deletePeriodicNote(period: PeriodicNoteType): Promise<boolean> {
    try {
      await this.delete(`/periodic/${period}/`);
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to delete ${period} periodic note`);
    }
  }

  /**
   * Perform a simple text search across the vault
   * @param query - Search query string
   * @param contextLength - Length of context to return around matches
   * @returns Search results
   */
  public async simpleSearch(query: string, contextLength: number = 100): Promise<SimpleSearchResult[]> {
    try {
      const response = await this.post<SimpleSearchResult[]>(
        `/search/simple/`,
        '',
        {
          params: {
            query,
            contextLength
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to perform search');
    }
  }

  /**
   * Perform an advanced search using JSON Logic
   * @param query - JSON Logic query object
   * @returns Search results
   */
  public async searchWithJsonLogic(query: Record<string, any>): Promise<SearchResultItem[]> {
    try {
      const response = await this.post<SearchResultItem[]>(
        '/search/',
        JSON.stringify(query),
        {
          headers: {
            'Content-Type': 'application/vnd.olrapi.jsonlogic+json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to perform JSON Logic search');
    }
  }

  /**
   * Perform a search using Dataview DQL
   * @param query - Dataview DQL query string
   * @returns Search results
   */
  public async searchWithDataview(query: string): Promise<SearchResultItem[]> {
    try {
      const response = await this.post<SearchResultItem[]>(
        '/search/',
        query,
        {
          headers: {
            'Content-Type': 'application/vnd.olrapi.dataview.dql+txt'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to perform Dataview search');
    }
  }

  /**
   * Parse note metadata from the content
   * @param content - Note content as string
   * @returns Parsed metadata
   */
  public parseNoteMetadata(content: string): NoteMetadata {
    const metadata: NoteMetadata = {
      tags: [],
      frontmatter: {}
    };
    
    // Extract YAML frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (frontmatterMatch) {
      const frontmatterText = frontmatterMatch[1];
      
      try {
        // Simple YAML parsing for common frontmatter fields
        const lines = frontmatterText.split('\n');
        lines.forEach(line => {
          // Skip empty lines or comments
          if (!line.trim() || line.trim().startsWith('#')) return;
          
          // Split by first colon
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            // Handle different value types
            if (value === '') {
              metadata.frontmatter![key] = null;
            } else if (value === 'true') {
              metadata.frontmatter![key] = true;
            } else if (value === 'false') {
              metadata.frontmatter![key] = false;
            } else if (/^-?\d+$/.test(value)) {
              metadata.frontmatter![key] = parseInt(value, 10);
            } else if (/^-?\d+\.\d+$/.test(value)) {
              metadata.frontmatter![key] = parseFloat(value);
            } else if (value.startsWith('[') && value.endsWith(']')) {
              // Simple array parsing
              try {
                const arrayItems = value.substring(1, value.length - 1).split(',')
                  .map(item => item.trim())
                  .filter(item => item.length > 0);
                metadata.frontmatter![key] = arrayItems;
              } catch (e) {
                metadata.frontmatter![key] = value;
              }
            } else {
              // String value (remove quotes if present)
              if ((value.startsWith('"') && value.endsWith('"')) || 
                  (value.startsWith("'") && value.endsWith("'"))) {
                metadata.frontmatter![key] = value.substring(1, value.length - 1);
              } else {
                metadata.frontmatter![key] = value;
              }
            }
          }
        });
      } catch (e) {
        console.error('Error parsing frontmatter:', e);
      }
    }
    
    // Extract inline tags (#tag format)
    const tagRegex = /(?:^|\s)#([a-zA-Z0-9_/-]+)/g;
    let match;
    
    while ((match = tagRegex.exec(content)) !== null) {
      const tag = match[1];
      if (!metadata.tags!.includes(tag)) {
        metadata.tags!.push(tag);
      }
    }
    
    // Handle frontmatter tags
    if (metadata.frontmatter!.tags) {
      let frontmatterTags: string[] = [];
      
      if (typeof metadata.frontmatter!.tags === 'string') {
        // Single tag as string
        frontmatterTags = [metadata.frontmatter!.tags];
      } else if (Array.isArray(metadata.frontmatter!.tags)) {
        // Array of tags
        frontmatterTags = metadata.frontmatter!.tags;
      }
      
      // Add to the tags list without duplicates
      frontmatterTags.forEach(tag => {
        if (!metadata.tags!.includes(tag)) {
          metadata.tags!.push(tag);
        }
      });
    }
    
    return metadata;
  }

  /**
   * Process file and folder lists into structured objects
   * @param files - List of file paths
   * @param folders - List of folder paths
   * @returns Structured file and folder objects
   */
  public processFolderContents(files: string[], folders: string[]): FolderContents {
    // Process files into detailed objects
    const processedFiles = files.map(path => {
      const segments = path.split('/');
      const name = segments.pop() || '';
      const folder = segments.join('/');
      const extensionMatch = name.match(/\.([^.]+)$/);
      const extension = extensionMatch ? extensionMatch[1] : '';
      
      return {
        name,
        path,
        folder,
        extension
      };
    });
    
    // Process folders into detailed objects
    const processedFolders = folders.map(path => {
      const segments = path.split('/');
      const name = segments.pop() || '';
      const parent = segments.join('/');
      
      return {
        name,
        path,
        parent
      };
    });
    
    return {
      files: processedFiles,
      folders: processedFolders
    };
  }

  // Private helper methods for HTTP requests
  private async get<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    this.ensureInitialized();
    return this.api!.get<T>(url, config);
  }

  private async post<T>(
    url: string, 
    data: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    this.ensureInitialized();
    return this.api!.post<T>(url, data, config);
  }

  private async put<T>(
    url: string, 
    data: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    this.ensureInitialized();
    return this.api!.put<T>(url, data, config);
  }

  private async patch<T>(
    url: string, 
    data: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    this.ensureInitialized();
    return this.api!.patch<T>(url, data, config);
  }

  private async delete<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    this.ensureInitialized();
    return this.api!.delete<T>(url, config);
  }

  /**
   * Ensure the API client is initialized
   * @throws Error if not initialized
   */
  private ensureInitialized(): void {
    if (!this.api || !this.apiKey) {
      throw new Error('Obsidian API client not initialized. Please set an API key first.');
    }
  }

  /**
   * Handle API errors and format them consistently
   * @param error - The error from the API call
   * @param message - A human-readable message
   * @returns Formatted connection error
   */
  private handleApiError(error: any, message: string): ConnectionError {
    console.error(message, error);
    
    // Check for certificate errors first
    const certError = handleCertificateError(error);
    if ('code' in certError && certError.code === 'CERT_ERROR') {
      return certError as ConnectionError;
    }
    
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return {
        code: 'CONNECTION_ERROR',
        message: 'Could not connect to Obsidian. Is the plugin enabled and Obsidian running?',
        originalError: error
      };
    } else if (error.response && error.response.status === 401) {
      return {
        code: 'AUTH_ERROR',
        message: 'Invalid API key',
        originalError: error
      };
    } else if (error.response && error.response.status === 404) {
      return {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
        originalError: error
      };
    } else if (error.response && error.response.data && error.response.data.message) {
      return {
        code: 'API_ERROR',
        message: error.response.data.message,
        originalError: error
      };
    }
    
    // Default error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || message,
      originalError: error
    };
  }
}

// Export a singleton instance for easy import
export const obsidianApiService = new ObsidianApiService();