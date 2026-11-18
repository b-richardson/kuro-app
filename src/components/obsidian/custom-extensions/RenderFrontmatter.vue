<template>
  <node-view-wrapper class="frontmatter-wrapper">
    <div class="properties-container">
      <div class="properties-header">Properties</div>

      <div class="properties-grid">
        <template v-for="(line, index) in formattedLines" :key="index">
          <template v-if="line.type === 'key-value'">
            <!-- Icon + Key -->
            <div class="property-key">
              <span
                class="property-icon"
                v-html="getIconForKey(line.key)"
              ></span>
              <span>{{ line.key }}</span>
            </div>

            <!-- Value -->
            <div class="property-value">
              <!-- Handle templater -->
              <template v-if="line.hasTemplater">
                <template v-if="isDateTemplater(line.value)">
                  <span class="value-pill">{{
                    formatTemplaterDate(line.value)
                  }}</span>
                </template>

                <template v-else-if="isUserInputTemplater(line.value)">
                  <span class="templater-prompt">{{
                    extractPromptText(line.value)
                  }}</span>
                </template>

                <template v-else>
                  <span
                    class="templater-placeholder"
                    v-text="line.value"
                  ></span>
                </template>
              </template>

              <!-- Non-templater values -->
              <template v-else>
                <template v-if="line.valueList?.length">
                  <span
                    class="value-pill"
                    v-for="(v, i) in line.valueList"
                    :key="i"
                  >
                    {{ stripQuotes(v) }}
                  </span>
                </template>
                <template v-else>
                  <span class="value-text">{{ line.value || "Empty" }}</span>
                </template>
              </template>
            </div>
          </template>
        </template>
      </div>
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, NodeViewProps } from "@tiptap/vue-3";
import { ref, watch, onMounted } from "vue";
import dayjs from "dayjs";

const props = defineProps<NodeViewProps>();
const formattedLines = ref<
  {
    type: "key-value";
    key: string;
    value: string;
    hasTemplater: boolean;
    valueList: string[];
  }[]
>([]);

const isDateTemplater = (value: string) =>
  value.includes("tp.date.now") ||
  value.includes("tp.file.creation_date") ||
  value.includes("tp.file.last_modified_date");

const isUserInputTemplater = (value: string) =>
  value.includes("tp.system.prompt") ||
  value.includes("tp.system.suggester") ||
  value.includes("tp.system.toggle");

const formatTemplaterDate = (value: string): string => {
  const match = value.match(/["']([^"']+)["']/);
  const format = match ? match[1] : "YYYY-MM-DD";
  return dayjs().format(format);
};

const extractPromptText = (value: string): string => {
  const match = value.match(/prompt\(["']([^"']+)["']/);
  return match ? match[1] : "Enter value";
};

const getIconForKey = (key: string): string => {
  const lower = key.toLowerCase();

  if (["tags", "tag"].includes(lower))
    return '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>';

  if (["members", "attendees", "list"].includes(lower))
    return '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>';

  if (["status", "state"].includes(lower))
    return '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>';

  if (
    ["date", "created", "start-date", "due-date"].some((k) => lower.includes(k))
  )
    return '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';

  // Default hamburger menu icon for other properties
  return '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
};

const processFrontmatter = () => {
  try {
    const raw = decodeURIComponent(props.node?.attrs?.yaml || "");
    const stripped = raw.replace(/^---\s*\n/, "").replace(/\n---\s*$/, "");
    const lines = stripped.split("\n");

    const result: {
      type: "key-value";
      key: string;
      value: string;
      hasTemplater: boolean;
      valueList: string[];
    }[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line || line === "---") {
        i++;
        continue;
      }

      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        i++;
        continue;
      }

      const key = line.substring(0, colonIndex).trim();
      const rawValue = line.substring(colonIndex + 1).trim();
      const hasTemplater = rawValue.includes("<%") && rawValue.includes("%>");

      let value = rawValue;
      const valueList: string[] = [];

      // Handle block-style lists
      if (value === "") {
        let j = i + 1;
        while (j < lines.length && lines[j].trim().startsWith("-")) {
          const item = lines[j].trim().replace(/^-/, "").trim();
          valueList.push(item);
          j++;
        }
        i = j - 1;
        value = ""; // Clear value if list is detected
      }

      // Handle inline JSON lists
      else if (!hasTemplater && value.startsWith("[") && value.endsWith("]")) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            valueList.push(...parsed);
            value = "";
          }
        } catch (e) {
          // fail silently
        }
      }

      result.push({
        type: "key-value",
        key,
        value,
        hasTemplater,
        valueList,
      });

      i++;
    }

    formattedLines.value = result;
  } catch (err) {
    console.error("Error parsing frontmatter", err);
    formattedLines.value = [];
  }
};

const stripQuotes = (str: string) => str.replace(/^["'](.*)["']$/, "$1");

onMounted(() => {
  processFrontmatter();
});

watch(
  () => props.node?.attrs?.yaml,
  () => {
    processFrontmatter();
  }
);
</script>

<style scoped>
.properties-container {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1rem;
  border-radius: 6px;
  font-family: var(--font-ui, system-ui);
  font-size: 0.875rem;
  color: var(--text-normal, #cfcfcf);
}

.properties-header {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.properties-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  row-gap: 0.5rem;
  column-gap: 1rem;
}

.property-row {
  display: contents;
}

.property-key {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--text-muted, #888);
}

.property-icon {
  font-size: 1rem;
  width: 1.2rem;
  text-align: center;
}

.property-value {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
}

.value-pill {
  background-color: #1e1b2f;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8em;
  color: #d6bcfa;
  font-weight: 500;
}

.value-text {
  color: var(--text-normal, #e2e8f0);
}

.templater-prompt {
  border: 1px dashed #ffd54f;
  background: rgba(255, 213, 79, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-style: italic;
  color: #ffd54f;
}

.templater-placeholder {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.85em;
  background: rgba(255, 255, 255, 0.03);
  color: #c1c1c1;
  border: 1px dashed #777;
  padding: 1px 5px;
  border-radius: 3px;
}
</style>
