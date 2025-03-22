import { defineStore } from "pinia";
import axios, { AxiosInstance } from "axios";

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
  }),

  getters: {
    isConnected: (state) => state.connected,
    hasConnectionError: (state) => !!state.connectionError,
    shouldPromptForConnection: (state) =>
      !state.connected && !state.integrationSkipped,
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

      // Clear stored API key
      localStorage.removeItem("obsidian_api_key");
    },
  },
});
