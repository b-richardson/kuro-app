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
    <div class="text-editor">
      <!-- Module Header -->
      <div class="text-editor__header">
        <div class="text-editor__header-icon">
          <i class="fas fa-align-left"></i>
        </div>
        <div class="text-editor__header-title">Text</div>

        <!-- Add Dynamic Content button -->
        <div class="text-editor__header-actions">
          <button
            class="dynamic-content-button"
            title="Add Dynamic Content"
            @click="toggleVariablePanel"
            ref="dynamicContentButton"
          >
            <i class="fas fa-bolt"></i>
            <span>Add Dynamic Content</span>
          </button>
        </div>
      </div>

      <!-- Text Content -->
      <div class="text-editor__content">
        <textarea
          class="text-editor__input"
          :value="module.content[0]"
          @input="updateTextContent($event)"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          placeholder="Enter text..."
          rows="4"
          ref="textInput"
        ></textarea>

        <!-- Dynamic content list -->
        <div v-if="dynamicTokens.length > 0" class="dynamic-tokens">
          <div class="dynamic-tokens__header">
            <span>Dynamic Content</span>
            <button
              @click="showTokenList = !showTokenList"
              class="toggle-button"
            >
              {{ showTokenList ? "Hide" : "Show" }}
            </button>
          </div>

          <div v-if="showTokenList" class="dynamic-tokens__list">
            <div
              v-for="(token, index) in dynamicTokens"
              :key="index"
              class="token-item"
            >
              <i :class="'fas ' + getTokenIcon(token.type)"></i>
              <span>{{ token.display }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";

const props = defineProps<{
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete"): void;
  (e: "select"): void;
  (e: "duplicate"): void;
  (e: "module-change"): void;
}>();

// References
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);
const textInput = ref<HTMLTextAreaElement | null>(null);
const dynamicContentButton = ref<HTMLButtonElement | null>(null);

// UI state
const showVariablePanel = ref(false);
const selectedVarType = ref<string | null>(null);
const showTokenList = ref(true);

// DOM elements for popup
let panelContainer: HTMLDivElement | null = null;

// Cursor position in the textarea
const cursorPos = ref({ start: 0, end: 0 });

// Configuration values
const dateFormat = ref("YYYY-MM-DD");
const dateOption = ref("now");
const fileProperty = ref("title");
const promptText = ref("");
const defaultValue = ref("");
const inputType = ref("text");
const selectionOptions = ref("");

// Token tracking
interface DynamicToken {
  type: string;
  placeholder: string;
  templaterCode: string;
  display: string;
}

const dynamicTokens = ref<DynamicToken[]>([]);

// Helper methods
const setEditing = (editing: boolean) => {
  baseModuleRef.value?.setEditing(editing);
};

const setInputRef = (el: HTMLElement) => {
  baseModuleRef.value?.setInputRef(el);
};

const updateContent = (content: string[]) => {
  emit("update:content", content);
};

const updateTextContent = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  updateContent([target.value]);

  // Save cursor position
  cursorPos.value = {
    start: target.selectionStart,
    end: target.selectionEnd,
  };
};

