// src/stores/dataStoreManager.ts
import { defineStore } from "pinia";
import { DataStore } from "@/obsidian/store/dataStore";
import { obsidianApiService } from "@/services/obsidian";
import type { ParsedData } from "@/obsidian/types/queryEngine";

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
        const initialBatch = markdownFiles.slice(0, 20);
        const totalFiles = initialBatch.length;

        let loadedCount = 0;

        // Process each file
        for (const filePath of initialBatch) {
          try {
            // Get the note JSON with metadata and content
            const noteJson = await obsidianApiService.getNoteJson(filePath);

            // Add to the data store
            this.dataStore.addOrUpdateNoteMetadata(filePath, noteJson);

            // For now, just add empty parsed data
            // In a full implementation, you would use a ContentParser here
            const emptyParsedData: ParsedData = {
              inlineFields: {},
              tasks: [],
            };

            this.dataStore.addOrUpdateNoteParsedData(filePath, emptyParsedData);

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
  },

  getters: {
    getDataStore: (state) => state.dataStore,
    isDataStoreReady: (state) => state.isInitialized && !state.isLoading,
    getInitializationProgress: (state) => state.initializationProgress,
  },
});
