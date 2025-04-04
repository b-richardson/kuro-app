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
    <div class="date-module">
      <!-- Module Header -->
      <div class="date-module__header">
        <div class="date-module__header-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="date-module__header-title">Date & Time</div>
      </div>

      <!-- Tab Navigation -->
      <div class="date-module__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="date-module__tab"
          :class="{ 'date-module__tab--active': activeTab === tab.id }"
          @click="setActiveTab(tab.id)"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="date-module__content">
        <!-- Today Tab -->
        <div v-if="activeTab === 'today'" class="date-module__panel">
          <div class="date-module__format-grid">
            <button
              v-for="format in dateFormats"
              :key="format.id"
              class="date-module__format-button"
              :class="{
                'date-module__format-button--active':
                  selectedFormat === format.id,
              }"
              @click="selectFormat(format.id)"
            >
              <div class="date-module__format-name">{{ format.name }}</div>
              <div class="date-module__format-example">
                {{ format.example }}
              </div>
            </button>
          </div>

          <div class="date-module__time-toggle">
            <label class="date-module__toggle">
              <input
                type="checkbox"
                v-model="includeTime"
                @change="generateDateCode"
              />
              <span class="date-module__toggle-slider"></span>
              <span class="date-module__toggle-label">Include time</span>
            </label>
          </div>
        </div>

        <!-- Calendar Tab -->
        <div v-if="activeTab === 'calendar'" class="date-module__panel">
          <div class="date-module__calendar">
            <div class="date-module__calendar-header">
              <button @click="previousMonth" class="date-module__calendar-nav">
                <i class="fas fa-chevron-left"></i>
              </button>
              <div class="date-module__calendar-title">
                {{ currentMonthName }} {{ currentYear }}
              </div>
              <button @click="nextMonth" class="date-module__calendar-nav">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <div class="date-module__calendar-weekdays">
              <div
                v-for="day in weekDays"
                :key="day"
                class="date-module__calendar-weekday"
              >
                {{ day }}
              </div>
            </div>

            <div class="date-module__calendar-days">
              <button
                v-for="(day, index) in calendarDays"
                :key="index"
                class="date-module__calendar-day"
                :class="{
                  'date-module__calendar-day--other-month': !day.currentMonth,
                  'date-module__calendar-day--selected': isSelectedDay(
                    day.date
                  ),
                  'date-module__calendar-day--today': isToday(day.date),
                }"
                @click="selectDay(day.date)"
              >
                {{ day.day }}
              </button>
            </div>
          </div>

          <div class="date-module__calendar-offset">
            <div class="date-module__offset-label">Adjust date:</div>
            <div class="date-module__offset-controls">
              <button
                @click="adjustOffset(-1)"
                class="date-module__offset-button"
              >
                <i class="fas fa-minus"></i>
              </button>
              <input
                type="number"
                v-model.number="offsetAmount"
                class="date-module__offset-input"
                min="0"
                max="999"
                @change="generateDateCode"
              />
              <select
                v-model="offsetUnit"
                @change="generateDateCode"
                class="date-module__offset-select"
              >
                <option value="day">day(s)</option>
                <option value="week">week(s)</option>
                <option value="month">month(s)</option>
              </select>
              <button
                @click="adjustOffset(1)"
                class="date-module__offset-button"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div class="date-module__format-buttons">
            <button
              v-for="format in dateFormats"
              :key="format.id"
              class="date-module__format-button"
              :class="{
                'date-module__format-button--active':
                  selectedFormat === format.id,
              }"
              @click="selectFormat(format.id)"
            >
              {{ format.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Input Label Field -->
      <div class="date-module__label-field">
        <div class="date-module__label-heading">Label (optional)</div>
        <input
          type="text"
          v-model="dateLabel"
          @input="generateDateCode"
          class="date-module__label-input"
          placeholder="e.g., Created: "
        />
      </div>

      <!-- Advanced Options (expandable) -->
      <div class="date-module__advanced">
        <button
          class="date-module__advanced-toggle"
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

        <div v-if="showAdvancedOptions" class="date-module__advanced-panel">
          <div class="date-module__advanced-section">
            <div class="date-module__advanced-title">Date Source</div>
            <div class="date-module__source-options">
              <button
                v-for="source in dateSources"
                :key="source.id"
                class="date-module__source-option"
                :class="{
                  'date-module__source-option--active':
                    dateSource === source.id,
                }"
                @click="setDateSource(source.id)"
              >
                {{ source.name }}
              </button>
            </div>
          </div>

          <div class="date-module__advanced-section">
            <div class="date-module__advanced-title">Custom Format</div>
            <div class="date-module__custom-format">
              <div class="date-module__custom-format-input">
                <input
                  type="text"
                  v-model="customFormat"
                  @input="applyCustomFormat"
                  class="date-module__input"
                  placeholder="e.g., YYYY-MM-DD HH:mm"
                />
                <button
                  class="date-module__help-btn"
                  @click="showFormatHelp = !showFormatHelp"
                  title="Format help"
                >
                  <i class="fas fa-question-circle"></i>
                </button>
              </div>

              <div v-if="showFormatHelp" class="date-module__format-help">
                <div class="date-module__format-tokens">
                  <div
                    v-for="token in formatTokens"
                    :key="token.token"
                    class="date-module__format-token"
                  >
                    <div
                      class="date-module__token-name"
                      @click="insertToken(token.token)"
                    >
                      {{ token.token }}
                    </div>
                    <div class="date-module__token-desc">
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
import customParseFormat from "dayjs/plugin/customParseFormat";

// Initialize dayjs plugins
dayjs.extend(weekday);
dayjs.extend(advancedFormat);
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
const dateLabel = ref("");

// Tabs configuration
const tabs = [
  { id: "today", label: "Today", icon: "fas fa-clock" },
  { id: "calendar", label: "Calendar", icon: "fas fa-calendar" },
];

// Date formats
const dateFormats = [
  {
    id: "simple",
    name: "Simple",
    format: "MMM D, YYYY",
    example: "Apr 3, 2025",
  },
  { id: "short", name: "Short", format: "MM/DD/YYYY", example: "04/03/2025" },
  {
    id: "full",
    name: "Full",
    format: "dddd, MMMM D, YYYY",
    example: "Thursday, April 3, 2025",
  },
  { id: "iso", name: "ISO", format: "YYYY-MM-DD", example: "2025-04-03" },
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
  let code = "";

  console.log("Calendar date selected:", {
    selectedDate: selectedDate.value.format("YYYY-MM-DD"),
    today: dayjs().format("YYYY-MM-DD"),
    offset: selectedDate.value.diff(dayjs(), "day"),
    activeTab: activeTab.value,
    offsetAmount: offsetAmount.value,
  });

  // Start with the Templater code
  let templaterCode = "<% tp.";
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
        templaterCode += `date.now("${format}") %>`;
      } else {
        // REPLACE THIS SECTION WITH THE FIX:
        // For calendar tab, use the selected date
        // Get start-of-day versions of both dates to avoid time component issues
        const todayStart = dayjs().startOf("day");
        const selectedStart = dateToUse.startOf("day");

        // Calculate offset properly using full days
        const offset = selectedStart.diff(todayStart, "day");

        console.log("Calendar offset calculation:", {
          selectedDate: selectedStart.format("YYYY-MM-DD"),
          today: todayStart.format("YYYY-MM-DD"),
          calculatedOffset: offset,
          selectedTimestamp: selectedStart.valueOf(),
          todayTimestamp: todayStart.valueOf(),
        });

        if (offset === 0) {
          templaterCode += `date.now("${format}") %>`;
        } else {
          const sign = offset > 0 ? "+" : "";
          templaterCode += `date.now(${sign}${offset}days, "${format}") %>`;
        }
      }
      break;
    case "creation":
      templaterCode += `file.creation_date("${format}") %>`;
      break;
    case "modified":
      templaterCode += `file.last_modified_date("${format}") %>`;
      break;
  }

  // Add label only if it exists
  if (dateLabel.value.trim()) {
    code = dateLabel.value.trim() + " " + templaterCode;
  } else {
    code = templaterCode;
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

function formatDateExample(formatString: string) {
  // Using the currently selected date to show the example
  return selectedDate.value.format(formatString);
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
.date-module {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header styles */
.date-module__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.date-module__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.date-module__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Tab navigation */
.date-module__tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.date-module__tab {
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

.date-module__tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.date-module__tab--active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

/* Tab content panels */
.date-module__content {
  min-height: 240px;
}

.date-module__panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-module__format-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2x2 grid */
  gap: 8px;
  width: 100%;
}

.date-module__format-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.date-module__format-example {
  font-size: 12px;
  color: #94a3b8; /* Lighter color for the example */
  white-space: nowrap; /* Prevent wrapping */
  overflow: hidden;
  text-overflow: ellipsis; /* Add ellipsis if text is too long */
  max-width: 100%;
}

/* Format buttons */
.date-module__format-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.date-module__format-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 13px;
  color: #cbd5e1;
  transition: all 0.2s;
  cursor: pointer;
}

.date-module__format-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.date-module__format-button--active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

.date-module__format-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.date-module__format-example {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}

/* Time toggle */
.date-module__time-toggle {
  display: flex;
  align-items: center;
}

.date-module__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.date-module__toggle-slider {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: 0.2s;
}

.date-module__toggle-slider:before {
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

.date-module__toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.date-module__toggle input:checked + .date-module__toggle-slider {
  background: rgba(59, 130, 246, 0.5);
}

.date-module__toggle input:checked + .date-module__toggle-slider:before {
  transform: translateX(16px);
  background: #60a5fa;
}

.date-module__toggle-label {
  font-size: 14px;
  color: #cbd5e1;
}

/* Calendar */
.date-module__calendar {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.date-module__calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.date-module__calendar-title {
  font-weight: 500;
  font-size: 14px;
}

.date-module__calendar-nav {
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

.date-module__calendar-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.date-module__calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(0, 0, 0, 0.2);
}

.date-module__calendar-weekday {
  padding: 6px;
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}

.date-module__calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(0, 0, 0, 0.1);
  gap: 1px;
}

.date-module__calendar-day {
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

.date-module__calendar-day:hover {
  background: rgba(59, 130, 246, 0.15);
}

.date-module__calendar-day--other-month {
  color: #64748b;
}

.date-module__calendar-day--today {
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.5);
  font-weight: 500;
}

.date-module__calendar-day--selected {
  background: rgba(59, 130, 246, 0.25);
  color: #fff;
  font-weight: 500;
}

/* Calendar offset */
.date-module__calendar-offset {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-module__offset-label {
  font-size: 14px;
  color: #94a3b8;
}

.date-module__offset-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-module__offset-button {
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

.date-module__offset-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.date-module__offset-input {
  width: 60px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 14px;
  color: #e2e8f0;
  text-align: center;
}

.date-module__offset-select {
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

/* Advanced options */
.date-module__advanced {
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.date-module__advanced-toggle {
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

.date-module__advanced-toggle:hover {
  color: #e2e8f0;
}

.date-module__advanced-panel {
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

.date-module__advanced-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-module__advanced-title {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
}

.date-module__source-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.date-module__source-option {
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

.date-module__source-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.date-module__source-option--active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

/* Custom format */
.date-module__custom-format {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-module__custom-format-input {
  display: flex;
  gap: 8px;
}

.date-module__input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 14px;
  color: #e2e8f0;
}

.date-module__input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

.date-module__help-btn {
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

.date-module__help-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.date-module__format-help {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.2s ease-in-out;
}

.date-module__format-tokens {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.date-module__format-token {
  display: flex;
  font-size: 13px;
}

.date-module__token-name {
  width: 50px;
  padding: 2px 6px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  color: #60a5fa;
  font-family: monospace;
  cursor: pointer;
  transition: all 0.15s;
}

.date-module__token-name:hover {
  background: rgba(59, 130, 246, 0.3);
}

.date-module__token-desc {
  margin-left: 8px;
  color: #94a3b8;
}

/* Label Field Styles */
.date-module__label-field {
  margin-top: 16px;
  margin-bottom: 12px;
}

.date-module__label-heading {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.date-module__label-input-container {
  position: relative;
  display: flex;
}

.date-module__label-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 14px;
  color: #e2e8f0;
}

.date-module__label-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.date-module__label-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  color: #94a3b8;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.date-module__label-clear:hover {
  background: rgba(0, 0, 0, 0.5);
  color: #e2e8f0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .date-module__format-buttons,
  .date-module__source-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .date-module__format-tokens {
    grid-template-columns: 1fr;
  }

  .date-module__calendar-offset {
    flex-direction: column;
  }

  .date-module__offset-controls {
    flex-wrap: wrap;
  }
}
</style>
