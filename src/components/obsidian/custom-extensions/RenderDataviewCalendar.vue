<!-- src/components/obsidian/custom-extensions/RenderDataviewCalendar.vue -->
<template>
  <node-view-wrapper class="dataview-wrapper">
    <div class="dataview-preview calendar-view">
      <div class="dataview-header">
        <strong>Dataview Calendar</strong>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="isInitializingStore" class="loading-message">
          Loading vault data: {{ initProgress }}%
        </div>
      </div>

      <div v-if="isLoading || isInitializingStore" class="loading-state">
        Loading calendar...
      </div>

      <div v-else class="calendar-grid-wrapper">
        <div class="calendar-header">
          <div class="calendar-month">
            <span class="month">{{ currentMonth }}</span>
            <span class="year">{{ currentYear }}</span>
          </div>
          <div class="calendar-controls">
            <button @click="changeMonth(-1)" class="calendar-control-btn">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="today-label"> TODAY </span>
            <button @click="changeMonth(1)" class="calendar-control-btn">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div class="calendar-days">
          <div v-for="day in weekDays" :key="day" class="calendar-cell header">
            {{ day }}
          </div>
        </div>

        <div class="calendar-body">
          <div
            v-for="(cell, index) in calendarCells"
            :key="index"
            class="calendar-cell"
            :class="{
              today: isToday(cell.date),
              'outside-month': !isCurrentMonth(cell.date),
            }"
          >
            <div class="cell-date">{{ cell.date.getDate() }}</div>
            <div class="cell-notes">
              <div
                v-for="(_, idx) in cell.notes"
                :key="idx"
                class="note-dot"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <node-view-content as="pre" class="content-container" />
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/vue-3";
import { debounce } from "lodash-es";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  parseISO,
  format,
  isSameMonth,
} from "date-fns";

// Import the query engine components
import { QueryParser } from "@/obsidian/engine/queryParser";
import { QueryEngine } from "@/obsidian/engine/queryEngine";

// Import the DataStoreManager
import { useDataStoreManager } from "@/stores/dataStoreManager";

// Debug logging
console.log("[DataviewCalendar] Component initializing");

const props = defineProps<NodeViewProps>();

// Log the initial node content
console.log(
  "[DataviewCalendar] Initial node content:",
  props.node?.textContent
);

// Create query engine instances
const queryParser = new QueryParser();
const queryEngine = new QueryEngine();

// Use the DataStoreManager
const dataStoreManager = useDataStoreManager();
const isInitializingStore = computed(() => dataStoreManager.isLoading);
const initProgress = computed(() => dataStoreManager.initializationProgress);

// State
const isLoading = ref(true);
const error = ref("");
const calendarCells = ref<{ date: Date; notes: any[] }[]>([]);
const currentDate = ref(new Date());
const calendarDateField = ref<string | null>(null);

// Computed
const currentMonth = computed(() => format(currentDate.value, "MMM"));
const currentYear = computed(() => currentDate.value.getFullYear());
const query = computed(() => {
  const content = props.node?.textContent?.trim() || "";
  console.log("[DataviewCalendar] Current query computed:", content);
  return content;
});

// Generate weekday headers - match the original style
const startOfWeekDay = new Date();
startOfWeekDay.setDate(startOfWeekDay.getDate() - startOfWeekDay.getDay());
const weekDays = Array.from({ length: 7 }, (_, i) =>
  format(addDays(startOfWeekDay, i), "EEE")
);

// Helper functions
const isToday = (date: Date) => {
  const today = new Date();
  return isSameDay(date, today);
};

const isCurrentMonth = (date: Date) => {
  return isSameMonth(date, currentDate.value);
};

// Calendar navigation functions
function changeMonth(offset: number) {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + offset);
  currentDate.value = newDate;
  console.log(
    `[DataviewCalendar] Changed month to: ${format(
      currentDate.value,
      "MMMM yyyy"
    )}`
  );
  generateCalendarCells();
}

function goToToday() {
  currentDate.value = new Date();
  console.log("[DataviewCalendar] Reset to current month");
  generateCalendarCells();
}

