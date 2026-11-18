import { defineStore } from "pinia";
import { format } from "date-fns";
import { obsidianApiService } from "@/services/obsidian";
import {
  ConnectionError,
  FileInfo,
  FileStructureNode,
  FolderContents,
  FolderInfo,
  FolderStructureNode,
  NoteMetadata,
  ObsidianCommand,
  PatchNoteParams,
  PeriodicNoteType,
  SimpleSearchResult,
  VaultInfo,
  VaultStats,
} from "@/types/obsidian";

/**
 * Obsidian store using Pinia
 * Manages Obsidian integration state and provides interface to the API service
 */
export const useObsidianStore = defineStore("obsidian", {
  state: () => ({
    // Connection state
    connected: false,
    apiKey: null as string | null,
    apiPort: null as string | null,
    baseUrl: "https://127.0.0.1:27124",
    connectionError: null as ConnectionError | null,
    integrationSkipped: false,

    // Vault information
    vaultName: "",
    vaultPath: "",

    // Raw data lists
    fileList: [] as string[],
    folderList: [] as string[],

    // Enhanced content storage
    files: [] as FileInfo[],
    folders: [] as FolderInfo[],
    folderStructure: null as FolderStructureNode | null,
    noteContents: {} as Record<string, string>,
    noteMetadata: {} as Record<string, NoteMetadata>,
    commands: [] as ObsidianCommand[],

    // Cache control
    lastRefreshed: null as Date | null,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
  }),

  getters: {
    /**
     * Check if connected to Obsidian
     */
    isConnected: (state) => state.connected,

    /**
     * Check if there is a connection error
     */
    hasConnectionError: (state) => !!state.connectionError,

    /**
     * Check if should prompt for connection
     */
    shouldPromptForConnection: (state) =>
      !state.connected && !state.integrationSkipped,

    /**
     * Get markdown files only
     */
    markdownFiles: (state) =>
      state.files.filter((file) => file.extension === "md"),

    /**
     * Get file information by path
     */
    getFileInfo: (state) => (path: string) =>
      state.files.find((file) => file.path === path),

    /**
     * Check if a file exists
     */
    fileExists: (state) => (path: string) =>
      state.files.some((file) => file.path === path),

    /**
     * Check if a path (file or folder) exists
     */
    pathExists: (state) => (path: string) =>
      state.files.some((file) => file.path === path) ||
      state.folders.some((folder) => folder.path === path),

    /**
     * Check if note content is loaded
     */
    hasNoteContent: (state) => (path: string) => !!state.noteContents[path],

    /**
     * Get note content
     */
    getNoteContent: (state) => (path: string) => state.noteContents[path] || "",

    /**
     * Get note metadata
     */
    getNoteMetadata: (state) => (path: string) =>
      state.noteMetadata[path] || { tags: [], frontmatter: {} },

    /**
     * Get folder contents
     */
    getFolderContents:
      (state) =>
      (folderPath: string): FolderContents => {
        const normalizedPath = folderPath.endsWith("/")
          ? folderPath
          : `${folderPath}/`;

        const files = state.files.filter(
          (file) => file.folder === folderPath || file.folder === normalizedPath
        );

        const folders = state.folders.filter(
          (folder) =>
            folder.parent === folderPath || folder.parent === normalizedPath
        );

        return { files, folders };
      },

    /**
     * Get last refresh time formatted
     */
    lastRefreshedFormatted: (state) => {
      if (!state.lastRefreshed) return "Never";
      return format(state.lastRefreshed, "MMM d, yyyy HH:mm:ss");
    },

    /**
     * Check if cache is stale
     */
    isCacheStale: (state) => {
      if (!state.lastRefreshed) return true;
      const now = new Date();
      return now.getTime() - state.lastRefreshed.getTime() > state.cacheTimeout;
    },
  },

  actions: {
    /**
     * Set integration skipped flag
     */
    setIntegrationSkipped(value: boolean) {
      this.integrationSkipped = value;
    },

    /**
     * Connect to Obsidian vault
     * @param apiKey API key from Obsidian
     * @param port API port number
     */
    async connectToVault(apiKey: string, port: string) {
      // Store the API key and port in your store
      this.apiKey = apiKey;
      this.apiPort = port;

      // Dynamically build the baseURL using the user's port
      this.baseUrl = `https://127.0.0.1:${port}`;

      try {
        // Initialize the API service with the provided credentials
        obsidianApiService.initialize({
          baseUrl: this.baseUrl,
          apiKey: this.apiKey,
        });

        // Test connection
        await obsidianApiService.checkConnection();

        // If successful, mark as connected
        this.connected = true;
        this.connectionError = null;

        // No longer storing in localStorage - we're using Supabase instead

        return true;
      } catch (error: any) {
        this.connected = false;

        // Store the formatted error from the service
        if (error.code) {
          this.connectionError = error as ConnectionError;
        } else {
          this.connectionError = {
            code: "UNKNOWN_ERROR",
            message: error.message || "Unknown error connecting to Obsidian",
          };
        }

        throw this.connectionError;
      }
    },

    /**
     * Get vault information
     */
    async getVaultInfo(): Promise<VaultInfo> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        const vaultInfo = await obsidianApiService.getVaultInfo();

        this.vaultName = vaultInfo.name || "Unknown Vault";
        this.vaultPath = vaultInfo.path || "";

        return {
          name: this.vaultName,
          path: this.vaultPath,
        };
      } catch (error) {
        console.error("Failed to get vault info:", error);
        throw error;
      }
    },

    /**
     * Get vault statistics
     */
    async getVaultStats(): Promise<VaultStats> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        // Fetch the vault file structure if needed
        if (this.isCacheStale) {
          await this.fetchVaultStructure();
        }

        // Count markdown files only
        const markdownFiles = this.files.filter(
          (file) => file.extension === "md"
        );

        return {
          files: markdownFiles.length,
          folders: this.folders.length,
        };
      } catch (error) {
        console.error("Failed to get vault stats:", error);
        throw error;
      }
    },

    /**
     * Fetch file content
     * @param filePath File path
     */
    async fetchFileContent(filePath: string): Promise<string> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        // Get content as string
        const content = (await obsidianApiService.getFileContent(
          filePath
        )) as string;

        // Store the content
        this.noteContents[filePath] = content;

        // Parse metadata
        this.parseNoteMetadata(filePath, content);

        return content;
      } catch (error) {
        console.error(`Failed to fetch file content for ${filePath}:`, error);
        throw error;
      }
    },

    /**
     * Used for reconnecting on app startup
     */
    async restoreConnection(): Promise<boolean> {
      // We no longer use localStorage for storing credentials
      // Instead, we'll check if we have credentials in the store already
      if (this.apiKey && this.apiPort) {
        try {
          // If we have credentials in memory, try to connect
          await this.connectToVault(this.apiKey, this.apiPort);
          return true;
        } catch (error) {
          console.warn("Failed to restore Obsidian connection:", error);
          return false;
        }
      }

      // If no credentials in memory, we'll need to retrieve from Supabase elsewhere
      return false;
    },

    /**
     * Disconnect from vault and clear state
     */
    disconnectVault() {
      // Clear connection state
      this.connected = false;
      this.apiKey = null;
      this.apiPort = null;
      this.vaultName = "";
      this.vaultPath = "";

      // Clear cached data
      this.fileList = [];
      this.folderList = [];
      this.files = [];
      this.folders = [];
      this.folderStructure = null;
      this.noteContents = {};
      this.noteMetadata = {};
      this.commands = [];
      this.lastRefreshed = null;

      // Clear API service
      obsidianApiService.clearApiKey();
    },

    /**
     * Fetch the vault structure including files and folders
     */
    async fetchVaultStructure() {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        // Get vault structure from API
        const vaultInfo = await obsidianApiService.getVaultInfo();

        // Store raw file and folder lists
        this.fileList = vaultInfo.files || [];
        this.folderList = vaultInfo.folders || [];

        // Process files and folders into structured objects
        const folderContents = obsidianApiService.processFolderContents(
          this.fileList,
          this.folderList
        );

        this.files = folderContents.files;
        this.folders = folderContents.folders;

        // Build folder structure
        this.buildFolderStructure();

        // Update last refreshed timestamp
        this.lastRefreshed = new Date();

        return {
          files: this.files,
          folders: this.folders,
        };
      } catch (error) {
        console.error("Failed to fetch vault structure:", error);
        throw error;
      }
    },

    /**
     * Build a hierarchical folder structure for the vault
     */
    buildFolderStructure() {
      // Start with root node
      const root: FolderStructureNode = {
        name: "Root",
        path: "/",
        type: "folder",
        children: [],
      };

      // Create a map for quick folder lookup
      const folderMap = new Map<string, FolderStructureNode>();
      folderMap.set("/", root);

      // First, add all folders to the structure
      this.folders.forEach((folder) => {
        const node: FolderStructureNode = {
          name: folder.name,
          path: folder.path,
          type: "folder",
          children: [],
        };

        folderMap.set(folder.path, node);
      });

      // Connect folders to their parents
      this.folders.forEach((folder) => {
        const node = folderMap.get(folder.path);
        if (!node) return;

        const parentPath = folder.parent || "/";
        const parent = folderMap.get(parentPath);

        if (parent) {
          parent.children.push(node);
        } else {
          // If parent doesn't exist, add to root
          root.children.push(node);
        }
      });

      // Add files to their parent folders
      this.files.forEach((file) => {
        const fileNode: FileStructureNode = {
          name: file.name,
          path: file.path,
          type: "file",
        };

        const parentPath = file.folder || "/";
        const parent = folderMap.get(parentPath);

        if (parent) {
          parent.children.push(fileNode);
        } else {
          // If parent doesn't exist, add to root
          root.children.push(fileNode);
        }
      });

      // Sort children alphabetically, folders first
      const sortChildren = (node: FolderStructureNode) => {
        // Sort folders first, then files, both alphabetically
        node.children.sort((a, b) => {
          if (a.type === "folder" && b.type === "file") return -1;
          if (a.type === "file" && b.type === "folder") return 1;
          return a.name.localeCompare(b.name);
        });

        // Recursively sort children of folders
        node.children.forEach((child) => {
          if (child.type === "folder") {
            sortChildren(child as FolderStructureNode);
          }
        });
      };

      sortChildren(root);

      this.folderStructure = root;
    },

    /**
     * Fetch note content and parse metadata
     */
    async fetchNoteContent(filePath: string): Promise<string> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        // Get content as string
        const content = (await obsidianApiService.getFileContent(
          filePath
        )) as string;

        // Store the content
        this.noteContents[filePath] = content;

        // Parse metadata
        this.parseNoteMetadata(filePath, content);

        return content;
      } catch (error) {
        console.error(`Failed to fetch note content for ${filePath}:`, error);
        throw error;
      }
    },

    /**
     * Parse note metadata (frontmatter and tags)
     */
    parseNoteMetadata(filePath: string, content: string) {
      const metadata = obsidianApiService.parseNoteMetadata(content);
      this.noteMetadata[filePath] = metadata;
    },

    /**
     * Fetch note with metadata
     * @param filePath File path
     */
    async fetchNoteWithMetadata(filePath: string) {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        // Get content with metadata
        const noteJson = await obsidianApiService.getFileContent(
          filePath,
          true
        );

        if (typeof noteJson === "string") {
          // This shouldn't happen when parseMetadata is true, but handle it
          this.noteContents[filePath] = noteJson;
          this.parseNoteMetadata(filePath, noteJson);
          return {
            content: noteJson,
            metadata: this.noteMetadata[filePath],
          };
        } else {
          // Store content and metadata
          this.noteContents[filePath] = noteJson.content;
          this.noteMetadata[filePath] = {
            tags: noteJson.tags || [],
            frontmatter: noteJson.frontmatter || {},
          };

          return {
            content: noteJson.content,
            metadata: this.noteMetadata[filePath],
          };
        }
      } catch (error) {
        console.error(
          `Failed to fetch note with metadata for ${filePath}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Create or update a file in the vault
     * @param filePath File path
     * @param content File content
     */
    async createOrUpdateFile(
      filePath: string,
      content: string
    ): Promise<boolean> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        const result = await obsidianApiService.createOrUpdateFile(
          filePath,
          content
        );

        if (result) {
          // Update cached content and metadata
          this.noteContents[filePath] = content;
          this.parseNoteMetadata(filePath, content);

          // If this is a new file, refresh the vault structure
          if (!this.fileExists(filePath)) {
            await this.fetchVaultStructure();
          }
        }

        return result;
      } catch (error) {
        console.error(`Failed to create or update file ${filePath}:`, error);
        throw error;
      }
    },

    /**
     * Append content to a file
     * @param filePath File path
     * @param content Content to append
     */
    async appendToFile(filePath: string, content: string): Promise<boolean> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        const result = await obsidianApiService.appendToFile(filePath, content);

        if (result && this.hasNoteContent(filePath)) {
          // Update cached content
          const newContent = this.noteContents[filePath] + content;
          this.noteContents[filePath] = newContent;
          this.parseNoteMetadata(filePath, newContent);
        }

        return result;
      } catch (error) {
        console.error(`Failed to append to file ${filePath}:`, error);
        throw error;
      }
    },

    /**
     * Delete a file from the vault
     * @param filePath File path
     */
    async deleteFile(filePath: string): Promise<boolean> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        const result = await obsidianApiService.deleteFile(filePath);

        if (result) {
          // Remove from cache
          delete this.noteContents[filePath];
          delete this.noteMetadata[filePath];

          // Refresh vault structure
          await this.fetchVaultStructure();
        }

        return result;
      } catch (error) {
        console.error(`Failed to delete file ${filePath}:`, error);
        throw error;
      }
    },

    /**
     * Patch a note with content relative to a target
     * @param filePath File path
     * @param params Patch parameters
     */
    async patchNote(
      filePath: string,
      params: PatchNoteParams
    ): Promise<boolean> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        const result = await obsidianApiService.patchNote(filePath, params);

        if (result) {
          // Since we modified the file, fetch the new content
          await this.fetchNoteContent(filePath);
        }

        return result;
      } catch (error) {
        console.error(`Failed to patch note ${filePath}:`, error);
        throw error;
      }
    },

    /**
     * Get the active file in Obsidian
     * @param parseMetadata Whether to parse metadata
     */
    async getActiveFile(parseMetadata: boolean = false) {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        const result = await obsidianApiService.getActiveFile(parseMetadata);

        if (typeof result === "string") {
          return { content: result };
        } else {
          return {
            content: result.content,
            path: result.path,
            metadata: {
              tags: result.tags,
              frontmatter: result.frontmatter,
            },
          };
        }
      } catch (error) {
        console.error("Failed to get active file:", error);
        throw error;
      }
    },

    /**
     * Update the active file in Obsidian
     * @param content New content
     */
    async updateActiveFile(content: string): Promise<boolean> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        return await obsidianApiService.updateActiveFile(content);
      } catch (error) {
        console.error("Failed to update active file:", error);
        throw error;
      }
    },

    /**
     * Append content to the active file
     * @param content Content to append
     */
    async appendToActiveFile(content: string): Promise<boolean> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        return await obsidianApiService.appendToActiveFile(content);
      } catch (error) {
        console.error("Failed to append to active file:", error);
        throw error;
      }
    },

    /**
     * Get a list of commands
     */
    async getCommands(): Promise<ObsidianCommand[]> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        const commands = await obsidianApiService.getCommands();
        this.commands = commands;
        return commands;
      } catch (error) {
        console.error("Failed to get commands:", error);
        throw error;
      }
    },

    /**
     * Execute a command
     * @param commandId Command ID
     */
    async executeCommand(commandId: string): Promise<boolean> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        return await obsidianApiService.executeCommand(commandId);
      } catch (error) {
        console.error(`Failed to execute command ${commandId}:`, error);
        throw error;
      }
    },

    /**
     * Open a file in Obsidian
     * @param filePath File path
     * @param newLeaf Whether to open in a new leaf
     */
    async openFile(
      filePath: string,
      newLeaf: boolean = false
    ): Promise<boolean> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        return await obsidianApiService.openFile(filePath, newLeaf);
      } catch (error) {
        console.error(`Failed to open file ${filePath}:`, error);
        throw error;
      }
    },

    /**
     * Get a periodic note
     * @param period Period type
     * @param parseMetadata Whether to parse metadata
     */
    async getPeriodicNote(
      period: PeriodicNoteType,
      parseMetadata: boolean = false
    ) {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        const result = await obsidianApiService.getPeriodicNote(
          period,
          parseMetadata
        );

        if (typeof result === "string") {
          return { content: result };
        } else {
          return {
            content: result.content,
            path: result.path,
            metadata: {
              tags: result.tags,
              frontmatter: result.frontmatter,
            },
          };
        }
      } catch (error) {
        console.error(`Failed to get ${period} periodic note:`, error);
        throw error;
      }
    },

    /**
     * Perform a simple text search
     * @param query Search query
     * @param contextLength Context length
     */
    async simpleSearch(
      query: string,
      contextLength: number = 100
    ): Promise<SimpleSearchResult[]> {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        return await obsidianApiService.simpleSearch(query, contextLength);
      } catch (error) {
        console.error("Failed to perform search:", error);
        throw error;
      }
    },

    /**
     * Search with JSON Logic
     * @param query JSON Logic query
     */
    async searchWithJsonLogic(query: Record<string, any>) {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        return await obsidianApiService.searchWithJsonLogic(query);
      } catch (error) {
        console.error("Failed to perform JSON Logic search:", error);
        throw error;
      }
    },

    /**
     * Search with Dataview
     * @param query Dataview query
     */
    async searchWithDataview(query: string) {
      if (!this.connected) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        return await obsidianApiService.searchWithDataview(query);
      } catch (error) {
        console.error("Failed to perform Dataview search:", error);
        throw error;
      }
    },
  },
});
