<template>
  <node-view-wrapper class="dataview-wrapper">
    <div class="dataview-preview calendar-view">
      <div class="dataview-header">
        <strong>Dataview Calendar</strong>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>

      <div v-if="isLoading" class="loading-state">Loading calendar...</div>

      <div v-else class="calendar-grid-wrapper">
        <div class="calendar-header">
          <div class="calendar-month">
            <span class="month">{{ currentMonth }}</span>
            <span class="year">{{ currentYear }}</span>
          </div>
          <div class="calendar-controls">
            <button @click="changeMonth(-1)" :disabled="!isEditable">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="today-label" @click="isEditable && goToToday()">
              TODAY
            </span>
            <button @click="changeMonth(1)" :disabled="!isEditable">
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
            <ul class="cell-notes">
              <li v-for="(_, idx) in cell.notes" :key="idx" class="note-dot" />
            </ul>
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
import { executeCalendarQuery as executeCustomCalendarQuery } from "@/services/obsidian/calendarQueryAdapter.ts";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday as isTodayFn,
  format,
} from "date-fns";

const props = defineProps<NodeViewProps>();

// Reactive state
const isLoading = ref(true);
const error = ref("");
const calendarCells = ref<{ date: Date; notes: { title: string }[] }[]>([]);
const currentDate = ref(new Date());

// Computed properties
const isEditable = computed(() => props.editor?.isEditable ?? false);
const currentMonth = computed(() => format(currentDate.value, "MMM"));
const currentYear = computed(() => currentDate.value.getFullYear());
const query = computed(() => props.node.textContent.trim());

// Generate weekday headers using date-fns for consistency
const startOfWeekDay = new Date();
startOfWeekDay.setDate(startOfWeekDay.getDate() - startOfWeekDay.getDay());
const weekDays = Array.from({ length: 7 }, (_, i) =>
  format(addDays(startOfWeekDay, i), "EEE")
);

// Helper functions
const isToday = (date: Date) => isTodayFn(date);
const isCurrentMonth = (date: Date) =>
  date.getMonth() === currentDate.value.getMonth();

function changeMonth(offset: number) {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + offset);
  currentDate.value = newDate;
  executeCalendarQuery();
}

function goToToday() {
  currentDate.value = new Date();
  executeCalendarQuery();
}

/**
 * Fetch and display calendar data based on the current query
 */
async function executeCalendarQuery() {
  try {
    isLoading.value = true;
    error.value = "";
    calendarCells.value = [];

    console.log("[CalendarView] Executing query:", query.value);

    // Use our custom adapter to execute the query and get formatted results
    const notesByDate = await executeCustomCalendarQuery(query.value);

    console.log("[CalendarView] Generated calendar cells from query results");
    console.log(
      "[CalendarView] Number of dates with entries:",
      Object.keys(notesByDate).length
    );

    // Create calendar cells from the start of month to end of month
    const start = startOfWeek(startOfMonth(currentDate.value));
    const end = endOfWeek(endOfMonth(currentDate.value));
    const cells: { date: Date; notes: { title: string }[] }[] = [];

    let day = start;
    while (day <= end) {
      const key = day.toDateString();
      cells.push({ date: new Date(day), notes: notesByDate[key] || [] });
      day = addDays(day, 1);
    }

    calendarCells.value = cells;
    console.log(
      "[CalendarView] Calendar view updated with",
      cells.length,
      "cells"
    );
  } catch (err) {
    console.error("[CalendarView] Calendar query failed:", err);
    error.value = "Could not load calendar entries.";
  } finally {
    isLoading.value = false;
  }
}

// Initialize and update calendar
onMounted(executeCalendarQuery);
watch(() => props.node.textContent, executeCalendarQuery);
</script>

<style scoped>
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

.calendar-controls button {
  background: transparent;
  color: #ccc;
  border: none;
  font-size: 1em;
  cursor: pointer;
}

.calendar-controls button:disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: default;
}

.today-label {
  cursor: pointer;
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
  gap: 2px;
  margin-top: 4px;
  justify-content: flex-start;
}

.note-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a78bfa;
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

.content-container {
  display: none;
}
</style>
