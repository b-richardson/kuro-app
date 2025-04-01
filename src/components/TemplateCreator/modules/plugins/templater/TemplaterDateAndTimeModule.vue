<template>
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateContent"
    @update="$emit('update', $event as any)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    ref="baseModuleRef"
  >
    <div class="smart-date">
      <!-- Module Header -->
      <div class="smart-date__header">
        <div class="smart-date__header-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="smart-date__header-title">Smart Date</div>
      </div>

      <!-- Tab Navigation -->
      <div class="smart-date__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="smart-date__tab"
          :class="{ 'smart-date__tab--active': activeTab === tab.id }"
          @click="setActiveTab(tab.id)"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="smart-date__content">
        <!-- Today Tab -->
        <div v-if="activeTab === 'today'" class="smart-date__panel">
          <div class="smart-date__format-buttons">
            <button
              v-for="format in dateFormats"
              :key="format.id"
              class="smart-date__format-button"
              :class="{
                'smart-date__format-button--active':
                  selectedFormat === format.id,
              }"
              @click="selectFormat(format.id)"
            >
              {{ format.name }}
            </button>
          </div>

          <div class="smart-date__time-toggle">
            <label class="smart-date__toggle">
              <input
                type="checkbox"
                v-model="includeTime"
                @change="generateDateCode"
              />
              <span class="smart-date__toggle-slider"></span>
              <span class="smart-date__toggle-label">Include time</span>
            </label>
          </div>
        </div>

        <!-- Calendar Tab -->
        <div v-if="activeTab === 'calendar'" class="smart-date__panel">
          <div class="smart-date__calendar">
            <div class="smart-date__calendar-header">
              <button @click="previousMonth" class="smart-date__calendar-nav">
                <i class="fas fa-chevron-left"></i>
              </button>
              <div class="smart-date__calendar-title">
                {{ currentMonthName }} {{ currentYear }}
              </div>
              <button @click="nextMonth" class="smart-date__calendar-nav">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <div class="smart-date__calendar-weekdays">
              <div
                v-for="day in weekDays"
                :key="day"
                class="smart-date__calendar-weekday"
              >
                {{ day }}
              </div>
            </div>

            <div class="smart-date__calendar-days">
              <button
                v-for="(day, index) in calendarDays"
                :key="index"
                class="smart-date__calendar-day"
                :class="{
                  'smart-date__calendar-day--other-month': !day.currentMonth,
                  'smart-date__calendar-day--selected': isSelectedDay(day.date),
                  'smart-date__calendar-day--today': isToday(day.date),
                }"
                @click="selectDay(day.date)"
              >
                {{ day.day }}
              </button>
            </div>
          </div>

          <div class="smart-date__calendar-offset">
            <div class="smart-date__offset-label">Adjust date:</div>
            <div class="smart-date__offset-controls">
              <button
                @click="adjustOffset(-1)"
                class="smart-date__offset-button"
              >
                <i class="fas fa-minus"></i>
              </button>
              <input
                type="number"
                v-model.number="offsetAmount"
                class="smart-date__offset-input"
                min="0"
                max="999"
                @change="generateDateCode"
              />
              <select
                v-model="offsetUnit"
                @change="generateDateCode"
                class="smart-date__offset-select"
              >
                <option value="day">day(s)</option>
                <option value="week">week(s)</option>
                <option value="month">month(s)</option>
              </select>
              <button
                @click="adjustOffset(1)"
                class="smart-date__offset-button"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div class="smart-date__format-buttons">
            <button
              v-for="format in dateFormats"
              :key="format.id"
              class="smart-date__format-button"
              :class="{
                'smart-date__format-button--active':
                  selectedFormat === format.id,
              }"
              @click="selectFormat(format.id)"
            >
              {{ format.name }}
            </button>
          </div>
        </div>

        <!-- Smart Tab -->
        <div v-if="activeTab === 'smart'" class="smart-date__panel">
          <div class="smart-date__smart-input-container">
            <input
              type="text"
              v-model="smartDateInput"
              @input="parseSmartDate"
              class="smart-date__smart-input"
              placeholder="tomorrow, next Friday, in 2 weeks..."
            />
          </div>

          <div class="smart-date__smart-suggestions">
            <button
              v-for="suggestion in smartSuggestions"
              :key="suggestion.text"
              class="smart-date__smart-suggestion"
              @click="applySmartSuggestion(suggestion.text)"
            >
              {{ suggestion.text }}
            </button>
          </div>

          <div class="smart-date__format-buttons">
            <button
              v-for="format in dateFormats"
              :key="format.id"
              class="smart-date__format-button"
              :class="{
                'smart-date__format-button--active':
                  selectedFormat === format.id,
              }"
              @click="selectFormat(format.id)"
            >
              {{ format.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Advanced Options (expandable) -->
      <div class="smart-date__advanced">
        <button
          class="smart-date__advanced-toggle"
          @click="showAdvancedOptions = !showAdvancedOptions"
        >
          <span>{{
            showAdvancedOptions
              ? "Hide advanced options"
              : "Show advanced options"
          }}</span>
          <i
            :class="
              showAdvancedOptions ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
            "
          ></i>
        </button>

        <div v-if="showAdvancedOptions" class="smart-date__advanced-panel">
          <div class="smart-date__advanced-section">
            <div class="smart-date__advanced-title">Date Source</div>
            <div class="smart-date__source-options">
              <button
                v-for="source in dateSources"
                :key="source.id"
                class="smart-date__source-option"
                :class="{
                  'smart-date__source-option--active': dateSource === source.id,
                }"
                @click="setDateSource(source.id)"
              >
                {{ source.name }}
              </button>
            </div>
          </div>

          <div class="smart-date__advanced-section">
            <div class="smart-date__advanced-title">Custom Format</div>
            <div class="smart-date__custom-format">
              <div class="smart-date__custom-format-input">
                <input
                  type="text"
                  v-model="customFormat"
                  @input="applyCustomFormat"
                  class="smart-date__input"
                  placeholder="e.g., YYYY-MM-DD HH:mm"
                />
                <button
                  class="smart-date__help-btn"
                  @click="showFormatHelp = !showFormatHelp"
                  title="Format help"
                >
                  <i class="fas fa-question-circle"></i>
                </button>
              </div>

              <div v-if="showFormatHelp" class="smart-date__format-help">
                <div class="smart-date__format-tokens">
                  <div
                    v-for="token in formatTokens"
                    :key="token.token"
                    class="smart-date__format-token"
                  >
                    <div
                      class="smart-date__token-name"
                      @click="insertToken(token.token)"
                    >
                      {{ token.token }}
                    </div>
                    <div class="smart-date__token-desc">
                      {{ token.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Initialize dayjs plugins
dayjs.extend(weekday);
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

// Define props
const props = defineProps<{
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}>();

// Define emits
const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete"): void;
  (e: "select"): void;
  (e: "duplicate"): void;
  (e: "module-change"): void;
}>();

// Reference to the base module component
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);

// UI State
const activeTab = ref("today");
const showAdvancedOptions = ref(false);
const showFormatHelp = ref(false);

// Date selection state
const selectedDate = ref(dayjs());
const currentMonth = ref(dayjs().month());
const currentYear = ref(dayjs().year());
const offsetAmount = ref(0);
const offsetUnit = ref("day");
const includeTime = ref(false);
const selectedFormat = ref("simple");
const customFormat = ref("");
const dateSource = ref("now");
const smartDateInput = ref("");

// Tabs configuration
const tabs = [
  { id: "today", label: "Today", icon: "fas fa-clock" },
  { id: "calendar", label: "Calendar", icon: "fas fa-calendar" },
  { id: "smart", label: "Smart", icon: "fas fa-magic" },
];

// Date formats
const dateFormats = [
  { id: "simple", name: "Simple", format: "MMM D, YYYY" },
  { id: "short", name: "Short", format: "MM/DD/YYYY" },
  { id: "full", name: "Full", format: "dddd, MMMM D, YYYY" },
  { id: "iso", name: "ISO", format: "YYYY-MM-DD" },
];

// Date sources
const dateSources = [
  { id: "now", name: "Current Date" },
  { id: "creation", name: "File Creation" },
  { id: "modified", name: "File Modified" },
];

// Format tokens help
const formatTokens = [
  { token: "YYYY", description: "4-digit year (2025)" },
  { token: "MM", description: "Month number (01-12)" },
  { token: "DD", description: "Day of month (01-31)" },
  { token: "ddd", description: "Day name short (Mon)" },
  { token: "dddd", description: "Day name (Monday)" },
  { token: "MMM", description: "Month name short (Jan)" },
  { token: "MMMM", description: "Month name (January)" },
  { token: "HH", description: "Hours 24h (00-23)" },
  { token: "hh", description: "Hours 12h (01-12)" },
  { token: "mm", description: "Minutes (00-59)" },
  { token: "ss", description: "Seconds (00-59)" },
  { token: "A", description: "AM/PM" },
];

// Smart date suggestions
const smartSuggestions = [
  { text: "tomorrow" },
  { text: "next Monday" },
  { text: "yesterday" },
  { text: "in 2 weeks" },
  { text: "last Friday" },
];

// Calendar computed properties
const weekDays = computed(() => ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]);