// Create panel element in DOM
const createPanelElement = () => {
  // Create container div
  panelContainer = document.createElement("div");
  panelContainer.className = "templater-panel-container";
  panelContainer.style.position = "fixed";
  panelContainer.style.zIndex = "9999";
  panelContainer.style.background = "rgba(0, 0, 0, 0.5)";
  panelContainer.style.top = "0";
  panelContainer.style.left = "0";
  panelContainer.style.right = "0";
  panelContainer.style.bottom = "0";
  panelContainer.style.display = "flex";
  panelContainer.style.justifyContent = "center";
  panelContainer.style.alignItems = "center";

  // Add click handler to close when clicking outside
  panelContainer.addEventListener("click", (e) => {
    if (e.target === panelContainer) {
      toggleVariablePanel();
    }
  });

  // Create panel content
  const panel = document.createElement("div");
  panel.className = "templater-panel";
  panel.style.width = "320px";
  panel.style.background = "#1e1e1e";
  panel.style.borderRadius = "8px";
  panel.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.4)";
  panel.style.overflow = "hidden";

  // Add header
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.padding = "12px 16px";
  header.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";

  const title = document.createElement("span");
  title.textContent = "Add Dynamic Content";
  title.style.fontWeight = "500";
  title.style.color = "white";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.background = "none";
  closeBtn.style.border = "none";
  closeBtn.style.color = "#a0a0a0";
  closeBtn.style.fontSize = "20px";
  closeBtn.style.cursor = "pointer";
  closeBtn.addEventListener("click", toggleVariablePanel);

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Create content container
  const content = document.createElement("div");
  content.className = "templater-panel-content";
  content.style.padding = "16px";

  // Add main options
  if (!selectedVarType.value) {
    const options = [
      {
        type: "date",
        name: "Date/Time",
        icon: "fa-calendar-alt",
        desc: "Insert dynamic date and time values",
      },
      {
        type: "file",
        name: "File Property",
        icon: "fa-file-alt",
        desc: "Insert information about the current note",
      },
      {
        type: "input",
        name: "User Input",
        icon: "fa-keyboard",
        desc: "Prompt for input when template is used",
      },
    ];

    options.forEach((option) => {
      const optionEl = document.createElement("div");
      optionEl.style.display = "flex";
      optionEl.style.gap = "12px";
      optionEl.style.padding = "12px";
      optionEl.style.background = "rgba(255, 255, 255, 0.03)";
      optionEl.style.border = "1px solid rgba(255, 255, 255, 0.08)";
      optionEl.style.borderRadius = "6px";
      optionEl.style.marginBottom = "8px";
      optionEl.style.cursor = "pointer";

      optionEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: rgba(95, 95, 255, 0.1); border-radius: 50%; color: #5f5fff;">
          <i class="fas ${option.icon}"></i>
        </div>
        <div>
          <div style="font-weight: 500; margin-bottom: 4px; color: white;">${option.name}</div>
          <div style="font-size: 12px; color: #a0a0a0;">${option.desc}</div>
        </div>
      `;

      optionEl.addEventListener("click", () => {
        selectedVarType.value = option.type;
        toggleVariablePanel();
        setTimeout(() => toggleVariablePanel(), 50);
      });

      content.appendChild(optionEl);
    });
  }

  // Add date configuration
  if (selectedVarType.value === "date") {
    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: white;">Date Format</label>
        <select id="dateFormat" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; color: white;">
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="MMMM D, YYYY">Month Day, Year</option>
        </select>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: white;">Date Option</label>
        <select id="dateOption" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; color: white;">
          <option value="now">Current date</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="yesterday">Yesterday</option>
        </select>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;">
        <button id="backBtn" style="padding: 8px 16px; background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #a0a0a0; border-radius: 4px; cursor: pointer;">Back</button>
        <button id="insertDateBtn" style="padding: 8px 16px; background: #5f5fff; color: white; border: none; border-radius: 4px; cursor: pointer;">Insert</button>
      </div>
    `;

    // Add event listeners once content is added to DOM
    setTimeout(() => {
      document.getElementById("dateFormat")?.addEventListener("change", (e) => {
        dateFormat.value = (e.target as HTMLSelectElement).value;
      });

      document.getElementById("dateOption")?.addEventListener("change", (e) => {
        dateOption.value = (e.target as HTMLSelectElement).value;
      });

      document.getElementById("backBtn")?.addEventListener("click", () => {
        selectedVarType.value = null;
        toggleVariablePanel();
        setTimeout(() => toggleVariablePanel(), 50);
      });

      document
        .getElementById("insertDateBtn")
        ?.addEventListener("click", () => {
          insertDate();
        });

      // Set initial values
      const formatSelect = document.getElementById(
        "dateFormat"
      ) as HTMLSelectElement;
      const optionSelect = document.getElementById(
        "dateOption"
      ) as HTMLSelectElement;
      if (formatSelect) formatSelect.value = dateFormat.value;
      if (optionSelect) optionSelect.value = dateOption.value;
    }, 0);
  }

  // Add file property configuration
  if (selectedVarType.value === "file") {
    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: white;">File Property</label>
        <select id="fileProperty" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; color: white;">
          <option value="title">File title</option>
          <option value="path">File path</option>
          <option value="folder">Parent folder</option>
          <option value="creation">Creation date</option>
        </select>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;">
        <button id="backBtn" style="padding: 8px 16px; background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #a0a0a0; border-radius: 4px; cursor: pointer;">Back</button>
        <button id="insertFileBtn" style="padding: 8px 16px; background: #5f5fff; color: white; border: none; border-radius: 4px; cursor: pointer;">Insert</button>
      </div>
    `;

    // Add event listeners once content is added to DOM
    setTimeout(() => {
      document
        .getElementById("fileProperty")
        ?.addEventListener("change", (e) => {
          fileProperty.value = (e.target as HTMLSelectElement).value;
        });

      document.getElementById("backBtn")?.addEventListener("click", () => {
        selectedVarType.value = null;
        toggleVariablePanel();
        setTimeout(() => toggleVariablePanel(), 50);
      });

      document
        .getElementById("insertFileBtn")
        ?.addEventListener("click", () => {
          insertFileProperty();
        });

      // Set initial value
      const propertySelect = document.getElementById(
        "fileProperty"
      ) as HTMLSelectElement;
      if (propertySelect) propertySelect.value = fileProperty.value;
    }, 0);
  }

  // Add user input configuration
  if (selectedVarType.value === "input") {
    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: white;">Prompt Text</label>
        <input id="promptText" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; color: white;" placeholder="Enter prompt text" value="${
          promptText.value
        }">
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: white;">Default Value (optional)</label>
        <input id="defaultValue" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; color: white;" placeholder="Leave blank for no default" value="${
          defaultValue.value
        }">
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: white;">Input Type</label>
        <select id="inputType" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; color: white;">
          <option value="text">Text Input</option>
          <option value="selection">Selection Menu</option>
        </select>
      </div>
      
      <div id="selectionOptionsContainer" style="margin-bottom: 16px; ${
        inputType.value === "selection" ? "" : "display: none;"
      }">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: white;">Options (one per line)</label>
        <textarea id="selectionOptions" style="width: 100%; min-height: 80px; padding: 8px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; color: white;" placeholder="Option 1&#10;Option 2&#10;Option 3">${
          selectionOptions.value
        }</textarea>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;">
        <button id="backBtn" style="padding: 8px 16px; background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #a0a0a0; border-radius: 4px; cursor: pointer;">Back</button>
        <button id="insertInputBtn" style="padding: 8px 16px; background: #5f5fff; color: white; border: none; border-radius: 4px; cursor: pointer;">Insert</button>
      </div>
    `;

    // Add event listeners once content is added to DOM
    setTimeout(() => {
      document.getElementById("promptText")?.addEventListener("input", (e) => {
        promptText.value = (e.target as HTMLInputElement).value;
      });

      document
        .getElementById("defaultValue")
        ?.addEventListener("input", (e) => {
          defaultValue.value = (e.target as HTMLInputElement).value;
        });

      document.getElementById("inputType")?.addEventListener("change", (e) => {
        inputType.value = (e.target as HTMLSelectElement).value;
        const optionsContainer = document.getElementById(
          "selectionOptionsContainer"
        );
        if (optionsContainer) {
          optionsContainer.style.display =
            inputType.value === "selection" ? "block" : "none";
        }
      });

      document
        .getElementById("selectionOptions")
        ?.addEventListener("input", (e) => {
          selectionOptions.value = (e.target as HTMLTextAreaElement).value;
        });

      document.getElementById("backBtn")?.addEventListener("click", () => {
        selectedVarType.value = null;
        toggleVariablePanel();
        setTimeout(() => toggleVariablePanel(), 50);
      });

      document
        .getElementById("insertInputBtn")
        ?.addEventListener("click", () => {
          insertUserInput();
        });

      // Set initial values
      const typeSelect = document.getElementById(
        "inputType"
      ) as HTMLSelectElement;
      if (typeSelect) typeSelect.value = inputType.value;
    }, 0);
  }

  // Add elements to DOM
  panel.appendChild(header);
  panel.appendChild(content);
  panelContainer.appendChild(panel);
  document.body.appendChild(panelContainer);
};

// Toggle variable panel
const toggleVariablePanel = () => {
  if (showVariablePanel.value) {
    // Hide panel
    showVariablePanel.value = false;

    // Remove panel from DOM
    if (panelContainer) {
      document.body.removeChild(panelContainer);
      panelContainer = null;
    }
  } else {
    // Show panel
    showVariablePanel.value = true;

    // Create and show panel
    createPanelElement();
  }
};

// Go back to main variable selector
const goBack = () => {
  selectedVarType.value = null;

  // Refresh panel
  toggleVariablePanel();
  setTimeout(() => toggleVariablePanel(), 50);
};

// Insert content at cursor position
const insertAtCursor = (
  placeholder: string,
  templaterCode: string,
  display: string,
  type: string
) => {
  // Get current content
  const text = props.module.content[0] || "";

  // Split text at cursor position
  const beforeCursor = text.substring(0, cursorPos.value.start);
  const afterCursor = text.substring(cursorPos.value.end);

  // Insert placeholder at cursor position
  const newText = beforeCursor + placeholder + afterCursor;
  updateContent([newText]);

  // Add to token list
  dynamicTokens.value.push({
    type,
    placeholder,
    templaterCode,
    display,
  });

  // Close panel and reset
  toggleVariablePanel();
  selectedVarType.value = null;

  // Focus back to textarea
  setTimeout(() => {
    if (textInput.value) {
      textInput.value.focus();

      // Place cursor after inserted content
      const newPos = cursorPos.value.start + placeholder.length;
      textInput.value.setSelectionRange(newPos, newPos);

      // Update cursor position
      cursorPos.value = { start: newPos, end: newPos };
    }
  }, 10);
};

// Insert date
const insertDate = () => {
  let templaterCode = "";
  let display = "";

  if (dateOption.value === "now") {
    templaterCode = `<% tp.date.now("${dateFormat.value}") %>`;
    display = `Current date (${dateFormat.value})`;
  } else if (dateOption.value === "tomorrow") {
    templaterCode = `<% tp.date.tomorrow("${dateFormat.value}") %>`;
    display = `Tomorrow (${dateFormat.value})`;
  } else if (dateOption.value === "yesterday") {
    templaterCode = `<% tp.date.yesterday("${dateFormat.value}") %>`;
    display = `Yesterday (${dateFormat.value})`;
  }

  const placeholder = `[Date: ${display}]`;
  insertAtCursor(placeholder, templaterCode, display, "date");
};

// Insert file property
const insertFileProperty = () => {
  let templaterCode = "";
  let display = "";

  switch (fileProperty.value) {
    case "title":
      templaterCode = `<% tp.file.title %>`;
      display = "File title";
      break;
    case "path":
      templaterCode = `<% tp.file.path %>`;
      display = "File path";
      break;
    case "folder":
      templaterCode = `<% tp.file.folder() %>`;
      display = "Parent folder";
      break;
    case "creation":
      templaterCode = `<% tp.file.creation_date("YYYY-MM-DD") %>`;
      display = "Creation date";
      break;
  }

  const placeholder = `[File: ${display}]`;
  insertAtCursor(placeholder, templaterCode, display, "file");
};

// Insert user input
const insertUserInput = () => {
  if (!promptText.value) {
    promptText.value = "Enter a value";
  }

  let templaterCode = "";
  let display = "";

  if (inputType.value === "text") {
    // Text input
    templaterCode = defaultValue.value
      ? `<% tp.system.prompt("${promptText.value}", "${defaultValue.value}") %>`
      : `<% tp.system.prompt("${promptText.value}") %>`;

    display = `Prompt: "${promptText.value}"`;
  } else {
    // Selection menu
    const options = selectionOptions.value
      ? selectionOptions.value.split("\n").filter((line) => line.trim())
      : ["Option 1", "Option 2"];

    const optionsArray = options.map((opt) => `"${opt}"`).join(", ");
    templaterCode = `<% tp.system.suggester([${optionsArray}], [${optionsArray}]) %>`;

    display = `Selection: "${promptText.value}"`;
  }

  const placeholder = `[Input: ${display}]`;
  insertAtCursor(placeholder, templaterCode, display, "input");
};

// Get icon for token type
const getTokenIcon = (type: string): string => {
  switch (type) {
    case "date":
      return "fa-calendar-alt";
    case "file":
      return "fa-file-alt";
    case "input":
      return "fa-keyboard";
    default:
      return "fa-code";
  }
};

// Save cursor position when input is focused or clicked
const saveCursorPosition = () => {
  if (textInput.value) {
    cursorPos.value = {
      start: textInput.value.selectionStart,
      end: textInput.value.selectionEnd,
    };
  }
};

// Initialize
onMounted(() => {
  if (!props.module.content[0] || props.module.content[0] === "") {
    emit("update:content", ["Add your text here..."]);
  }

  if (props.autoFocus && textInput.value) {
    setInputRef(textInput.value);
  }

  // Add click event to save cursor position
  if (textInput.value) {
    textInput.value.addEventListener("click", saveCursorPosition);
    textInput.value.addEventListener("keyup", saveCursorPosition);
  }

  // Add key handler to close panel on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && showVariablePanel.value) {
      toggleVariablePanel();
    }
  });
});

