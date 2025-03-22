<template>
  <div class="folder-tree">
    <template v-if="structure">
      <TreeNode 
        :node="structure" 
        :active-path="activePath"
        :filter="filter"
        @select-folder="onFolderSelect"
        @select-file="onFileSelect"
      />
    </template>
    <div v-else class="empty-structure">
      <i class="fas fa-spinner fa-spin" v-if="loading"></i>
      <span v-else>No folders available</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TreeNode from './TreeNode.vue';

interface FolderNode {
  name: string;
  path: string;
  type: 'folder';
  children: (FolderNode | FileNode)[];
}

interface FileNode {
  name: string;
  path: string;
  type: 'file';
}

const props = defineProps({
  structure: {
    type: Object as () => FolderNode | null,
    default: null
  },
  activePath: {
    type: String,
    default: ''
  },
  filter: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select-folder', 'select-file']);

// Pass through events from child components
const onFolderSelect = (path: string) => {
  emit('select-folder', path);
};

const onFileSelect = (path: string) => {
  emit('select-file', path);
};
</script>

<style scoped>
.folder-tree {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 0.5rem;
}

.empty-structure {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-tertiary);
  gap: 1rem;
  font-size: 0.9rem;
}

.empty-structure i {
  font-size: 1.5rem;
  color: var(--color-primary);
}
</style>