const currentMonthName = computed(() => {
  return dayjs().month(currentMonth.value).format("MMMM");
});

const calendarDays = computed(() => {
  const days = [];
  const firstDay = dayjs()
    .year(currentYear.value)
    .month(currentMonth.value)
    .date(1);
  const lastDay = dayjs()
    .year(currentYear.value)
    .month(currentMonth.value + 1)
    .date(0);

  // Previous month days
  const daysFromPrevMonth = firstDay.day();
  if (daysFromPrevMonth > 0) {
    const prevMonth = firstDay.subtract(1, "month");
    const prevMonthDays = prevMonth.daysInMonth();

    for (
      let i = prevMonthDays - daysFromPrevMonth + 1;
      i <= prevMonthDays;
      i++
    ) {
      days.push({
        day: i,
        date: dayjs().year(prevMonth.year()).month(prevMonth.month()).date(i),
        currentMonth: false,
      });
    }
  }

  // Current month days
  for (let i = 1; i <= lastDay.date(); i++) {
    days.push({
      day: i,
      date: dayjs().year(currentYear.value).month(currentMonth.value).date(i),
      currentMonth: true,
    });
  }

  // Next month days
  const daysFromNextMonth = 42 - days.length;
  for (let i = 1; i <= daysFromNextMonth; i++) {
    days.push({
      day: i,
      date: dayjs()
        .year(currentYear.value)
        .month(currentMonth.value + 1)
        .date(i),
      currentMonth: false,
    });
  }

  return days;
});

