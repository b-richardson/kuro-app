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
    <div class="conditional">
      <!-- Module Header -->
      <div class="conditional__header">
        <div class="conditional__header-icon">
          <i class="fas fa-code-branch"></i>
        </div>
        <div class="conditional__header-title">Conditional Content</div>
      </div>

      <!-- Condition Builder -->
      <div class="conditional__builder">
        <div class="conditional__explanation">
          <div class="conditional__explanation-icon">
            <i class="fas fa-lightbulb"></i>
          </div>
          <div class="conditional__explanation-text">
            Show different content based on conditions like file properties,
            dates, or user inputs.
          </div>
        </div>

        <!-- IF statement -->
        <div class="conditional__if-block">
          <div class="conditional__if-header">IF</div>

          <!-- Condition Type Selector -->
          <div class="conditional__condition-type">
            <label class="conditional__label">Condition Type</label>
            <select
              class="conditional__select"
              v-model="conditionType"
              @change="updateCondition"
            >
              <option value="file">File Property</option>
              <option value="date">Date</option>
              <option value="variable">Variable/User Input</option>
              <option value="custom">Custom Expression</option>
            </select>
          </div>

          <!-- File Property Conditions -->
          <div
            v-if="conditionType === 'file'"
            class="conditional__condition-group"
          >
            <div class="conditional__field-row">
              <select
                class="conditional__select"
                v-model="fileCondition.property"
                @change="updateCondition"
              >
                <option value="title">File Title</option>
                <option value="path">File Path</option>
                <option value="folder">Folder Name</option>
                <option value="tag">Has Tag</option>
                <option value="extension">File Extension</option>
              </select>

              <select
                class="conditional__select"
                v-model="fileCondition.operator"
                @change="updateCondition"
              >
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="startsWith">Starts With</option>
                <option value="endsWith">Ends With</option>
                <option value="matches">Matches Regex</option>
              </select>

              <input
                type="text"
                class="conditional__text-input"
                v-model="fileCondition.value"
                @input="updateCondition"
                :placeholder="getFileConditionPlaceholder()"
              />
            </div>
          </div>

          <!-- Date Conditions -->
          <div
            v-if="conditionType === 'date'"
            class="conditional__condition-group"
          >
            <div class="conditional__field-row">
              <select
                class="conditional__select"
                v-model="dateCondition.property"
                @change="updateCondition"
              >
                <option value="created">Creation Date</option>
                <option value="modified">Modified Date</option>
                <option value="now">Current Date</option>
              </select>

              <select
                class="conditional__select"
                v-model="dateCondition.operator"
                @change="updateCondition"
              >
                <option value="equals">Is</option>
                <option value="before">Is Before</option>
                <option value="after">Is After</option>
                <option value="same-day">Is Same Day As</option>
                <option value="same-month">Is Same Month As</option>
                <option value="same-year">Is Same Year As</option>
              </select>
            </div>

            <!-- Date Comparison Type -->
            <div class="conditional__radio-group">
              <label class="conditional__radio">
                <input
                  type="radio"
                  v-model="dateCondition.compareType"
                  value="fixed"
                  @change="updateCondition"
                />
                <span>Specific Date</span>
              </label>
              <label class="conditional__radio">
                <input
                  type="radio"
                  v-model="dateCondition.compareType"
                  value="relative"
                  @change="updateCondition"
                />
                <span>Relative Date</span>
              </label>
            </div>

            <!-- Fixed Date Input -->
            <div
              v-if="dateCondition.compareType === 'fixed'"
              class="conditional__date-input"
            >
              <input
                type="date"
                class="conditional__date-picker"
                v-model="dateCondition.fixedDate"
                @change="updateCondition"
              />
            </div>

            <!-- Relative Date Input -->
            <div
              v-if="dateCondition.compareType === 'relative'"
              class="conditional__relative-date"
            >
              <div class="conditional__field-row">
                <select
                  class="conditional__select"
                  v-model="dateCondition.direction"
                  @change="updateCondition"
                >
                  <option value="-">Past</option>
                  <option value="+">Future</option>
                </select>

                <input
                  type="number"
                  class="conditional__number-input"
                  v-model.number="dateCondition.amount"
                  min="0"
                  @input="updateCondition"
                />

                <select
                  class="conditional__select"
                  v-model="dateCondition.unit"
                  @change="updateCondition"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Variable/User Input Conditions -->
          <div
            v-if="conditionType === 'variable'"
            class="conditional__condition-group"
          >
            <div class="conditional__field-row">
              <input
                type="text"
                class="conditional__text-input"
                v-model="variableCondition.name"
                @input="updateCondition"
                placeholder="Variable name"
              />

              <select
                class="conditional__select"
                v-model="variableCondition.operator"
                @change="updateCondition"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="greater">Is Greater Than</option>
                <option value="less">Is Less Than</option>
                <option value="empty">Is Empty</option>
                <option value="not-empty">Is Not Empty</option>
              </select>

              <input
                v-if="
                  !['empty', 'not-empty'].includes(variableCondition.operator)
                "
                type="text"
                class="conditional__text-input"
                v-model="variableCondition.value"
                @input="updateCondition"
                placeholder="Compare value"
              />
            </div>

            <div class="conditional__tip">
              <i class="fas fa-info-circle"></i>
              <span
                >Variables come from User Input modules or other template
                variables</span
              >
            </div>
          </div>

          <!-- Custom Expression -->
          <div
            v-if="conditionType === 'custom'"
            class="conditional__condition-group"
          >
            <div class="conditional__field-row">
              <input
                type="text"
                class="conditional__text-input conditional__text-input--wide"
                v-model="customCondition.expression"
                @input="updateCondition"
                placeholder="Enter Templater expression (e.g., tp.file.title.includes('Meeting'))"
              />
            </div>

            <div class="conditional__tip">
              <i class="fas fa-info-circle"></i>
              <span
                >For advanced users: enter a full Templater expression that
                evaluates to true/false</span
              >
            </div>
          </div>
        </div>

        <!-- THEN Content -->
        <div class="conditional__content-block">
          <div class="conditional__content-header">THEN</div>

          <div class="conditional__content-area">
            <textarea
              class="conditional__content-textarea"
              v-model="thenContent"
              @input="updateCode"
              placeholder="Enter content to show when condition is true"
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- ELSE Content (optional) -->
        <div class="conditional__content-block">
          <div
            class="conditional__content-header conditional__content-header--else"
          >
            <div>ELSE</div>
            <div class="conditional__toggle">
              <input
                type="checkbox"
                id="useElse"
                v-model="useElse"
                @change="updateCode"
              />
              <label for="useElse">Include alternate content</label>
            </div>
          </div>

          <div v-if="useElse" class="conditional__content-area">
            <textarea
              class="conditional__content-textarea"
              v-model="elseContent"
              @input="updateCode"
              placeholder="Enter content to show when condition is false"
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import dayjs from "dayjs";

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