// Parse the query to extract the date field
function parseCalendarQuery(queryString: string): string | null {
  const lines = queryString.split("\n");
  const calendarLine = lines.find((line) => line.trim().startsWith("CALENDAR"));

  if (!calendarLine) return null;

  const match = calendarLine.match(/^CALENDAR\s+(.+)$/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  return null;
}

function generateCalendarCells() {
  // Generate empty calendar cells for the current month
  const monthStart = startOfMonth(currentDate.value);
  const monthEnd = endOfMonth(currentDate.value);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const cells: { date: Date; notes: any[] }[] = [];

  let day = calStart;
  while (day <= calEnd) {
    cells.push({
      date: new Date(day),
      notes: [],
    });
    day = addDays(day, 1);
  }

  calendarCells.value = cells;

  // If we have data, populate the calendar
  populateCalendarWithNotes();
}

// Populate calendar with notes based on their dates
function populateCalendarWithNotes() {
  if (!dataStoreManager.isDataStoreReady || !calendarDateField.value) {
    return;
  }

  console.log("[DataviewCalendar] Populating calendar with notes");

  // Get all notes from the data store
  const allNotes = Array.from(dataStoreManager.dataStore.getAllNotes());

  // Process each note to find the ones that should appear on the calendar
  allNotes.forEach((noteData) => {
    try {
      // Extract the date value from the note using the calendar date field
      let dateValue: Date | null = null;

      // Handle different date field paths
      if (
        calendarDateField.value === "file.ctime" &&
        noteData.note.stat?.ctime
      ) {
        dateValue = new Date(noteData.note.stat.ctime);
      } else if (
        calendarDateField.value === "file.mtime" &&
        noteData.note.stat?.mtime
      ) {
        dateValue = new Date(noteData.note.stat.mtime);
      } else {
        // For custom date fields, check frontmatter or inline fields
        const fieldParts = calendarDateField.value.split(".");
        let value = null;

        // Check in frontmatter
        if (
          noteData.note.frontmatter &&
          fieldParts[0] in noteData.note.frontmatter
        ) {
          value = noteData.note.frontmatter[fieldParts[0]];
        }
        // Check in parsed inline fields
        else if (
          noteData.parsed?.inlineFields &&
          fieldParts[0] in noteData.parsed.inlineFields
        ) {
          value = noteData.parsed.inlineFields[fieldParts[0]];
        }

        // Parse the date value
        if (value && typeof value === "string") {
          try {
            dateValue = parseISO(value);
          } catch (e) {
            // Skip notes with invalid dates
          }
        } else if (value instanceof Date) {
          dateValue = value;
        }
      }

      // If we found a valid date, add this note to the corresponding calendar cell
      if (dateValue && !isNaN(dateValue.getTime())) {
        // Find the calendar cell for this date
        const cell = calendarCells.value.find((cell) =>
          isSameDay(cell.date, dateValue!)
        );
        if (cell) {
          cell.notes.push(noteData);
        }
      }
    } catch (e) {
      console.error("[DataviewCalendar] Error processing note:", e);
    }
  });

  console.log("[DataviewCalendar] Calendar populated with notes");
}

// Execute query and update calendar
const executeQuery = async () => {
  const currentQuery = query.value;
  console.log(
    "[DataviewCalendar] executeQuery called with query:",
    currentQuery
  );

  if (!currentQuery) {
    console.log("[DataviewCalendar] Query is empty, not executing");
    return;
  }

  try {
    console.log("[DataviewCalendar] Starting query execution");
    isLoading.value = true;
    error.value = "";

    // Extract the calendar date field from the query
    calendarDateField.value = parseCalendarQuery(currentQuery);
    console.log(
      "[DataviewCalendar] Calendar date field:",
      calendarDateField.value
    );

    if (!calendarDateField.value) {
      error.value = "Invalid calendar query: missing date field";
      console.error("[DataviewCalendar] Missing date field in query");
      return;
    }

    // Initialize data store if needed
    if (!dataStoreManager.isInitialized) {
      console.log("[DataviewCalendar] Initializing data store...");
      await dataStoreManager.initializeDataStore();
    }

    // Check if initialization was successful
    if (!dataStoreManager.isDataStoreReady) {
      console.log(
        "[DataviewCalendar] Data store initialization failed or is still in progress"
      );
      error.value = "Data store is not ready. Please try again.";
      return;
    }

    // Generate calendar cells
    generateCalendarCells();
  } catch (err: any) {
    console.error("[DataviewCalendar] Error executing dataview query:", err);
    console.error("[DataviewCalendar] Error stack:", err.stack);
    error.value = err.message || "Error executing query";
  } finally {
    isLoading.value = false;
    console.log("[DataviewCalendar] Query execution completed");
  }
};

// Set up watchers
onMounted(() => {
  console.log("[DataviewCalendar] Component mounted, executing initial query");
  // Initialize the DataStore when the component mounts
  dataStoreManager.initializeDataStore().then(() => {
    // Execute the query once the data store is initialized
    executeQuery();
  });
});

// Watch for query changes
watch(
  () => query.value,
  (newQuery, oldQuery) => {
    console.log("[DataviewCalendar] Query changed:", {
      from: oldQuery,
      to: newQuery,
      changed: newQuery !== oldQuery,
    });

    if (newQuery) {
      console.log("[DataviewCalendar] Executing query due to change");
      debouncedExecuteQuery();
    }
  }
);

// Also watch node content directly
watch(
  () => props.node?.textContent,
  (newContent, oldContent) => {
    console.log("[DataviewCalendar] Node textContent changed:", {
      from: oldContent,
      to: newContent,
      changed: newContent !== oldContent,
    });
  }
);

// Watch for data store changes that might affect our calendar
watch(
  () => dataStoreManager.isDataStoreReady,
  (isReady) => {
    if (isReady && calendarDateField.value) {
      console.log("[DataviewCalendar] DataStore is ready, populating calendar");
      populateCalendarWithNotes();
    }
  }
);

const debouncedExecuteQuery = debounce(() => {
  console.log("[DataviewCalendar] Debounced query execution triggered");
  // Only execute if the data store is ready
  if (dataStoreManager.isDataStoreReady) {
    executeQuery();
  } else if (!dataStoreManager.isLoading) {
    // If it's not ready and not loading, try to initialize it first
    dataStoreManager.initializeDataStore().then(() => {
      executeQuery();
    });
  }
}, 300);
</script>

<style>
/* Add some styles for the loading indicator */
.loading-message {
  font-size: 0.85em;
  color: #666;
  margin-left: 10px;
}
</style>

<style scoped>
.dataview-wrapper {
  display: block;
  margin: 1rem 0;
  border-radius: 4px;
  overflow: hidden;
}

.content-container {
  display: none;
}

.dataview-preview.calendar-view {
  font-family: system-ui, sans-serif;
  background: #1e1e1e;
  padding: 12px;
  border-radius: 6px;
  color: #fff;
}

.calendar-grid-wrapper {
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
  background-color: #1e1e1e;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #333;
}

.calendar-month {
  font-size: 1.5em;
  font-weight: 500;
}

.calendar-month .month {
  color: #fff;
  margin-right: 6px;
}

.calendar-month .year {
  color: #a78bfa;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calendar-control-btn {
  background: transparent;
  color: #ccc;
  border: none;
  font-size: 1em;
  cursor: pointer;
}

.today-label {
  font-size: 0.9em;
  color: #ccc;
}

.calendar-days,
.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-cell {
  border: 1px solid #2a2a2a;
  min-height: 60px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #ddd;
  background: #1e1e1e;
}

.calendar-cell.header {
  background: #1e1e1e;
  font-weight: bold;
  text-align: center;
  color: #888;
  padding: 6px 0;
}

.calendar-cell.outside-month {
  opacity: 0.3;
}

.cell-date {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
  text-align: center; /* center text */
  margin-bottom: 4px;
}

.cell-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 6px;
  justify-content: center; /* Center the dots horizontally */
  align-items: center; /* Center vertically */
}

.note-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
}

.today {
  border: 1px solid #a78bfa;
  background: rgba(167, 139, 250, 0.1);
}

.loading-state {
  font-style: italic;
  color: #aaa;
}

.error-message {
  color: #ef4444;
  margin-top: 8px;
  font-size: 0.9em;
}

.dataview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: var(--background-secondary, #1e1e1e);
  color: var(--text-normal, #dcddde);
}
</style>
