<template>
  <div class="tree-node" v-if="shouldDisplayNode">
    <!-- Folder node -->
    <div 
      v-if="node.type === 'folder'" 
      class="folder-node" 
      :class="{ 'active': isActive, 'expanded': isExpanded }"
    >
      <div 
        class="folder-header" 
        @click="toggleFolder(node.path)"
      >
        <div class="expand-icon" @click.stop="toggleExpanded">
          <i class="fas" :class="isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
        </div>
        <div class="folder-icon">
          <i class="fas" :class="isExpanded ? 'fa-folder-open' : 'fa-folder'"></i>
        </div>
        <div class="folder-name">{{ node.name }}</div>
      </div>
      
      <!-- Children (recursive) -->
      <div v-if="isExpanded" class="folder-children">
        <TreeNode
          v-for="child in filteredChildren"
          :key="child.path"
          :node="child"
          :active-path="activePath"
          :filter="filter"
          :parent-expanded="isExpanded"
          @select-folder="onFolderSelect"
          @select-file="onFileSelect"
        />
      </div>
    </div>
    
    <!-- File node -->
    <div 
      v-else-if="node.type === 'file' && isMarkdownFile" 
      class="file-node"
      :class="{ 'active': isActive }"
      @click="selectFile(node.path)"
    >
      <div class="file-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <div class="file-name">{{ node.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface TreeNodeProps {
  node: {
    name: string;
    path: string;
    type: 'folder' | 'file';
    children?: any[];
  };
  activePath: string;
  filter: string;
  parentExpanded?: boolean;
}

const props = defineProps<TreeNodeProps>();
const emit = defineEmits(['select-folder', 'select-file']);

// State
const isExpanded = ref(false);

// Auto-expand if this folder contains the active path
watch(() => props.activePath, (newPath) => {
  if (props.node.type === 'folder' && newPath && newPath.startsWith(props.node.path)) {
    isExpanded.value = true;
  }
}, { immediate: true });

// Auto-expand when parent is expanded
watch(() => props.parentExpanded, (newValue) => {
  if (newValue === false) {
    isExpanded.value = false;
  }
}, { immediate: true });

// Computed properties
const isActive = computed(() => {
  return props.activePath === props.node.path;
});

const isMarkdownFile = computed(() => {
  return props.node.type === 'file' && props.node.name.endsWith('.md');
});

// Check if node should be displayed based on filter
const matchesFilter = computed(() => {
  if (!props.filter) return true;
  
  const lowerFilter = props.filter.toLowerCase();
  return props.node.name.toLowerCase().includes(lowerFilter) ||
    props.node.path.toLowerCase().includes(lowerFilter);
});

// For folders, also check if any children match the filter
const hasMatchingChildren = computed(() => {
  if (!props.filter || props.node.type !== 'folder' || !props.node.children) {
    return false;
  }
  
  const lowerFilter = props.filter.toLowerCase();
  return props.node.children.some(child => 
    child.name.toLowerCase().includes(lowerFilter) ||
    child.path.toLowerCase().includes(lowerFilter)
  );
});

// Should this node be displayed
const shouldDisplayNode = computed(() => {
  // If no filter, always display
  if (!props.filter) return true;
  
  // If this node matches, display it
  if (matchesFilter.value) return true;
  
  // If it's a folder and any children match, display it
  if (props.node.type === 'folder' && hasMatchingChildren.value) {
    isExpanded.value = true; // Auto-expand to show matching children
    return true;
  }
  
  return false;
});

// Filter children based on search
const filteredChildren = computed(() => {
  if (!props.node.children) return [];
  
  // If no filter, return all children
  if (!props.filter) return props.node.children;
  
  // If filter, auto-expand this folder
  if (props.filter && props.node.type === 'folder') {
    isExpanded.value = true;
  }
  
  return props.node.children;
});

// Methods
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const toggleFolder = (path: string) => {
  // Toggle expanded state
  isExpanded.value = !isExpanded.value;
  
  // Emit select event
  emit('select-folder', path);
};

const selectFile = (path: string) => {
  emit('select-file', path);
};

const onFolderSelect = (path: string) => {
  emit('select-folder', path);
};

const onFileSelect = (path: string) => {
  emit('select-file', path);
};
</script>

<style scoped>
.tree-node {
  font-size: 0.9rem;
  margin-left: 0.3rem;
}

.folder-node {
  margin-bottom: 0.2rem;
}

.folder-header {
  display: flex;
  align-items: center;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.folder-header:hover {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.folder-header.active {
  background-color: rgba(var(--color-primary-rgb), 0.2);
}

.expand-icon {
  width: 16px;
  display: flex;
  justify-content: center;
  margin-right: 4px;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.folder-icon {
  color: var(--color-primary);
  margin-right: 6px;
  width: 16px;
  display: flex;
  justify-content: center;
}

.folder-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.folder-children {
  margin-left: 1rem;
  padding-left: 0.5rem;
  border-left: 1px solid rgba(var(--color-primary-rgb), 0.2);
}

.file-node {
  display: flex;
  align-items: center;
  padding: 0.35rem 0.5rem;
  margin-left: 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.file-node:hover {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.file-node.active {
  background-color: rgba(var(--color-primary-rgb), 0.2);
  font-weight: 500;
}

.file-icon {
  color: var(--color-text-secondary);
  margin-right: 6px;
  width: 16px;
  display: flex;
  justify-content: center;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
</style>