// Condition state
const conditionType = ref("file");
const useElse = ref(false);
const thenContent = ref("");
const elseContent = ref("");

// File property condition
const fileCondition = ref({
  property: "title",
  operator: "contains",
  value: "",
});

// Date condition
const dateCondition = ref({
  property: "created",
  operator: "equals",
  compareType: "fixed",
  fixedDate: dayjs().format("YYYY-MM-DD"),
  direction: "-",
  amount: 1,
  unit: "days",
});

// Variable condition
const variableCondition = ref({
  name: "",
  operator: "equals",
  value: "",
});

// Custom expression condition
const customCondition = ref({
  expression: "",
});

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingCode(props.module.content[0]);
  } else {
    // Generate initial code
    updateCode();
  }
});

// Update condition type
function updateCondition() {
  updateCode();
}

// Get placeholder text for file condition
function getFileConditionPlaceholder() {
  switch (fileCondition.value.property) {
    case "title":
      return "e.g., Meeting Notes";
    case "path":
      return "e.g., Projects/";
    case "folder":
      return "e.g., Work";
    case "tag":
      return "e.g., #project";
    case "extension":
      return "e.g., md";
    default:
      return "Enter value";
  }
}

// Generate the Templater code for the condition
function generateConditionCode() {
  let condition = "";

  switch (conditionType.value) {
    case "file":
      condition = generateFileConditionCode();
      break;
    case "date":
      condition = generateDateConditionCode();
      break;
    case "variable":
      condition = generateVariableConditionCode();
      break;
    case "custom":
      condition = customCondition.value.expression;
      break;
  }

  return condition;
}

// Generate code for file property conditions
function generateFileConditionCode() {
  const property = fileCondition.value.property;
  const operator = fileCondition.value.operator;
  const value = fileCondition.value.value;

  let propCode = "";

  switch (property) {
    case "title":
      propCode = "tp.file.title";
      break;
    case "path":
      propCode = "tp.file.path";
      break;
    case "folder":
      propCode = "tp.file.folder";
      break;
    case "tag":
      // Special handling for tags
      if (operator === "contains") {
        return `tp.file.tags.includes("${value.replace(/^#/, "")}")`;
      }
      return `tp.file.tags`;
    case "extension":
      propCode = "tp.file.extension";
      break;
  }

  // Build the operator part
  switch (operator) {
    case "contains":
      return `${propCode}.includes("${value}")`;
    case "equals":
      return `${propCode} === "${value}"`;
    case "startsWith":
      return `${propCode}.startsWith("${value}")`;
    case "endsWith":
      return `${propCode}.endsWith("${value}")`;
    case "matches":
      return `${propCode}.match(/${value}/)`;
    default:
      return `${propCode}.includes("${value}")`;
  }
}