// Get active format string
const activeFormatString = computed(() => {
  if (showAdvancedOptions.value && customFormat.value) {
    return customFormat.value;
  }

  // Find selected format
  const format = dateFormats.find((f) => f.id === selectedFormat.value);
  let formatString = format ? format.format : "MMM D, YYYY";

  // Add time if needed
  if (includeTime.value) {
    formatString += " h:mm A";
  }

  return formatString;
});

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingCode(props.module.content[0]);
  } else {
    // Generate initial code
    generateDateCode();
  }
});

// Set active tab
function setActiveTab(tabId: string) {
  activeTab.value = tabId;
  generateDateCode();
}

// Select format
function selectFormat(formatId: string) {
  selectedFormat.value = formatId;
  generateDateCode();
}

// Set date source
function setDateSource(sourceId: string) {
  dateSource.value = sourceId;
  generateDateCode();
}

// Calendar navigation
function previousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

// Day selection
function selectDay(date: dayjs.Dayjs) {
  selectedDate.value = date;
  generateDateCode();
}

function isSelectedDay(date: dayjs.Dayjs) {
  return date.format("YYYY-MM-DD") === selectedDate.value.format("YYYY-MM-DD");
}

function isToday(date: dayjs.Dayjs) {
  return date.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");
}

// Offset adjustment
function adjustOffset(amount: number) {
  offsetAmount.value = Math.max(0, offsetAmount.value + amount);
  generateDateCode();
}

// Smart date parsing
function parseSmartDate() {
  try {
    // Add basic natural language parsing here
    // This is a simplified version - you would need a more robust parser in production
    const input = smartDateInput.value.toLowerCase();

    if (input === "tomorrow") {
      selectedDate.value = dayjs().add(1, "day");
    } else if (input === "yesterday") {
      selectedDate.value = dayjs().subtract(1, "day");
    } else if (input.startsWith("next ")) {
      const day = input.replace("next ", "");
      const dayMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      if (dayMap[day] !== undefined) {
        selectedDate.value = dayjs().day(dayMap[day] + 7);
      }
    } else if (input.startsWith("last ")) {
      const day = input.replace("last ", "");
      const dayMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      if (dayMap[day] !== undefined) {
        selectedDate.value = dayjs().day(dayMap[day] - 7);
      }
    } else if (input.startsWith("in ")) {
      // Parse "in X days/weeks/months"
      const parts = input.replace("in ", "").split(" ");
      if (parts.length >= 2) {
        const amount = parseInt(parts[0]);
        const unit = parts[1].replace(/s$/, ""); // Remove plural 's'

        if (!isNaN(amount) && ["day", "week", "month", "year"].includes(unit)) {
          selectedDate.value = dayjs().add(amount, unit as any);
        }
      }
    }

    generateDateCode();
  } catch (error) {
    console.error("Error parsing smart date:", error);
  }
}

