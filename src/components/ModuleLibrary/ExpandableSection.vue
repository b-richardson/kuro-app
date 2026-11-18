<template>
  <div class="expandable">
    <div class="expandable-header" @click="toggleOpen">
      <div class="header-left">
        <!-- Caret -->
        <i
          class="caret fas"
          :class="isOpen ? 'fa-chevron-down' : 'fa-chevron-right'"
        ></i>

        <!-- Optional Section Icon -->
        <i v-if="icon" :class="['section-icon', icon]" aria-hidden="true" />

        <!-- Title -->
        <h3 class="section-title">{{ title }}</h3>
      </div>
    </div>

    <div ref="drawerContent" class="expandable-content" :style="drawerStyle">
      <div class="inner-content" ref="innerContent">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";

const props = defineProps({
  title: String,
  icon: String,
  defaultOpen: {
    type: Boolean,
    default: false,
  },
});

const isOpen = ref(props.defaultOpen);
const drawerContent = ref<HTMLElement | null>(null);
const innerContent = ref<HTMLElement | null>(null);

const drawerStyle = ref({ maxHeight: "0px" });

const setDrawerHeight = async () => {
  await nextTick();
  const contentHeight = innerContent.value?.scrollHeight || 0;
  drawerStyle.value.maxHeight = isOpen.value ? `${contentHeight}px` : "0px";
};

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
  setDrawerHeight();
};

watch(isOpen, () => setDrawerHeight());

onMounted(() => {
  setDrawerHeight(); // Set correct height on mount
});
</script>

<style scoped>
.expandable {
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-sm) 0;
}

.expandable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: var(--spacing-xs) 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* New Caret */
.caret {
  transition: transform 0.3s ease;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Section Icon (Optional) */
.section-icon {
  font-size: 0.9rem;
  color: var(--color-icon, var(--color-text-muted));
}

/* Title (resetting font color) */
.section-title {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
}

/* Drawer container */
.expandable-content {
  overflow: hidden;
  transition: max-height 0.3s ease;
}

/* Content spacing inside the drawer */
.inner-content {
  padding: var(--spacing-sm) 0 var(--spacing-md);
}
</style>