// Generate code for date conditions
function generateDateConditionCode() {
  const property = dateCondition.value.property;
  const operator = dateCondition.value.operator;

  let dateCode = "";

  // Get the base date property
  switch (property) {
    case "created":
      dateCode = "tp.file.creation_date";
      break;
    case "modified":
      dateCode = "tp.file.last_modified_date";
      break;
    case "now":
      dateCode = "tp.date.now";
      break;
  }

  // Format the comparison date based on fixed or relative
  let compareDate = "";
  if (dateCondition.value.compareType === "fixed") {
    compareDate = `"${dateCondition.value.fixedDate}"`;
  } else {
    // For relative dates, use direction, amount, and unit
    const direction = dateCondition.value.direction;
    const amount = dateCondition.value.amount;
    const unit = dateCondition.value.unit;

    compareDate = `tp.date.now("YYYY-MM-DD", "${direction}${amount}${unit}")`;
  }

  // Build the comparison expression
  switch (operator) {
    case "equals":
      return `moment(${dateCode}("YYYY-MM-DD")).isSame(moment(${compareDate}))`;
    case "before":
      return `moment(${dateCode}("YYYY-MM-DD")).isBefore(moment(${compareDate}))`;
    case "after":
      return `moment(${dateCode}("YYYY-MM-DD")).isAfter(moment(${compareDate}))`;
    case "same-day":
      return `moment(${dateCode}("YYYY-MM-DD")).isSame(moment(${compareDate}), "day")`;
    case "same-month":
      return `moment(${dateCode}("YYYY-MM-DD")).isSame(moment(${compareDate}), "month")`;
    case "same-year":
      return `moment(${dateCode}("YYYY-MM-DD")).isSame(moment(${compareDate}), "year")`;
    default:
      return `moment(${dateCode}("YYYY-MM-DD")).isSame(moment(${compareDate}))`;
  }
}

// Generate code for variable conditions
function generateVariableConditionCode() {
  const name = variableCondition.value.name;
  const operator = variableCondition.value.operator;
  const value = variableCondition.value.value;

  // Handle special empty/not-empty cases
  if (operator === "empty") {
    return `!${name} || ${name}.trim() === ""`;
  }

  if (operator === "not-empty") {
    return `${name} && ${name}.trim() !== ""`;
  }

  // Handle other operators
  switch (operator) {
    case "equals":
      return `${name} === "${value}"`;
    case "contains":
      return `${name} && ${name}.includes("${value}")`;
    case "greater":
      return `${name} > ${isNaN(Number(value)) ? `"${value}"` : value}`;
    case "less":
      return `${name} < ${isNaN(Number(value)) ? `"${value}"` : value}`;
    default:
      return `${name} === "${value}"`;
  }
}

// Generate the full Templater code
function updateCode() {
  const condition = generateConditionCode();

  let code = `<% if (${condition}) { %>\n${thenContent.value}`;

  if (useElse.value) {
    code += `\n<% } else { %>\n${elseContent.value}`;
  }

  code += "\n<% } %>";

  updateContent([code]);
}

// Parse existing Templater code
function parseExistingCode(code: string) {
  try {
    // Extract the condition part
    const conditionMatch = code.match(/<% if \((.*?)\) {/s);
    if (conditionMatch) {
      const conditionExpression = conditionMatch[1];

      // Try to determine the condition type and parse it
      if (conditionExpression.includes("tp.file")) {
        parseFileCondition(conditionExpression);
      } else if (
        conditionExpression.includes("moment") ||
        conditionExpression.includes("tp.date")
      ) {
        parseDateCondition(conditionExpression);
      } else if (
        conditionExpression.includes("includes") ||
        conditionExpression.includes("===") ||
        conditionExpression.includes("<") ||
        conditionExpression.includes(">")
      ) {
        // Check if it's likely a variable condition
        if (
          !conditionExpression.includes("tp.") &&
          !conditionExpression.match(/\(\)/)
        ) {
          parseVariableCondition(conditionExpression);
        } else {
          // Assume it's a custom expression
          conditionType.value = "custom";
          customCondition.value.expression = conditionExpression;
        }
      } else {
        // Default to custom if we can't determine the type
        conditionType.value = "custom";
        customCondition.value.expression = conditionExpression;
      }

      // Extract the then content
      const thenMatch = code.match(
        /<% if \(.*?\) { %>\n(.*?)(?:\n<% } else { %>|\n<% } %>)/s
      );
      if (thenMatch) {
        thenContent.value = thenMatch[1];
      }

      // Check for else content
      if (code.includes("<% } else { %>")) {
        useElse.value = true;
        const elseMatch = code.match(/<% } else { %>\n(.*?)\n<% } %>/s);
        if (elseMatch) {
          elseContent.value = elseMatch[1];
        }
      }
    }
  } catch (error) {
    console.error("Error parsing existing code:", error);
    // If parsing fails, just use defaults
    updateCode();
  }
}