function applySmartSuggestion(text: string) {
  smartDateInput.value = text;
  parseSmartDate();
}

// Custom format handling
function applyCustomFormat() {
  generateDateCode();
}

function insertToken(token: string) {
  customFormat.value += token;
  applyCustomFormat();
}

// Generate the Templater code
function generateDateCode() {
  let code = "<% tp.";
  let format = activeFormatString.value;
  let dateToUse = selectedDate.value;

  // Apply offset if needed
  if (offsetAmount.value > 0) {
    dateToUse = dateToUse.add(offsetAmount.value, offsetUnit.value as any);
  }

  // Build code based on date source
  switch (dateSource.value) {
    case "now":
      if (activeTab.value === "today") {
        code += `date.now("${format}") %>`;
      } else if (activeTab.value === "smart" && smartDateInput.value) {
        code += `date.now("${format}") %>`;
      } else {
        // For calendar or other tabs, use the selected date
        const offset = dateToUse.diff(dayjs(), "day");
        if (offset === 0) {
          code += `date.now("${format}") %>`;
        } else {
          const sign = offset > 0 ? "+" : "";
          code += `date.now(${sign}${offset}days, "${format}") %>`;
        }
      }
      break;
    case "creation":
      code += `file.creation_date("${format}") %>`;
      break;
    case "modified":
      code += `file.last_modified_date("${format}") %>`;
      break;
  }

  updateContent([code]);
}

// Parse existing Templater code
function parseExistingCode(code: string) {
  try {
    // Remove the Templater tags
    const cleanCode = code.replace(/<%|%>/g, "").trim();

    // Default to 'today' tab and 'now' source
    activeTab.value = "today";
    dateSource.value = "now";

    // Try to extract format
    const formatMatch = cleanCode.match(/"([^"]+)"/);
    if (formatMatch) {
      const extractedFormat = formatMatch[1];

      // Check if format contains time
      includeTime.value =
        extractedFormat.includes("h:mm") || extractedFormat.includes("HH:mm");

      // Try to match with predefined formats
      const matchedFormat = dateFormats.find((f) => {
        const formatWithTime = includeTime.value
          ? `${f.format} h:mm A`
          : f.format;
        return formatWithTime === extractedFormat;
      });

      if (matchedFormat) {
        selectedFormat.value = matchedFormat.id;
      } else {
        // If no match, treat as custom format
        customFormat.value = extractedFormat;
        showAdvancedOptions.value = true;
      }
    }

    // Check for date sources
    if (cleanCode.includes("file.creation_date")) {
      dateSource.value = "creation";
      showAdvancedOptions.value = true;
    } else if (cleanCode.includes("file.last_modified_date")) {
      dateSource.value = "modified";
      showAdvancedOptions.value = true;
    } else if (cleanCode.includes("date.now")) {
      // Check for relative dates
      const relativeMatch = cleanCode.match(/date\.now\(([\+\-]\d+)(\w+)/);
      if (relativeMatch) {
        const offset = parseInt(relativeMatch[1]);
        const unit = relativeMatch[2].replace(/s$/, "");

        offsetAmount.value = Math.abs(offset);
        offsetUnit.value = unit as any;

        if (offset < 0) {
          // Past date - select a day in the past
          selectedDate.value = dayjs().subtract(Math.abs(offset), unit as any);
        } else {
          // Future date - select a day in the future
          selectedDate.value = dayjs().add(offset, unit as any);
        }

        // Switch to calendar tab for relative dates
        activeTab.value = "calendar";
      }
    }
  } catch (error) {
    console.error("Error parsing existing code:", error);
    // If parsing fails, just use defaults
  }
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}

// Watch for changes to update the code
watch(
  [
    activeTab,
    selectedDate,
    selectedFormat,
    includeTime,
    dateSource,
    offsetAmount,
    offsetUnit,
    customFormat,
  ],
  () => {
    generateDateCode();
  },
  { deep: true }
);
</script>