// Cleanup
onUnmounted(() => {
  // Remove panel from DOM if it exists
  if (panelContainer && document.body.contains(panelContainer)) {
    document.body.removeChild(panelContainer);
  }

  // Remove event listeners
  if (textInput.value) {
    textInput.value.removeEventListener("click", saveCursorPosition);
    textInput.value.removeEventListener("keyup", saveCursorPosition);
  }
});
</script>

<style scoped>
.text-editor {
  width: 100%;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.text-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.text-editor__header-icon {
  color: var(--color-primary);
  font-size: 18px;
}

.text-editor__header-title {
  font-size: 16px;
  font-weight: 500;
  flex: 1;
}

.text-editor__header-actions {
  display: flex;
  gap: 8px;
}

.dynamic-content-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(95, 95, 255, 0.1);
  border: 1px solid rgba(95, 95, 255, 0.2);
  color: #5f5fff;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.dynamic-content-button:hover {
  background: rgba(95, 95, 255, 0.15);
}

.dynamic-content-button i {
  font-size: 12px;
}

.text-editor__content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.text-editor__input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;
}

.text-editor__input:focus {
  outline: none;
  border-color: #5f5fff;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 1px rgba(95, 95, 255, 0.2);
}

.dynamic-tokens {
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.dynamic-tokens__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #a0a0a0;
}

.toggle-button {
  background: transparent;
  border: none;
  color: #5f5fff;
  font-size: 12px;
  cursor: pointer;
}

.dynamic-tokens__list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.token-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  font-size: 13px;
}

.token-item i {
  color: #5f5fff;
}
</style>