// Parse file property condition
function parseFileCondition(expression: string) {
  conditionType.value = "file";

  if (expression.includes("tp.file.title")) {
    fileCondition.value.property = "title";
  } else if (expression.includes("tp.file.path")) {
    fileCondition.value.property = "path";
  } else if (expression.includes("tp.file.folder")) {
    fileCondition.value.property = "folder";
  } else if (expression.includes("tp.file.tags")) {
    fileCondition.value.property = "tag";
  } else if (expression.includes("tp.file.extension")) {
    fileCondition.value.property = "extension";
  }

  if (expression.includes(".includes(")) {
    fileCondition.value.operator = "contains";
    const valueMatch = expression.match(/\.includes\("([^"]+)"\)/);
    if (valueMatch) {
      fileCondition.value.value = valueMatch[1];
    }
  } else if (expression.includes("===")) {
    fileCondition.value.operator = "equals";
    const valueMatch = expression.match(/=== "([^"]+)"/);
    if (valueMatch) {
      fileCondition.value.value = valueMatch[1];
    }
  } else if (expression.includes(".startsWith(")) {
    fileCondition.value.operator = "startsWith";
    const valueMatch = expression.match(/\.startsWith\("([^"]+)"\)/);
    if (valueMatch) {
      fileCondition.value.value = valueMatch[1];
    }
  } else if (expression.includes(".endsWith(")) {
    fileCondition.value.operator = "endsWith";
    const valueMatch = expression.match(/\.endsWith\("([^"]+)"\)/);
    if (valueMatch) {
      fileCondition.value.value = valueMatch[1];
    }
  } else if (expression.includes(".match(")) {
    fileCondition.value.operator = "matches";
    const valueMatch = expression.match(/\.match\(\/(.*?)\/\)/);
    if (valueMatch) {
      fileCondition.value.value = valueMatch[1];
    }
  }
}

// Parse date condition
function parseDateCondition(expression: string) {
  conditionType.value = "date";

  if (expression.includes("tp.file.creation_date")) {
    dateCondition.value.property = "created";
  } else if (expression.includes("tp.file.last_modified_date")) {
    dateCondition.value.property = "modified";
  } else if (expression.includes("tp.date.now")) {
    dateCondition.value.property = "now";
  }

  if (expression.includes(".isSame(") && !expression.includes(", ")) {
    dateCondition.value.operator = "equals";
  } else if (expression.includes(".isBefore(")) {
    dateCondition.value.operator = "before";
  } else if (expression.includes(".isAfter(")) {
    dateCondition.value.operator = "after";
  } else if (
    expression.includes(".isSame(") &&
    expression.includes(', "day"')
  ) {
    dateCondition.value.operator = "same-day";
  } else if (
    expression.includes(".isSame(") &&
    expression.includes(', "month"')
  ) {
    dateCondition.value.operator = "same-month";
  } else if (
    expression.includes(".isSame(") &&
    expression.includes(', "year"')
  ) {
    dateCondition.value.operator = "same-year";
  }

  // Try to determine if it's a fixed or relative date
  if (expression.includes('tp.date.now("YYYY-MM-DD", "')) {
    dateCondition.value.compareType = "relative";

    // Try to extract the relative components
    const relativeMatch = expression.match(
      /tp\.date\.now\("YYYY-MM-DD", "([\+\-])(\d+)(\w+)"\)/
    );
    if (relativeMatch) {
      dateCondition.value.direction = relativeMatch[1];
      dateCondition.value.amount = parseInt(relativeMatch[2]);
      dateCondition.value.unit = relativeMatch[3];
    }
  } else {
    dateCondition.value.compareType = "fixed";

    // Try to extract the fixed date
    const fixedMatch = expression.match(/moment\("([^"]+)"\)/);
    if (fixedMatch) {
      dateCondition.value.fixedDate = fixedMatch[1];
    }
  }
}

