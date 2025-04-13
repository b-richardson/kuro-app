// src/obsidian/api/apiClient.ts

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import type {
  ApiConfig,
  ApiStatusResponse,
  NoteJson,
  VaultInfo,
  CommandInfo,
  CommandListResponse,
  PeriodicNotePeriod,
  PatchOperation,
  PatchTargetType,
  PatchRequestHeaders,
  SimpleSearchResult,
  StructuredQueryResult,
  // Add other types as needed
} from "../types";

// Define a custom error type for API errors (can reuse from previous attempt or refine)
export class ApiError extends Error {
  public originalError?: Error | AxiosError;
  public status?: number;
  public path?: string;
  public data?: any; // Include response data if available

  constructor(
    message: string,
    options?: {
      originalError?: Error | AxiosError;
      status?: number;
      path?: string;
      data?: any;
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.originalError = options?.originalError;
    this.status = options?.status;
    this.path = options?.path;
    this.data = options?.data;
  }
}

export class ObsidianAPIClient {
  private api: AxiosInstance | null = null;
  private currentBaseUrl: string = "https://127.0.0.1:27124"; // Default
  private currentApiKey: string | null = null;

  constructor(config?: Partial<ApiConfig>) {
    if (config?.baseUrl || config?.apiKey) {
      this.initialize(config);
    }
  }

  public initialize(config: Partial<ApiConfig>): void {
    let keyChanged = false;
    let urlChanged = false;

    if (config.baseUrl && config.baseUrl !== this.currentBaseUrl) {
      this.currentBaseUrl = config.baseUrl.replace(/\/$/, "");
      urlChanged = true;
      console.log(`ObsidianAPIClient: Base URL set to ${this.currentBaseUrl}`);
    }

    if (config.apiKey && config.apiKey !== this.currentApiKey) {
      this.currentApiKey = config.apiKey;
      keyChanged = true;
      console.log("ObsidianAPIClient: API Key has been set/updated.");
    }

    if (urlChanged || keyChanged || !this.api) {
      if (!this.currentApiKey) {
        console.warn(
          "ObsidianAPIClient: Cannot create Axios instance without API Key."
        );
        this.api = null;
        return;
      }
      this.api = axios.create({
        baseURL: this.currentBaseUrl,
        headers: {
          Authorization: `Bearer ${this.currentApiKey}`,
        },
        timeout: 30000, // 30 seconds timeout
      });
      console.log("ObsidianAPIClient: Axios instance created/updated.");
    }
  }

  public clearConnection(): void {
    this.currentApiKey = null;
    this.api = null;
    console.log("ObsidianAPIClient: Connection cleared.");
  }

  public isInitialized(): boolean {
    return !!this.api && !!this.currentApiKey;
  }

  // --- Private helper for handling errors ---
  private handleApiError(
    error: unknown,
    contextMessage: string,
    path?: string
  ): ApiError {
    let status: number | undefined;
    let errorMessage = contextMessage;
    let responseData: any;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      status = axiosError.response?.status;
      responseData = axiosError.response?.data;

      if (
        responseData &&
        typeof responseData === "object" &&
        responseData.message
      ) {
        errorMessage = `${contextMessage}: ${responseData.message} (Status: ${
          status ?? "N/A"
        })`;
      } else if (axiosError.message) {
        errorMessage = `${contextMessage}: ${axiosError.message}`;
      } else {
        errorMessage = `${contextMessage} (Status: ${status ?? "N/A"})`;
      }
      console.error(
        `Axios Error during "${contextMessage}" [${path ?? "N/A"}]:`,
        error
      );
      return new ApiError(errorMessage, {
        originalError: axiosError,
        status,
        path,
        data: responseData,
      });
    } else if (error instanceof Error) {
      errorMessage = `${contextMessage}: ${error.message}`;
      console.error(
        `Error during "${contextMessage}" [${path ?? "N/A"}]:`,
        error
      );
      return new ApiError(errorMessage, { originalError: error, path });
    } else {
      errorMessage = `${contextMessage}: An unknown error occurred.`;
      console.error(
        `Unknown error during "${contextMessage}" [${path ?? "N/A"}]:`,
        error
      );
      return new ApiError(errorMessage, { path });
    }
  }

