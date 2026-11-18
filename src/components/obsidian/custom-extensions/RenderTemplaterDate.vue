<template>
  <node-view-wrapper class="templater-date-wrapper">
    <span class="templater-date-result">{{ formattedDate }}</span>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/vue-3";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekday from "dayjs/plugin/weekday";

// Initialize dayjs plugins
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(weekday);

const props = defineProps<NodeViewProps>();
const formattedDate = ref("");

const formatDate = () => {
  try {
    const originalCode = props.node.attrs.originalCode || "<% tp.date.now() %>";

    // Default to today
    let date = dayjs();
    let format = "YYYY-MM-DD";
    let label = "";

    // Extract label if present
    const fullContent = originalCode;
    const labelMatch = fullContent.match(/^(.*?)<%(.*?)%>/);
    if (labelMatch && labelMatch[1].trim()) {
      label = labelMatch[1].trim();
    }

    // Check for date source
    if (originalCode.includes("tp.file.creation_date")) {
      // Extract format if present for file creation date
      const formatMatch = originalCode.match(
        /tp\.file\.creation_date\(["']([^"']+)["']\)/
      );
      if (formatMatch) format = formatMatch[1];
    } else if (originalCode.includes("tp.file.last_modified_date")) {
      // Extract format if present for file modified date
      const formatMatch = originalCode.match(
        /tp\.file\.last_modified_date\(["']([^"']+)["']\)/
      );
      if (formatMatch) format = formatMatch[1];
    } else if (originalCode.includes("tp.date.now")) {
      // Extract offset if present
      const offsetMatch = originalCode.match(/tp\.date\.now\(([\+\-]\d+)(\w+)/);
      if (offsetMatch) {
        const offset = parseInt(offsetMatch[1]);
        const unit = offsetMatch[2].replace(/s$/, ""); // Remove plural 's' if present

        // Apply offset
        if (offset > 0) {
          date = date.add(offset, unit as any);
        } else {
          date = date.subtract(Math.abs(offset), unit as any);
        }
      }

      // Extract format if present
      const formatMatch = originalCode.match(
        /tp\.date\.now\([^,]*,?\s*["']([^"']+)["']\)/
      );
      if (formatMatch) {
        format = formatMatch[1];
      } else {
        // Check for format without offset
        const simpleFormatMatch = originalCode.match(
          /tp\.date\.now\(["']([^"']+)["']\)/
        );
        if (simpleFormatMatch) {
          format = simpleFormatMatch[1];
        }
      }
    }

    // Format the date
    formattedDate.value = label
      ? label + " " + date.format(format)
      : date.format(format);
  } catch (err) {
    console.error("Error formatting templater date:", err);
    formattedDate.value = dayjs().format("YYYY-MM-DD");
  }
};

onMounted(() => {
  formatDate();
});

// Watch for changes to originalCode
watch(
  () => props.node.attrs.originalCode,
  () => {
    formatDate();
  }
);
</script>

<style>
.templater-date-wrapper {
  display: inline;
}

.templater-date-result {
  display: inline;
  color: #60a5fa;
  font-weight: 500;
  background-color: rgba(96, 165, 250, 0.1);
  border-radius: 3px;
  padding: 2px 4px;
  white-space: nowrap;
}

/* Hover effect to indicate this is a dynamic element */
.templater-date-result:hover {
  background-color: rgba(96, 165, 250, 0.2);
}

/* Dark mode support */
:global(.dark-theme) .templater-date-result {
  color: #56c8fa;
  background-color: rgba(86, 200, 250, 0.1);
}

:global(.dark-theme) .templater-date-result:hover {
  background-color: rgba(86, 200, 250, 0.2);
}
</style>
