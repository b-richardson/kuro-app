# Obsidian API Service

This directory contains the implementation of the Obsidian API Service, which provides a unified interface for interacting with Obsidian's Local REST API plugin.

## Architecture

The implementation follows a clean separation of concerns:

1. **API Service (`obsidianApiService.ts`)**: Handles all direct API calls to Obsidian's Local REST API endpoints. It encapsulates the HTTP communication, error handling, and data formatting.

2. **Type Definitions (`/types/obsidian.ts`)**: Comprehensive TypeScript interfaces for all Obsidian data structures, ensuring type safety throughout the application.

3. **Store (`/stores/obsidian.ts`)**: Manages application state related to Obsidian integration and provides a simplified interface to the API service for components.

## Features

The service supports:

- Connection management with custom port and API key
- Certificate error handling for self-signed certificates
- Vault structure and file browsing
- Reading and editing notes with metadata extraction
- Executing commands in Obsidian
- Working with active files and periodic notes
- Advanced searching capabilities (simple text, Dataview, JSON Logic)

## Usage

### Importing

```typescript
// Import the service singleton
import { obsidianApiService } from '@/services/obsidian';

// Or import types along with the service
import { obsidianApiService, NoteMetadata, VaultInfo } from '@/services/obsidian';
```

### Basic Usage

```typescript
// Initialize with configuration
obsidianApiService.initialize({
  baseUrl: 'https://127.0.0.1:27124',
  apiKey: 'your-api-key'
});

// Check connection
await obsidianApiService.checkConnection();

// Get vault information
const vaultInfo = await obsidianApiService.getVaultInfo();

// Get note content
const noteContent = await obsidianApiService.getFileContent('path/to/note.md');

// Create or update a note
await obsidianApiService.createOrUpdateFile('path/to/new-note.md', '# New Note\n\nContent here');
```

### Using with Store

Most application code should use the store instead of the service directly:

```typescript
import { useObsidianStore } from '@/stores/obsidian';

const obsidianStore = useObsidianStore();

// Connect to vault
await obsidianStore.connectToVault('your-api-key', '27124');

// Get vault structure
await obsidianStore.fetchVaultStructure();

// Get note content
const content = await obsidianStore.fetchNoteContent('path/to/note.md');
```

## Error Handling

The service provides consistent error handling with detailed information:

```typescript
try {
  await obsidianApiService.getVaultInfo();
} catch (error) {
  if (error.code === 'CERT_ERROR') {
    // Handle certificate error
  } else if (error.code === 'AUTH_ERROR') {
    // Handle authentication error
  } else {
    // Handle other errors
  }
}
```