  // --- Helper to format file paths ---
  private formatFilePath(filePath: string): string {
    if (!filePath || filePath === "/") {
      // Handle root or invalid paths if necessary, though most methods require specific files/dirs
      // For now, just ensure it doesn't start with / for use in `/vault/{path}`
      return filePath.replace(/^\//, "");
    }
    return filePath.replace(/^\//, "");
  }

  // === Status ===

  /**
   * Checks the connection and authentication status with the Obsidian API.
   * @returns True if authenticated, throws ApiError otherwise.
   */
  public async checkConnection(): Promise<boolean> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    try {
      const response = await this.api!.get<ApiStatusResponse>("/");
      return response.data.authenticated === true;
    } catch (error) {
      throw this.handleApiError(error, "Failed to connect to Obsidian", "/");
    }
  }

  // === Vault Files & Directories ===

  /**
   * Lists files and directories within a specified path in the vault.
   * @param directoryPath Path relative to the vault root. Use an empty string "" for the root.
   * @returns A promise resolving to an object containing an array of file/directory names.
   */
  async listFiles(directoryPath: string): Promise<{ files: string[] }> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    let apiPath =
      directoryPath === ""
        ? "/vault/"
        : `/vault/${this.formatFilePath(directoryPath)}/`;
    try {
      const response = await this.api!.get<VaultInfo>(apiPath);
      return response.data;
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to list files in directory "${directoryPath || "/"}"`,
        apiPath
      );
    }
  }

  /**
   * Gets the content of a specific file. Defaults to markdown.
   * Specify 'json' format to get the structured NoteJson object.
   * @param filePath Path to the note file relative to the vault root.
   * @param format 'markdown' (default) or 'json'.
   * @returns A promise resolving to the file content (string) or NoteJson object.
   */
  async getFileContent(
    filePath: string,
    format: "markdown" | "json" = "markdown"
  ): Promise<string | NoteJson> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/vault/${this.formatFilePath(filePath)}`;
    const headers: Record<string, string> = {};
    if (format === "json") {
      headers["Accept"] = "application/vnd.olrapi.note+json";
    } // Default Accept header (or none) should yield markdown

    try {
      const response = await this.api!.get<string | NoteJson>(apiPath, {
        headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to get content for "${filePath}" (format: ${format})`,
        apiPath
      );
    }
  }

  // Specific helper for getting NoteJson, used by query engine
  async getNoteJson(filePath: string): Promise<NoteJson> {
    const result = await this.getFileContent(filePath, "json");
    if (typeof result === "string") {
      // This shouldn't happen if the API respects the Accept header, but handle defensively
      throw new ApiError(
        `Expected NoteJson object but received string for "${filePath}"`,
        { path: filePath }
      );
    }
    return result;
  }

  /**
   * Creates a new file or updates the content of an existing one.
   * @param filePath Path to the file relative to the vault root.
   * @param content The full content of the file (usually markdown).
   * @param contentType The MIME type of the content (defaults to 'text/markdown').
   */
  async updateFile(
    filePath: string,
    content: string,
    contentType: string = "text/markdown"
  ): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/vault/${this.formatFilePath(filePath)}`;
    try {
      // PUT expects 204 No Content on success
      await this.api!.put(apiPath, content, {
        headers: { "Content-Type": contentType },
      });
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to update file "${filePath}"`,
        apiPath
      );
    }
  }

  /**
   * Appends content to the end of a file. Creates the file if it doesn't exist.
   * @param filePath Path to the file relative to the vault root.
   * @param contentToAppend The content to append (usually markdown).
   */
  async appendToFile(filePath: string, contentToAppend: string): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/vault/${this.formatFilePath(filePath)}`;
    try {
      // POST expects 204 No Content on success
      await this.api!.post(apiPath, contentToAppend, {
        headers: { "Content-Type": "text/markdown" }, // API Spec implies markdown for POST body
      });
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to append to file "${filePath}"`,
        apiPath
      );
    }
  }

  /**
   * Patches content within an existing file relative to a heading, block, or frontmatter.
   * @param filePath Path to the file relative to the vault root.
   * @param patchHeaders Headers specifying the patch operation (Operation, Target-Type, Target, etc.).
   * @param contentToInsert The content to insert/append/prepend/replace. Can be string or JSON stringified data.
   */
  async patchFile(
    filePath: string,
    patchHeaders: PatchRequestHeaders,
    contentToInsert: string | object
  ): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/vault/${this.formatFilePath(filePath)}`;
    const requestBody =
      typeof contentToInsert === "object"
        ? JSON.stringify(contentToInsert)
        : contentToInsert;
    // Ensure Content-Type header matches body if JSON is sent
    const headers = { ...patchHeaders };
    if (typeof contentToInsert === "object" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    } else if (!headers["Content-Type"]) {
      headers["Content-Type"] = "text/markdown";
    }

    try {
      // PATCH expects 200 OK on success according to spec examples (might vary)
      await this.api!.patch(apiPath, requestBody, { headers });
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to patch file "${filePath}"`,
        apiPath
      );
    }
  }

  /**
   * Deletes a specific file in the vault.
   * @param filePath Path to the file relative to the vault root.
   */
  async deleteFile(filePath: string): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/vault/${this.formatFilePath(filePath)}`;
    try {
      // DELETE expects 204 No Content on success
      await this.api!.delete(apiPath);
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to delete file "${filePath}"`,
        apiPath
      );
    }
  }

  // === Active File === (Operates on the currently open file in Obsidian)

  /**
   * Gets the content of the currently active file.
   * @param format 'markdown' (default) or 'json'.
   * @returns A promise resolving to the file content (string) or NoteJson object.
   */
  async getActiveFileContent(
    format: "markdown" | "json" = "markdown"
  ): Promise<string | NoteJson> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/active/`;
    const headers: Record<string, string> = {};
    if (format === "json") {
      headers["Accept"] = "application/vnd.olrapi.note+json";
    }
    try {
      const response = await this.api!.get<string | NoteJson>(apiPath, {
        headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to get active file content (format: ${format})`,
        apiPath
      );
    }
  }

  /**
   * Updates the content of the currently active file.
   * @param content The full content of the file (usually markdown).
   * @param contentType The MIME type of the content (defaults to 'text/markdown').
   */
  async updateActiveFile(
    content: string,
    contentType: string = "text/markdown"
  ): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/active/`;
    try {
      await this.api!.put(apiPath, content, {
        headers: { "Content-Type": contentType },
      });
    } catch (error) {
      throw this.handleApiError(error, `Failed to update active file`, apiPath);
    }
  }

  /**
   * Appends content to the end of the active file.
   * @param contentToAppend The content to append (usually markdown).
   */
  async appendToActiveFile(contentToAppend: string): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/active/`;
    try {
      await this.api!.post(apiPath, contentToAppend, {
        headers: { "Content-Type": "text/markdown" },
      });
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to append to active file`,
        apiPath
      );
    }
  }

  /**
   * Patches content within the active file relative to a heading, block, or frontmatter.
   * @param patchHeaders Headers specifying the patch operation (Operation, Target-Type, Target, etc.).
   * @param contentToInsert The content to insert/append/prepend/replace. Can be string or JSON stringified data.
   */
  async patchActiveFile(
    patchHeaders: PatchRequestHeaders,
    contentToInsert: string | object
  ): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/active/`;
    const requestBody =
      typeof contentToInsert === "object"
        ? JSON.stringify(contentToInsert)
        : contentToInsert;
    const headers = { ...patchHeaders };
    if (typeof contentToInsert === "object" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    } else if (!headers["Content-Type"]) {
      headers["Content-Type"] = "text/markdown";
    }

    try {
      await this.api!.patch(apiPath, requestBody, { headers });
    } catch (error) {
      throw this.handleApiError(error, `Failed to patch active file`, apiPath);
    }
  }

  /**
   * Deletes the currently active file. Use with caution!
   */
  async deleteActiveFile(): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/active/`;
    try {
      await this.api!.delete(apiPath);
    } catch (error) {
      throw this.handleApiError(error, `Failed to delete active file`, apiPath);
    }
  }

  // === Commands ===

  /**
   * Gets a list of available Obsidian commands.
   * @returns A promise resolving to an array of commands.
   */
  async listCommands(): Promise<CommandInfo[]> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/commands/`;
    try {
      const response = await this.api!.get<CommandListResponse>(apiPath);
      return response.data.commands;
    } catch (error) {
      throw this.handleApiError(error, `Failed to list commands`, apiPath);
    }
  }

  /**
   * Executes a specific Obsidian command by its ID.
   * @param commandId The ID of the command to execute (e.g., "editor:toggle-bold").
   */
  async executeCommand(commandId: string): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    // Command IDs can contain special characters, ensure encoding if needed by Axios
    const apiPath = `/commands/${encodeURIComponent(commandId)}/`;
    try {
      // POST expects 204 No Content on success
      await this.api!.post(apiPath);
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to execute command "${commandId}"`,
        apiPath
      );
    }
  }

  // === Open File ===

  /**
   * Opens a specified document in Obsidian. Creates the file if it doesn't exist.
   * @param filePath Path to the file relative to the vault root.
   * @param newLeaf Optionally open the file in a new leaf (tab/split). Defaults to false.
   */
  async openFile(filePath: string, newLeaf: boolean = false): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    // Ensure path components are encoded
    const encodedFilePath = this.formatFilePath(filePath)
      .split("/")
      .map(encodeURIComponent)
      .join("/");
    const apiPath = `/open/${encodedFilePath}`;
    const config: AxiosRequestConfig = {};
    if (newLeaf) {
      config.params = { newLeaf: true };
    }

    try {
      // POST expects 200 OK according to spec
      await this.api!.post(apiPath, null, config); // No request body needed
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to open file "${filePath}"`,
        apiPath
      );
    }
  }

  // === Periodic Notes ===

  /**
   * Gets the content of a periodic note for the specified period.
   * @param period The periodic note type ('daily', 'weekly', etc.).
   * @param format 'markdown' (default) or 'json'.
   * @returns A promise resolving to the note content (string) or NoteJson object.
   */
  async getPeriodicNote(
    period: PeriodicNotePeriod,
    format: "markdown" | "json" = "markdown"
  ): Promise<string | NoteJson> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/periodic/${period}/`;
    const headers: Record<string, string> = {};
    if (format === "json") {
      headers["Accept"] = "application/vnd.olrapi.note+json";
    }
    try {
      const response = await this.api!.get<string | NoteJson>(apiPath, {
        headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to get ${period} periodic note (format: ${format})`,
        apiPath
      );
    }
  }

  /**
   * Updates the content of a periodic note. Creates it if necessary based on settings.
   * @param period The periodic note type.
   * @param content The full content.
   * @param contentType Content type (defaults to 'text/markdown').
   */
  async updatePeriodicNote(
    period: PeriodicNotePeriod,
    content: string,
    contentType: string = "text/markdown"
  ): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/periodic/${period}/`;
    try {
      await this.api!.put(apiPath, content, {
        headers: { "Content-Type": contentType },
      });
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to update ${period} periodic note`,
        apiPath
      );
    }
  }

  /**
   * Appends content to a periodic note. Creates it if necessary.
   * @param period The periodic note type.
   * @param contentToAppend Content to append.
   */
  async appendToPeriodicNote(
    period: PeriodicNotePeriod,
    contentToAppend: string
  ): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/periodic/${period}/`;
    try {
      await this.api!.post(apiPath, contentToAppend, {
        headers: { "Content-Type": "text/markdown" },
      });
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to append to ${period} periodic note`,
        apiPath
      );
    }
  }

  /**
   * Patches content within a periodic note.
   * @param period The periodic note type.
   * @param patchHeaders Headers specifying the patch operation.
   * @param contentToInsert Content to insert.
   */
  async patchPeriodicNote(
    period: PeriodicNotePeriod,
    patchHeaders: PatchRequestHeaders,
    contentToInsert: string | object
  ): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/periodic/${period}/`;
    const requestBody =
      typeof contentToInsert === "object"
        ? JSON.stringify(contentToInsert)
        : contentToInsert;
    const headers = { ...patchHeaders };
    if (typeof contentToInsert === "object" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    } else if (!headers["Content-Type"]) {
      headers["Content-Type"] = "text/markdown";
    }
    try {
      await this.api!.patch(apiPath, requestBody, { headers });
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to patch ${period} periodic note`,
        apiPath
      );
    }
  }

  /**
   * Deletes the periodic note for the specified period.
   * @param period The periodic note type.
   */
  async deletePeriodicNote(period: PeriodicNotePeriod): Promise<void> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/periodic/${period}/`;
    try {
      await this.api!.delete(apiPath);
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to delete ${period} periodic note`,
        apiPath
      );
    }
  }

  // === Search ===

  /**
   * Performs a simple text search across the vault.
   * @param query The text query string.
   * @param contextLength Amount of context characters around matches (default: 100).
   * @returns A promise resolving to an array of search results.
   */
  async simpleSearch(
    query: string,
    contextLength: number = 100
  ): Promise<SimpleSearchResult[]> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/search/simple/`;
    try {
      const response = await this.api!.post<SimpleSearchResult[]>(
        apiPath,
        null,
        {
          // No request body for POST /search/simple/
          params: { query, contextLength },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to perform simple search for "${query}"`,
        apiPath
      );
    }
  }

  /**
   * Performs a structured search using Dataview DQL or JsonLogic.
   * @param query The query body (string for DQL, object for JsonLogic).
   * @param queryType The type of query ('dataview' or 'jsonlogic').
   * @returns A promise resolving to an array of structured query results.
   */
  async structuredSearch(
    query: string | object,
    queryType: "dataview" | "jsonlogic"
  ): Promise<StructuredQueryResult[]> {
    if (!this.isInitialized())
      throw new ApiError("API client is not initialized.");
    const apiPath = `/search/`;
    let contentType: string;
    let requestBody: string | object = query;

    if (queryType === "dataview") {
      contentType = "application/vnd.olrapi.dataview.dql+txt";
      if (typeof query !== "string")
        throw new ApiError("Dataview query must be a string.");
    } else if (queryType === "jsonlogic") {
      contentType = "application/vnd.olrapi.jsonlogic+json";
      if (typeof query !== "object")
        throw new ApiError("JsonLogic query must be an object.");
      // Axios will stringify the object by default with application/json,
      // but we set the specific vendor type here.
    } else {
      throw new ApiError(`Unsupported query type: ${queryType}`);
    }

    try {
      const response = await this.api!.post<StructuredQueryResult[]>(
        apiPath,
        requestBody,
        {
          headers: { "Content-Type": contentType },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(
        error,
        `Failed to perform ${queryType} search`,
        apiPath
      );
    }
  }
} // End of ObsidianAPIClient class