// Parse variable condition
function parseVariableCondition(expression: string) {
  conditionType.value = "variable";

  // Try to extract variable name
  const nameMatch = expression.match(/^([a-zA-Z0-9_]+)(?:\.|\s|$)/);
  if (nameMatch) {
    variableCondition.value.name = nameMatch[1];
  }

  // Determine operator and value
  if (expression.includes("===")) {
    variableCondition.value.operator = "equals";
    const valueMatch = expression.match(/=== "([^"]+)"/);
    if (valueMatch) {
      variableCondition.value.value = valueMatch[1];
    }
  } else if (expression.includes(".includes(")) {
    variableCondition.value.operator = "contains";
    const valueMatch = expression.match(/\.includes\("([^"]+)"\)/);
    if (valueMatch) {
      variableCondition.value.value = valueMatch[1];
    }
  } else if (expression.includes(">")) {
    variableCondition.value.operator = "greater";
    const valueMatch = expression.match(/> (?:"([^"]+)"|(\d+))/);
    if (valueMatch) {
      variableCondition.value.value = valueMatch[1] || valueMatch[2];
    }
  } else if (expression.includes("<")) {
    variableCondition.value.operator = "less";
    const valueMatch = expression.match(/< (?:"([^"]+)"|(\d+))/);
    if (valueMatch) {
      variableCondition.value.value = valueMatch[1] || valueMatch[2];
    }
  } else if (expression.includes("!") && expression.includes('=== ""')) {
    variableCondition.value.operator = "not-empty";
  } else if (expression.includes('=== ""')) {
    variableCondition.value.operator = "empty";
  }
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}

// Watch for changes to update the code
watch([thenContent, elseContent, useElse], () => {
  updateCode();
});
</script>

<style scoped>
.conditional {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.conditional__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.conditional__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.conditional__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Builder container */
.conditional__builder {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Explanation box */
.conditional__explanation {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.conditional__explanation-icon {
  color: #60a5fa;
  font-size: 16px;
  flex-shrink: 0;
}

.conditional__explanation-text {
  font-size: 14px;
  color: #cbd5e1;
  line-height: 1.5;
}

/* IF Block */
.conditional__if-block {
  padding: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conditional__if-header {
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  width: fit-content;
  color: #60a5fa;
  margin-bottom: 8px;
}

/* Condition type selector */
.conditional__condition-type {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Condition groups */
.conditional__condition-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Field layout */
.conditional__field-row {
  display: flex;
  gap: 8px;
}

.conditional__label {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 4px;
}

/* Form controls */
.conditional__select {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  flex: 1;
  min-width: 0;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cbd5e1' d='M6 8.825L1.175 4 2.05 3.125 6 7.075 9.95 3.125 10.825 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.conditional__select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

.conditional__text-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  min-width: 0;
  flex: 1;
}

.conditional__text-input--wide {
  flex: 2;
}

.conditional__text-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.conditional__text-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.conditional__number-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 80px;
  text-align: center;
}

.conditional__number-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

/* Radio and checkbox styles */
.conditional__radio-group {
  display: flex;
  gap: 16px;
}

.conditional__radio {
  display: flex;
  align-items: center;
  gap: 8px;
}

.conditional__radio input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.conditional__radio input[type="radio"]:checked {
  border-color: rgba(59, 130, 246, 0.8);
}

.conditional__radio input[type="radio"]:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: rgba(59, 130, 246, 0.8);
  border-radius: 50%;
}

.conditional__radio span {
  font-size: 14px;
  cursor: pointer;
}

/* Date inputs */
.conditional__date-picker {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
}

.conditional__date-picker:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

.conditional__relative-date {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Tip messages */
.conditional__tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
}

.conditional__tip i {
  color: #60a5fa;
}

/* Content blocks */
.conditional__content-block {
  padding: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conditional__content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  width: fit-content;
  color: #34d399;
}

.conditional__content-header--else {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  width: 100%;
}

.conditional__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.conditional__toggle input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.conditional__toggle input[type="checkbox"]:checked {
  background: rgba(245, 158, 11, 0.6);
  border-color: rgba(245, 158, 11, 0.8);
}

.conditional__toggle input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.conditional__toggle label {
  font-size: 14px;
  cursor: pointer;
}

.conditional__content-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.conditional__content-textarea {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.5;
}

.conditional__content-textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.conditional__content-textarea::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .conditional__field-row {
    flex-direction: column;
    gap: 12px;
  }

  .conditional__radio-group {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