<style scoped>
.smart-date {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header styles */
.smart-date__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.smart-date__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.smart-date__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Tab navigation */
.smart-date__tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.smart-date__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.smart-date__tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.smart-date__tab--active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

/* Tab content panels */
.smart-date__content {
  min-height: 240px;
}

.smart-date__panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Format buttons */
.smart-date__format-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.smart-date__format-button {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 13px;
  color: #cbd5e1;
  transition: all 0.2s;
  cursor: pointer;
}

.smart-date__format-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.smart-date__format-button--active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

/* Time toggle */
.smart-date__time-toggle {
  display: flex;
  align-items: center;
}

.smart-date__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.smart-date__toggle-slider {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: 0.2s;
}

.smart-date__toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
}

.smart-date__toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.smart-date__toggle input:checked + .smart-date__toggle-slider {
  background: rgba(59, 130, 246, 0.5);
}

.smart-date__toggle input:checked + .smart-date__toggle-slider:before {
  transform: translateX(16px);
  background: #60a5fa;
}

.smart-date__toggle-label {
  font-size: 14px;
  color: #cbd5e1;
}

/* Calendar */
.smart-date__calendar {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.smart-date__calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.smart-date__calendar-title {
  font-weight: 500;
  font-size: 14px;
}

.smart-date__calendar-nav {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: none;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.smart-date__calendar-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.smart-date__calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(0, 0, 0, 0.2);
}

.smart-date__calendar-weekday {
  padding: 6px;
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}

.smart-date__calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(0, 0, 0, 0.1);
  gap: 1px;
}

.smart-date__calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  color: #cbd5e1;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.smart-date__calendar-day:hover {
  background: rgba(59, 130, 246, 0.15);
}

.smart-date__calendar-day--other-month {
  color: #64748b;
}

.smart-date__calendar-day--today {
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.5);
  font-weight: 500;
}

.smart-date__calendar-day--selected {
  background: rgba(59, 130, 246, 0.25);
  color: #fff;
  font-weight: 500;
}

/* Calendar offset */
.smart-date__calendar-offset {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.smart-date__offset-label {
  font-size: 14px;
  color: #94a3b8;
}

.smart-date__offset-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.smart-date__offset-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.smart-date__offset-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.smart-date__offset-input {
  width: 60px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 14px;
  color: #e2e8f0;
  text-align: center;
}

.smart-date__offset-select {
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 14px;
  color: #e2e8f0;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cbd5e1' d='M6 8.825L1.175 4 2.05 3.125 6 7.075 9.95 3.125 10.825 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 24px;
}

/* Smart input */
.smart-date__smart-input-container {
  position: relative;
}

.smart-date__smart-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 14px;
  color: #e2e8f0;
}

.smart-date__smart-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.smart-date__smart-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.smart-date__smart-suggestion {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  font-size: 13px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.smart-date__smart-suggestion:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

/* Advanced options */
.smart-date__advanced {
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.smart-date__advanced-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.smart-date__advanced-toggle:hover {
  color: #e2e8f0;
}

.smart-date__advanced-panel {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.smart-date__advanced-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.smart-date__advanced-title {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
}

.smart-date__source-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.smart-date__source-option {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 13px;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.smart-date__source-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.smart-date__source-option--active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

/* Custom format */
.smart-date__custom-format {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.smart-date__custom-format-input {
  display: flex;
  gap: 8px;
}

.smart-date__input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 14px;
  color: #e2e8f0;
}

.smart-date__input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

.smart-date__help-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.smart-date__help-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.smart-date__format-help {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.2s ease-in-out;
}

.smart-date__format-tokens {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.smart-date__format-token {
  display: flex;
  font-size: 13px;
}

.smart-date__token-name {
  width: 50px;
  padding: 2px 6px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  color: #60a5fa;
  font-family: monospace;
  cursor: pointer;
  transition: all 0.15s;
}

.smart-date__token-name:hover {
  background: rgba(59, 130, 246, 0.3);
}

.smart-date__token-desc {
  margin-left: 8px;
  color: #94a3b8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .smart-date__format-buttons,
  .smart-date__source-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .smart-date__format-tokens {
    grid-template-columns: 1fr;
  }

  .smart-date__calendar-offset {
    flex-direction: column;
  }

  .smart-date__offset-controls {
    flex-wrap: wrap;
  }
}
</style>
