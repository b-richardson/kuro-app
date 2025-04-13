// src/stores/obsidianQueryStore.ts

import { defineStore } from "pinia";
import { ref } from "vue"; // Using Vue 3 Composition API style for Pinia

// Import our services and types
import { ObsidianAPIClient, ApiError } from "@/obsidian/api/apiClient"; // Adjust path
import { ContentParser } from "@/obsidian/parser/contentParser"; // Adjust path
import { DataStore } from "@/obsidian/store/dataStore"; // Adjust path
import { QueryEngine } from "@/obsidian/engine/queryEngine"; // *** Import QueryEngine ***
import type {
  ApiConfig,
  QueryRequest,
  QueryResult,
  NoteJson,
  CombinedNoteData, // If needed for getters etc.
} from "@/obsidian/types"; // Adjust path

export const useObsidianQueryStore = defineStore("obsidianQuery", () => {
  // --- State ---
  const apiClient = ref<ObsidianAPIClient | null>(null);
  const isInitialized = ref(false); // Tracks if apiClient is configured
  const isLoading = ref(false); // For cache updates
  const isQuerying = ref(false); // For query execution
  const lastUpdated = ref<Date | null>(null);
  const connectionError = ref<string | null>(null); // Error during initial connection/setup
  const refreshError = ref<string | null>(null); // Error during cache refresh
  const queryError = ref<string | null>(null); // Error during query execution
  const noteCount = ref(0);

  // Instantiate dependencies
  const contentParser = new ContentParser();
  const dataStore = new DataStore(); // Using the In-Memory version
  const queryEngine = new QueryEngine(); // *** Instantiate QueryEngine ***

  // --- Internal Cache Management Logic ---

  async function _fetchAndIndexUpdates() {
    if (!apiClient.value || !apiClient.value.isInitialized()) {
      refreshError.value = "API Client not initialized.";
      console.error("Cache Update Aborted: API Client not initialized.");
      return;
    }
    if (isLoading.value) {
      console.warn("Cache update already in progress.");
      return;
    }

    isLoading.value = true;
    refreshError.value = null;
    console.log("Starting cache update...");

    try {
      const fetchedPaths = new Set<string>();
      const allFiles: string[] = [];

      // 1. Discover all .md files recursively
      const queue: string[] = [""];
      const visitedDirs = new Set<string>();

      console.time("File Discovery");
      while (queue.length > 0) {
        const currentPath = queue.shift()!;
        if (visitedDirs.has(currentPath)) continue;
        visitedDirs.add(currentPath);

        try {
          const result = await apiClient.value.listFiles(currentPath);
          for (const fileOrDir of result.files) {
            const fullPath =
              currentPath === "" ? fileOrDir : `${currentPath}/${fileOrDir}`;
            if (fullPath.endsWith("/")) {
              const dirPath = fullPath.replace(/\/$/, "");
              if (!visitedDirs.has(dirPath)) {
                queue.push(dirPath);
              }
            } else if (fullPath.endsWith(".md")) {
              allFiles.push(fullPath);
            }
          }
        } catch (e: any) {
          console.warn(
            `Failed to list directory: "${
              currentPath || "/"
            }". Skipping. Error:`,
            e.message
          );
          if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
            throw e;
          }
        }
      }
      console.timeEnd("File Discovery");
      console.log(`Discovered ${allFiles.length} potential markdown files.`);

      // 2. Get NoteJson for all discovered .md files
      const fetchedNoteJsons = new Map<string, NoteJson>();
      console.time("Fetch Note Metadata");
      const fetchPromises = allFiles.map(async (path) => {
        try {
          const noteJson = await apiClient.value!.getNoteJson(path);
          fetchedNoteJsons.set(path, noteJson);
          fetchedPaths.add(path);
        } catch (e) {
          console.warn(
            `Failed to fetch NoteJson for: ${path}. Skipping. Error:`,
            (e as Error).message
          );
        }
      });
      await Promise.allSettled(fetchPromises);
      console.timeEnd("Fetch Note Metadata");
      console.log(
        `Successfully fetched metadata for ${fetchedNoteJsons.size} files.`
      );

      // 3. Compare mtimes and Identify changes
      const currentMtimes = dataStore.getAllMtimes();
      const notesToParse = new Map<string, NoteJson>();
      const notesToRemove = new Set<string>(currentMtimes.keys());

      for (const [path, noteJson] of fetchedNoteJsons.entries()) {
        notesToRemove.delete(path);
        const existingMtime = currentMtimes.get(path);
        dataStore.addOrUpdateNoteMetadata(path, noteJson);
        if (!existingMtime || noteJson.stat.mtime > existingMtime) {
          notesToParse.set(path, noteJson);
        }
      }

      // 4. Parse necessary content
      console.time("Parse Content");
      console.log(
        `Parsing content for ${notesToParse.size} new/modified notes...`
      );
      for (const [path, noteJson] of notesToParse.entries()) {
        try {
          const parsedData = await contentParser.parse(noteJson.content, path);
          dataStore.addOrUpdateNoteParsedData(path, parsedData);
        } catch (e) {
          console.warn(
            `Failed to parse content for: ${path}. Storing without parsed data. Error:`,
            (e as Error).message
          );
        }
      }
      console.timeEnd("Parse Content");

      // 5. Remove deleted notes
      console.log(
        `Removing ${notesToRemove.size} notes not found during fetch...`
      );
      for (const path of notesToRemove) {
        dataStore.removeNote(path);
      }

      // --- Update Final State ---
      lastUpdated.value = new Date();
      noteCount.value = dataStore.getNoteCount();
      refreshError.value = null;
      console.log(
        `Cache update finished. Total notes in store: ${noteCount.value}`
      );
    } catch (err: any) {
      console.error("Cache update failed:", err);
      refreshError.value =
        err.message || "An unknown error occurred during cache update.";
      if (
        err instanceof ApiError &&
        (err.status === 401 || err.status === 403)
      ) {
        connectionError.value = "Authentication failed. Please check API Key.";
        isInitialized.value = false;
        apiClient.value?.clearConnection();
      }
    } finally {
      isLoading.value = false;
    }
  }

  // --- Public Actions ---

  async function setupApiClient(config: ApiConfig) {
    console.log("Setting up API client...");
    connectionError.value = null;
    isInitialized.value = false;
    try {
      if (!apiClient.value) {
        apiClient.value = new ObsidianAPIClient(config);
      } else {
        apiClient.value.initialize(config);
      }

      if (!apiClient.value.isInitialized()) {
        throw new Error("Failed to initialize API client instance.");
      }

      await apiClient.value.checkConnection();
      isInitialized.value = true;
      console.log("API client setup and connection successful.");
      // refreshCache(); // Decide whether to auto-refresh on setup
    } catch (error: any) {
      console.error("API client setup failed:", error);
      connectionError.value =
        error.message || "Failed to connect. Check Obsidian/API settings.";
      apiClient.value?.clearConnection();
      isInitialized.value = false;
    }
  }

  function disconnectApiClient() {
    apiClient.value?.clearConnection();
    apiClient.value = null;
    isInitialized.value = false;
    lastUpdated.value = null;
    noteCount.value = 0;
    connectionError.value = null;
    refreshError.value = null;
    queryError.value = null;
    dataStore.clearAll();
    console.log("API client disconnected and store reset.");
  }

  async function refreshCache() {
    await _fetchAndIndexUpdates();
  }

  async function performQuery(query: QueryRequest): Promise<QueryResult> {
    queryError.value = null; // Clear previous query error

    // --- Prerequisite Checks ---
    if (isLoading.value) {
      const msg = "Cache is currently updating. Please wait.";
      queryError.value = msg;
      return { type: "ERROR", message: msg };
    }
    if (refreshError.value) {
      const msg = `Cannot query due to cache refresh error: ${refreshError.value}`;
      queryError.value = msg;
      return { type: "ERROR", message: msg };
    }
    if (!isInitialized.value || !apiClient.value) {
      const msg = "API Client not initialized.";
      queryError.value = msg;
      return { type: "ERROR", message: msg };
    }
    if (!lastUpdated.value) {
      const msg = "Cache has not been loaded yet. Please refresh cache.";
      queryError.value = msg;
      return { type: "ERROR", message: msg };
    }

    isQuerying.value = true;
    console.time("Query Execution");
    try {
      // *** Use the instantiated queryEngine ***
      const results = await queryEngine.execute(query, dataStore);
      console.timeEnd("Query Execution");
      return results;
    } catch (err: any) {
      console.error("Query execution failed:", err);
      queryError.value =
        err.message || "An unknown error occurred during query execution.";
      console.timeEnd("Query Execution");
      // *** Fix Type Error: Provide a default string if queryError.value is null ***
      return {
        type: "ERROR",
        message: queryError.value ?? "Unknown query error",
      };
    } finally {
      isQuerying.value = false;
    }
  }

  // --- Return state and actions ---
  return {
    // State
    isInitialized,
    isLoading,
    isQuerying,
    lastUpdated,
    connectionError,
    refreshError,
    queryError,
    noteCount,
    // Actions
    setupApiClient,
    disconnectApiClient,
    refreshCache,
    performQuery,
  };
});
