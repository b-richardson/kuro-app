// src/stores/dataStoreManager.ts
import { defineStore } from "pinia";
import { DataStore } from "@/obsidian/store/dataStore";
import { obsidianApiService } from "@/services/obsidian";
import { ContentParser } from "@/obsidian/parser/contentParser";

const contentParser = new ContentParser();

export const useDataStoreManager = defineStore("dataStoreManager", {
  state: () => ({
    dataStore: new DataStore(),
    isInitialized: false,
    isLoading: false,
    error: null as string | null,
    initializationProgress: 0,
  }),

  actions: {
    async initializeDataStore() {
      // Skip if already initialized or loading
      if (this.isInitialized || this.isLoading) return;

      this.isLoading = true;
      this.error = null;
      this.initializationProgress = 0;

      try {
        console.log("DataStoreManager: Starting initialization");

        // Get list of files from the vault
        const vaultInfo = await obsidianApiService.getVaultInfo();

        if (!vaultInfo?.files?.length) {
          console.warn("DataStoreManager: No files found in vault");
          this.isLoading = false;
          return;
        }

        // Filter for markdown files only
        const markdownFiles = vaultInfo.files.filter(
          (file) => typeof file === "string" && file.endsWith(".md")
        );

        console.log(
          `DataStoreManager: Found ${markdownFiles.length} markdown files`
        );

        // Start with a smaller batch for faster initial loading
        // We'll limit it to 20 files to avoid performance issues during development
        // const initialBatch = markdownFiles.slice(0, 20);

        // For production, we can load all files at once
        const initialBatch = markdownFiles;

        const totalFiles = initialBatch.length;

        let loadedCount = 0;

        // Tracking the time taken for initialization
        console.time("DataStoreManager: Total initialization time");

        // Process each file

        for (const filePath of initialBatch) {
          try {
            // Get the note JSON with metadata and content
            const noteJson = await obsidianApiService.getNoteJson(filePath);

            // Add to the data store
            this.dataStore.addOrUpdateNoteMetadata(filePath, noteJson);

            // Parse the content to extract tasks and inline fields
            const parsedData = await contentParser.parse(
              noteJson.content,
              filePath
            );
            console.log(
              `DataStoreManager: Parsed data for ${filePath}:`,
              parsedData
            );
            // Add parsed data to the data store

            this.dataStore.addOrUpdateNoteParsedData(filePath, parsedData);

            // Update progress
            loadedCount++;
            this.initializationProgress = Math.round(
              (loadedCount / totalFiles) * 100
            );
          } catch (error) {
            console.error(
              `DataStoreManager: Error processing file ${filePath}:`,
              error
            );
            // Continue with other files even if one fails
          }
        }

        // Tracking the end time for initialization
        console.timeEnd("DataStoreManager: Total initialization time");

        this.isInitialized = true;
        console.log(
          `DataStoreManager: Initialized with ${this.dataStore.getNoteCount()} notes`
        );
      } catch (error: any) {
        this.error = error.message || "Failed to initialize data store";
        console.error("DataStoreManager: Initialization failed:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async refreshDataStore() {
      // Clear the existing data store
      this.dataStore.clearAll();

      // Reset state
      this.isInitialized = false;
      this.isLoading = false;
      this.error = null;
      this.initializationProgress = 0;

      // Re-initialize the data store
      await this.initializeDataStore();

      console.log("DataStoreManager: Data store refreshed");
    },
  },

  getters: {
    getDataStore: (state) => state.dataStore,
    isDataStoreReady: (state) => state.isInitialized && !state.isLoading,
    getInitializationProgress: (state) => state.initializationProgress,
  },
});
