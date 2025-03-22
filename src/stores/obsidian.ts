import { defineStore } from "pinia";
import axios, { AxiosInstance } from "axios";
import { format } from 'date-fns';

interface ConnectionError {
  code: string;
  message: string;
}

interface VaultInfo {
  name: string;
  path: string;
}

interface VaultStats {
  files: number;
  folders: number;
}

interface FileInfo {
  name: string;
  path: string;
  folder: string;
  extension: string;
  mtime?: number;
  ctime?: number;
  size?: number;
}

interface FolderInfo {
  name: string;
  path: string;
  parent: string;
}

interface FolderContents {
  files: FileInfo[];
  folders: FolderInfo[];
}

interface FolderStructureNode {
  name: string;
  path: string;
  type: 'folder';
  children: (FolderStructureNode | FileStructureNode)[];
}

interface FileStructureNode {
  name: string;
  path: string;
  type: 'file';
}

interface NoteMetadata {
  tags?: string[];
  frontmatter?: Record<string, any>;
}

export const useObsidianStore = defineStore("obsidian", {
  state: () => ({
    connected: false,
    apiKey: null as string | null,
    apiPort: null as string | null,
    baseUrl: "https://127.0.0.1:27124",
    vaultName: "",
    vaultPath: "",
    fileList: [] as string[],
    folderList: [] as string[],
    connectionError: null as ConnectionError | null,
    integrationSkipped: false,
    api: null as AxiosInstance | null,
    
    // Enhanced content storage
    files: [] as FileInfo[],
    folders: [] as FolderInfo[],
    folderStructure: null as FolderStructureNode | null,
    noteContents: {} as Record<string, string>,
    noteMetadata: {} as Record<string, NoteMetadata>,
    lastRefreshed: null as Date | null,
  }),

  getters: {
    isConnected: (state) => state.connected,
    hasConnectionError: (state) => !!state.connectionError,
    shouldPromptForConnection: (state) =>
      !state.connected && !state.integrationSkipped,
    
    // Get markdown files only
    markdownFiles: (state) => 
      state.files.filter(file => file.extension === 'md'),
    
    // Get file information by path
    getFileInfo: (state) => (path: string) => 
      state.files.find(file => file.path === path),
    
    // Check if a file exists
    fileExists: (state) => (path: string) => 
      state.files.some(file => file.path === path),
    
    // Check if a path (file or folder) exists
    pathExists: (state) => (path: string) => 
      state.files.some(file => file.path === path) || 
      state.folders.some(folder => folder.path === path),
    
    // Check if note content is loaded
    hasNoteContent: (state) => (path: string) => 
      !!state.noteContents[path],
    
    // Get note content
    getNoteContent: (state) => (path: string) => 
      state.noteContents[path] || '',
    
    // Get note metadata
    getNoteMetadata: (state) => (path: string) => 
      state.noteMetadata[path] || { tags: [], frontmatter: {} },
    
    // Get folder contents
    getFolderContents: (state) => (folderPath: string): FolderContents => {
      const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
      
      const files = state.files.filter(file => 
        file.folder === folderPath || file.folder === normalizedPath
      );
      
      const folders = state.folders.filter(folder => 
        folder.parent === folderPath || folder.parent === normalizedPath
      );
      
      return { files, folders };
    },
    
    // Get last refresh time formatted
    lastRefreshedFormatted: (state) => {
      if (!state.lastRefreshed) return 'Never';
      return format(state.lastRefreshed, 'MMM d, yyyy HH:mm:ss');
    }
  },

  actions: {
    setIntegrationSkipped(value: boolean) {
      this.integrationSkipped = value;
    },

    async connectToVault(apiKey: string, port: string) {
      // Store the API key and port in your store (if you wish)
      this.apiKey = apiKey;
      this.apiPort = port; // e.g., declare this.apiPort in your store

      // Dynamically build the baseURL using the user’s port
      const baseUrl = `https://127.0.0.1:${port}`;

      try {
        // Create Axios instance with the provided API key and port
        const api = axios.create({
          baseURL: baseUrl,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        });

        // Test connection — e.g., the Local REST API plugin typically
        // responds at /vault or a similar endpoint. Adjust as needed.
        // If your plugin uses "/" or some other route, change accordingly.
        const response = await api.get("/vault/");

        // If the response is successful, mark connected
        if (response.status === 200) {
          this.connected = true;
          this.connectionError = null;

          // Keep the API instance for future requests
          this.api = api;

          // Cache both the API key and port (if desired)
          localStorage.setItem("obsidian_api_key", this.apiKey);
          localStorage.setItem("obsidian_api_port", port);

          return true;
        }
        return false;
      } catch (error: any) {
        this.connected = false;

        // Categorize errors for user feedback
        if (error.code === "CERT_NOT_TRUSTED") {
          this.connectionError = {
            code: "CERT_ERROR",
            message: error.message,
          };
        } else if (error.code === "ECONNREFUSED") {
          this.connectionError = {
            code: "CONNECTION_ERROR",
            message: "Could not connect to Obsidian",
          };
        } else if (error.response && error.response.status === 401) {
          this.connectionError = {
            code: "AUTH_ERROR",
            message: "Invalid API key",
          };
        } else {
          this.connectionError = {
            code: "UNKNOWN_ERROR",
            message: error.message,
          };
        }

        throw this.connectionError;
      }
    },

    async getVaultInfo(): Promise<VaultInfo> {
      if (!this.connected || !this.api) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        const response = await this.api.get("/vault/");

        if (response.status === 200 && response.data) {
          this.vaultName = response.data.name || "Unknown Vault";
          this.vaultPath = response.data.path || "";

          return {
            name: this.vaultName,
            path: this.vaultPath,
          };
        }

        throw new Error("Failed to get vault info");
      } catch (error) {
        console.error("Failed to get vault info:", error);
        throw error;
      }
    },

    async getVaultStats(): Promise<VaultStats> {
      if (!this.connected || !this.api) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        // Fetch the vault file structure
        const response = await this.api.get("/vault/");

        if (response.status === 200 && response.data) {
          // Process the file list
          this.fileList = response.data.files || [];
          this.folderList = response.data.folders || [];

          // Count markdown files only
          const markdownFiles = this.fileList.filter((file: string) =>
            file.endsWith(".md")
          );

          return {
            files: markdownFiles.length,
            folders: this.folderList.length,
          };
        }

        throw new Error("Failed to get vault stats");
      } catch (error) {
        console.error("Failed to get vault stats:", error);
        throw error;
      }
    },

    async fetchFileContent(filePath: string): Promise<string> {
      if (!this.connected || !this.api) {
        throw new Error("Not connected to Obsidian");
      }

      try {
        const response = await this.api.get(
          `/vault/${encodeURIComponent(filePath)}`
        );

        if (response.status === 200) {
          return response.data;
        }

        throw new Error(`Failed to fetch file ${filePath}`);
      } catch (error) {
        console.error(`Failed to fetch file content for ${filePath}:`, error);
        throw error;
      }
    },

    // Used for reconnecting on app startup
    async restoreConnection(): Promise<boolean> {
      const savedApiKey = localStorage.getItem("obsidian_api_key");
      const savedPort = localStorage.getItem("obsidian_api_port");

      if (savedApiKey) {
        try {
          await this.connectToVault(savedApiKey, savedPort || "27124");
          return true;
        } catch (error) {
          console.warn("Failed to restore Obsidian connection:", error);
          return false;
        }
      }

      return false;
    },

    disconnectVault() {
      this.connected = false;
      this.api = null;
      this.apiKey = null;
      this.vaultName = "";
      this.vaultPath = "";
      this.fileList = [];
      this.folderList = [];
      this.files = [];
      this.folders = [];
      this.folderStructure = null;
      this.noteContents = {};
      this.noteMetadata = {};

      // Clear stored API key
      localStorage.removeItem("obsidian_api_key");
      localStorage.removeItem("obsidian_api_port");
    },
    
    /**
     * Fetch the vault structure including files and folders
     */
    async fetchVaultStructure() {
      if (!this.connected || !this.api) {
        throw new Error("Not connected to Obsidian");
      }
      
      try {
        const response = await this.api.get("/vault/");
        
        if (response.status === 200 && response.data) {
          // Store raw file and folder lists
          this.fileList = response.data.files || [];
          this.folderList = response.data.folders || [];
          
          // Process files into detailed objects
          this.files = this.fileList.map(path => {
            const segments = path.split('/');
            const name = segments.pop() || '';
            const folder = segments.join('/');
            const extensionMatch = name.match(/\.([^.]+)$/);
            const extension = extensionMatch ? extensionMatch[1] : '';
            
            return {
              name,
              path,
              folder,
              extension,
              // Note: We'll fetch file stats separately if needed
              mtime: Date.now(), // Placeholder
              ctime: Date.now(), // Placeholder
              size: 0 // Placeholder
            };
          });
          
          // Process folders into detailed objects
          this.folders = this.folderList.map(path => {
            const segments = path.split('/');
            const name = segments.pop() || '';
            const parent = segments.join('/');
            
            return {
              name,
              path,
              parent
            };
          });
          
          // Build folder structure
          this.buildFolderStructure();
          
          // Update last refreshed timestamp
          this.lastRefreshed = new Date();
          
          return {
            files: this.files,
            folders: this.folders
          };
        }
        
        throw new Error("Failed to fetch vault structure");
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
        name: 'Root',
        path: '/',
        type: 'folder',
        children: []
      };
      
      // Create a map for quick folder lookup
      const folderMap = new Map<string, FolderStructureNode>();
      folderMap.set('/', root);
      
      // First, add all folders to the structure
      this.folders.forEach(folder => {
        const node: FolderStructureNode = {
          name: folder.name,
          path: folder.path,
          type: 'folder',
          children: []
        };
        
        folderMap.set(folder.path, node);
      });
      
      // Connect folders to their parents
      this.folders.forEach(folder => {
        const node = folderMap.get(folder.path);
        if (!node) return;
        
        const parentPath = folder.parent || '/';
        const parent = folderMap.get(parentPath);
        
        if (parent) {
          parent.children.push(node);
        } else {
          // If parent doesn't exist, add to root
          root.children.push(node);
        }
      });
      
      // Add files to their parent folders
      this.files.forEach(file => {
        const fileNode: FileStructureNode = {
          name: file.name,
          path: file.path,
          type: 'file'
        };
        
        const parentPath = file.folder || '/';
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
          if (a.type === 'folder' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'folder') return 1;
          return a.name.localeCompare(b.name);
        });
        
        // Recursively sort children of folders
        node.children.forEach(child => {
          if (child.type === 'folder') {
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
      if (!this.connected || !this.api) {
        throw new Error("Not connected to Obsidian");
      }
      
      try {
        const response = await this.api.get(`/vault/${encodeURIComponent(filePath)}`);
        
        if (response.status === 200) {
          const content = response.data;
          
          // Store the content
          this.noteContents[filePath] = content;
          
          // Extract and parse metadata
          this.parseNoteMetadata(filePath, content);
          
          return content;
        }
        
        throw new Error(`Failed to fetch note content for ${filePath}`);
      } catch (error) {
        console.error(`Failed to fetch note content for ${filePath}:`, error);
        throw error;
      }
    },
    
    /**
     * Parse note metadata (frontmatter and tags)
     */
    parseNoteMetadata(filePath: string, content: string) {
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
          console.error(`Error parsing frontmatter for ${filePath}:`, e);
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
      
      // Store the metadata
      this.noteMetadata[filePath] = metadata;
    },
  },
});
