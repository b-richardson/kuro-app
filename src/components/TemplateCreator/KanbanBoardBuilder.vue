<template>
  <div class="kanban-board-builder">
    <div class="kanban-board-builder__header">
      <div class="kanban-board-builder__title">
        <i class="fas fa-columns"></i>
        Kanban Board Builder
      </div>
      <div class="kanban-board-builder__view-toggle">
        <button
          class="kanban-board-builder__mode-btn"
          :class="{ active: editorMode === 'visual' }"
          @click="setEditorMode('visual')"
          title="Visual Editor"
        >
          <i class="fas fa-columns"></i>
        </button>
        <button
          class="kanban-board-builder__mode-btn"
          :class="{ active: editorMode === 'code' }"
          @click="setEditorMode('code')"
          title="Code Editor"
        >
          <i class="fas fa-code"></i>
        </button>
      </div>
    </div>

    <div v-if="validationError" class="kanban-board-builder__validation-error">
      <i class="fas fa-exclamation-triangle"></i>
      {{ validationError }}
    </div>

    <!-- Visual Editor Mode -->
    <div
      v-if="editorMode === 'visual'"
      class="kanban-board-builder__visual-mode"
    >
      <!-- Templates panel -->
      <div class="kanban-board-builder__templates-panel">
        <h3 class="kanban-board-builder__section-title">
          <i class="fas fa-bookmark"></i> Board Templates
        </h3>
        <div class="kanban-board-builder__templates">
          <div
            v-for="template in boardTemplates"
            :key="template.id"
            class="kanban-board-builder__template-card"
            @click="applyTemplate(template)"
          >
            <div class="kanban-board-builder__template-name">
              {{ getTemplateName(template.id) }}
            </div>
            <div class="kanban-board-builder__template-lanes">
              {{ template.lanes.length }} lanes,
              {{ countCards(template) }} cards
            </div>
          </div>
        </div>
      </div>

      <!-- Board Editing Panel -->
      <div class="kanban-board-builder__board-panel">
        <h3 class="kanban-board-builder__section-title">
          <i class="fas fa-cog"></i> Board Settings
        </h3>
        <div class="kanban-board-builder__settings">
          <div class="kanban-board-builder__setting-row">
            <label class="kanban-board-builder__setting-label"
              >Board Style:</label
            >
            <select
              v-model="board.settings.style"
              class="kanban-board-builder__select"
              @change="boardStyleChanged"
            >
              <option v-for="style in kanbanStyles" :key="style" :value="style">
                {{ formatStyleName(style) }}
              </option>
            </select>
          </div>

          <div
            v-if="board.settings.style !== 'basic'"
            class="kanban-board-builder__settings-group"
          >
            <!-- Advanced settings visible when not in basic mode -->
            <div
              class="kanban-board-builder__setting-row kanban-board-builder__setting-row--checkbox"
            >
              <label class="kanban-board-builder__setting-label">
                <input
                  type="checkbox"
                  :checked="board.settings.showDateBadges !== false"
                  @change="toggleBooleanSetting('showDateBadges')"
                />
                Show Date Badges
              </label>
            </div>

            <div
              class="kanban-board-builder__setting-row kanban-board-builder__setting-row--checkbox"
            >
              <label class="kanban-board-builder__setting-label">
                <input
                  type="checkbox"
                  :checked="board.settings.hideTagsDisplay === true"
                  @change="toggleBooleanSetting('hideTagsDisplay')"
                />
                Hide Tags in Title
              </label>
            </div>

            <div
              class="kanban-board-builder__setting-row kanban-board-builder__setting-row--checkbox"
            >
              <label class="kanban-board-builder__setting-label">
                <input
                  type="checkbox"
                  :checked="board.settings.showCompletedItems !== false"
                  @change="toggleBooleanSetting('showCompletedItems')"
                />
                Show Completed Items
              </label>
            </div>

            <div class="kanban-board-builder__setting-row">
              <label class="kanban-board-builder__setting-label"
                >Date Format:</label
              >
              <select
                v-model="board.settings.dateFormat"
                class="kanban-board-builder__select"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                <option value="MMM D, YYYY">MMM D, YYYY</option>
              </select>
            </div>

            <div class="kanban-board-builder__setting-row">
              <label class="kanban-board-builder__setting-label"
                >Lane Width:</label
              >
              <input
                type="number"
                v-model.number="board.settings.laneWidth"
                class="kanban-board-builder__input kanban-board-builder__input--number"
                min="100"
                max="600"
              />
            </div>
          </div>
        </div>

        <div class="kanban-board-builder__board-container">
          <h3 class="kanban-board-builder__section-title">
            <i class="fas fa-columns"></i> Board Lanes
            <button
              class="kanban-board-builder__add-lane-btn"
              @click="addNewLane"
            >
              <i class="fas fa-plus"></i> Add Lane
            </button>
          </h3>

          <div class="kanban-board-builder__lanes">
            <draggable
              v-model="board.lanes"
              :component-data="{ name: 'lanes' }"
              group="lanes"
              item-key="id"
              handle=".kanban-lane__handle"
              class="kanban-board-builder__lanes-container"
            >
              <template #item="{ element: lane }">
                <div class="kanban-lane">
                  <div class="kanban-lane__header">
                    <div class="kanban-lane__handle">
                      <i class="fas fa-grip-lines"></i>
                    </div>
                    <input
                      type="text"
                      v-model="lane.title"
                      class="kanban-lane__title-input"
                      placeholder="Lane Title"
                      @change="updateBoard"
                    />
                    <button
                      class="kanban-lane__delete-btn"
                      @click="deleteLane(lane.id)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <div class="kanban-lane__cards">
                    <draggable
                      v-model="lane.cards"
                      :component-data="{ name: 'cards' }"
                      group="cards"
                      item-key="id"
                      handle=".kanban-card__handle"
                      class="kanban-lane__cards-container"
                    >
                      <template #item="{ element: card }">
                        <div
                          class="kanban-card"
                          :class="getCardClasses(card)"
                          @click="editCard(lane.id, card)"
                        >
                          <div class="kanban-card__handle">
                            <i class="fas fa-grip-lines"></i>
                          </div>
                          <div class="kanban-card__checkbox">
                            <input
                              type="checkbox"
                              :checked="card.checked"
                              @change="toggleCardChecked(lane.id, card.id)"
                              @click.stop
                            />
                          </div>
                          <div class="kanban-card__content">
                            <div class="kanban-card__text">{{ card.text }}</div>
                            <div
                              v-if="card.tags && card.tags.length > 0"
                              class="kanban-card__tags"
                            >
                              <span
                                v-for="tag in card.tags"
                                :key="tag"
                                class="kanban-card__tag"
                                >#{{ tag }}</span
                              >
                            </div>
                          </div>
                          <button
                            class="kanban-card__delete-btn"
                            @click.stop="deleteCard(lane.id, card.id)"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </template>
                    </draggable>

                    <button
                      class="kanban-lane__add-card-btn"
                      @click="addNewCard(lane.id)"
                    >
                      <i class="fas fa-plus"></i> Add Card
                    </button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="kanban-board-builder__preview-panel">
        <h3 class="kanban-board-builder__section-title">
          <i class="fas fa-eye"></i> Preview
        </h3>
        <div class="kanban-board-builder__preview-content">
          <pre><code>{{ generatedMarkdown }}</code></pre>
        </div>
      </div>
    </div>

    <!-- Code Editor Mode -->
    <div v-else class="kanban-board-builder__code-mode">
      <div class="kanban-board-builder__code-editor">
        <textarea
          v-model="rawMarkdown"
          class="kanban-board-builder__code-textarea"
          placeholder="Enter kanban board markdown..."
          rows="20"
          @input="validateRawMarkdown"
        ></textarea>
      </div>

      <div class="kanban-board-builder__code-help">
        <i class="fas fa-info-circle"></i>
        <span>
          Start with YAML frontmatter containing
          <code>kanban-plugin: true</code> or <code>kanban-plugin: basic</code>,
          followed by lane headers (##) and cards (- [ ]).
        </span>
      </div>
    </div>

    <!-- Card Edit Modal -->
    <div
      v-if="showCardModal"
      class="kanban-card-modal-backdrop"
      @click="closeCardModal"
    >
      <div class="kanban-card-modal" @click.stop>
        <div class="kanban-card-modal__header">
          <h3 class="kanban-card-modal__title">Edit Card</h3>
          <button class="kanban-card-modal__close-btn" @click="closeCardModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="kanban-card-modal__content">
          <div class="kanban-card-modal__field">
            <label class="kanban-card-modal__label">Card Text</label>
            <input
              type="text"
              v-model="editingCard.text"
              class="kanban-card-modal__input"
              placeholder="Card text"
            />
          </div>

          <div class="kanban-card-modal__field">
            <label class="kanban-card-modal__label">Description</label>
            <textarea
              v-model="editingCard.description"
              class="kanban-card-modal__textarea"
              placeholder="Additional details (optional)"
              rows="3"
            ></textarea>
          </div>

          <div class="kanban-card-modal__field">
            <label class="kanban-card-modal__label">Tags</label>
            <div class="kanban-card-modal__tags-input">
              <div
                v-if="editingCard.tags && editingCard.tags.length > 0"
                class="kanban-card-modal__tags-list"
              >
                <div
                  v-for="(tag, index) in editingCard.tags"
                  :key="index"
                  class="kanban-card-modal__tag"
                >
                  <span class="kanban-card-modal__tag-text">#{{ tag }}</span>
                  <button
                    class="kanban-card-modal__tag-remove"
                    @click="removeTag(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="kanban-card-modal__tag-add">
                <input
                  type="text"
                  v-model="newTag"
                  class="kanban-card-modal__tag-input"
                  placeholder="Add tag..."
                  @keydown.enter="addTag"
                />
                <button class="kanban-card-modal__tag-add-btn" @click="addTag">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="kanban-card-modal__field">
            <label class="kanban-card-modal__label">Due Date</label>
            <input
              type="date"
              v-model="editingCard.dueDate"
              class="kanban-card-modal__input"
            />
          </div>

          <div class="kanban-card-modal__field">
            <label class="kanban-card-modal__label">Color</label>
            <div class="kanban-card-modal__color-options">
              <div
                class="kanban-card-modal__color-option kanban-card-modal__color-option--none"
                :class="{
                  selected: editingCard.color === 'none' || !editingCard.color,
                }"
                @click="editingCard.color = 'none'"
              >
                None
              </div>
              <div
                v-for="color in cardColors"
                :key="color"
                class="kanban-card-modal__color-option"
                :class="[
                  `kanban-card-modal__color-option--${color}`,
                  { selected: editingCard.color === color },
                ]"
                @click="editingCard.color = color"
              ></div>
            </div>
          </div>

          <div
            class="kanban-card-modal__field kanban-card-modal__checkbox-field"
          >
            <label class="kanban-card-modal__checkbox-label">
              <input
                type="checkbox"
                :checked="editingCard.checked"
                @change="editingCard.checked = !editingCard.checked"
              />
              <span>Mark as complete</span>
            </label>
          </div>
        </div>

        <div class="kanban-card-modal__actions">
          <button class="kanban-card-modal__cancel-btn" @click="closeCardModal">
            Cancel
          </button>
          <button class="kanban-card-modal__save-btn" @click="saveCardChanges">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Actions Bar -->
    <div class="kanban-board-builder__actions">
      <button class="kanban-board-builder__apply-btn" @click="applyKanbanBoard">
        Apply Board
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { VueDraggableNext } from "vue-draggable-next";
import {
  KanbanBoard,
  KanbanLane,
  KanbanCard,
  KanbanSettings,
  KanbanStyle,
  KanbanColor,
  KANBAN_BOARD_TEMPLATES,
  generateKanbanMarkdown,
  parseKanbanMarkdown,
  validateKanbanBoard,
  getKanbanStyleSettings,
  getCardColorClass,
} from "@/utils/kanbanUtils";

// Props and emits
const props = defineProps<{
  content: string[];
}>();

const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
}>();

// State
const editorMode = ref<"visual" | "code">("visual");
const validationError = ref("");
const rawMarkdown = ref("");

// Card editing state
const showCardModal = ref(false);
const editingLaneId = ref("");
const editingCard = ref<KanbanCard>({
  id: "",
  text: "",
  checked: false,
});
const editingCardOriginal = ref<KanbanCard | null>(null);
const newTag = ref("");

// Board data structure
const board = ref<KanbanBoard>({
  id: uuidv4(),
  lanes: [
    {
      id: uuidv4(),
      title: "To Do",
      cards: [
        { id: uuidv4(), text: "Task 1", checked: false },
        { id: uuidv4(), text: "Task 2", checked: false },
      ],
    },
    {
      id: uuidv4(),
      title: "In Progress",
      cards: [{ id: uuidv4(), text: "Current task", checked: false }],
    },
    {
      id: uuidv4(),
      title: "Done",
      cards: [{ id: uuidv4(), text: "Completed task", checked: true }],
    },
  ],
  settings: {
    style: KanbanStyle.BASIC,
  },
});

// Available options
const kanbanStyles = computed(() => Object.values(KanbanStyle));
const cardColors = computed(() =>
  Object.values(KanbanColor).filter((color) => color !== KanbanColor.NONE)
);
const boardTemplates = computed(() => KANBAN_BOARD_TEMPLATES);

// Generated markdown output
const generatedMarkdown = computed(() => {
  return generateKanbanMarkdown(board.value).join("\n");
});

// Initialize from props
onMounted(() => {
  initializeFromContent();
});

// Watch for content changes from parent
watch(
  () => props.content,
  () => {
    initializeFromContent();
  },
  { deep: true }
);

// Methods
function initializeFromContent() {
  // Join the content into a single string for easier display
  const content = props.content.join("\n");
  rawMarkdown.value = content;

  // Try to parse the content as a Kanban board
  if (content.trim()) {
    try {
      const parsedBoard = parseKanbanMarkdown(props.content);
      board.value = parsedBoard;
    } catch (error) {
      // If parsing fails, set a validation error
      validationError.value =
        "Unable to parse the Kanban board content. Check the syntax.";
    }
  }
}

function setEditorMode(mode: "visual" | "code") {
  if (mode === "code" && editorMode.value === "visual") {
    // Switching to code mode, update the raw markdown
    rawMarkdown.value = generatedMarkdown.value;
  } else if (mode === "visual" && editorMode.value === "code") {
    // Switching to visual mode, parse the raw markdown
    try {
      const parsedBoard = parseKanbanMarkdown(rawMarkdown.value.split("\n"));
      board.value = parsedBoard;
      validationError.value = "";
    } catch (error) {
      // If parsing fails, show validation error and stay in code mode
      validationError.value =
        "Unable to parse the Kanban board markdown. Check the syntax.";
      return;
    }
  }

  editorMode.value = mode;
}

function validateRawMarkdown() {
  // Validate the raw markdown and update the board
  try {
    const lines = rawMarkdown.value.split("\n");
    const parsedBoard = parseKanbanMarkdown(lines);
    const validation = validateKanbanBoard(parsedBoard);

    if (!validation.isValid) {
      validationError.value =
        validation.error || "Invalid Kanban board structure";
      return;
    }

    // Clear any validation errors
    validationError.value = "";

    // Update the content
    emit("update:content", lines);
  } catch (error) {
    validationError.value = "Unable to parse the Kanban board markdown";
  }
}

function updateBoard() {
  // Validate the board structure
  const validation = validateKanbanBoard(board.value);
  if (!validation.isValid) {
    validationError.value =
      validation.error || "Invalid Kanban board structure";
    return;
  }

  // Clear any validation errors
  validationError.value = "";

  // Generate markdown and update content
  const markdown = generateKanbanMarkdown(board.value);
  emit("update:content", markdown);
}

function boardStyleChanged() {
  // Update settings based on selected style
  const newSettings = getKanbanStyleSettings(
    board.value.settings.style as KanbanStyle
  );

  // Preserve the style selection
  const style = board.value.settings.style;

  // Merge new settings
  board.value.settings = {
    ...newSettings,
    style,
  };

  updateBoard();
}

function toggleBooleanSetting(settingName: keyof KanbanSettings) {
  if (typeof board.value.settings[settingName] === "boolean") {
    board.value.settings[settingName] = !board.value.settings[settingName];
  } else {
    // Initialize if not set
    if (settingName === "showDateBadges") {
      board.value.settings.showDateBadges = false;
    } else if (settingName === "hideTagsDisplay") {
      board.value.settings.hideTagsDisplay = false;
    } else if (settingName === "showCompletedItems") {
      board.value.settings.showCompletedItems = false;
    } else if (settingName === "addCurvedLines") {
      board.value.settings.addCurvedLines = true;
    }
  }

  updateBoard();
}

function getTemplateName(templateId: string): string {
  switch (templateId) {
    case "basic-todo":
      return "Basic To-Do Board";
    case "project-management":
      return "Project Management";
    case "content-creation":
      return "Content Creation";
    case "personal-goals":
      return "Personal Goals";
    default:
      return "Custom Template";
  }
}

function countCards(template: KanbanBoard): number {
  return template.lanes.reduce((total, lane) => total + lane.cards.length, 0);
}

function formatStyleName(style: string): string {
  return style.charAt(0).toUpperCase() + style.slice(1);
}

function getCardClasses(card: KanbanCard): string[] {
  const classes = [];

  if (card.checked) {
    classes.push("kanban-card--checked");
  }

  if (card.color && card.color !== KanbanColor.NONE) {
    classes.push(`kanban-card--${card.color}`);
  }

  return classes;
}

function applyTemplate(template: KanbanBoard) {
  // Clone the template to avoid modifying the original
  board.value = JSON.parse(JSON.stringify(template));

  // Generate new IDs to ensure uniqueness
  board.value.id = uuidv4();

  board.value.lanes = board.value.lanes.map((lane) => {
    const newLane: KanbanLane = {
      ...lane,
      id: uuidv4(),
      cards: lane.cards.map((card) => ({ ...card, id: uuidv4() })),
    };
    return newLane;
  });

  updateBoard();
}

// Lane operations
function addNewLane() {
  const newLane: KanbanLane = {
    id: uuidv4(),
    title: "New Lane",
    cards: [],
  };

  board.value.lanes.push(newLane);
  updateBoard();
}

function deleteLane(laneId: string) {
  const index = board.value.lanes.findIndex((lane) => lane.id === laneId);
  if (index !== -1) {
    board.value.lanes.splice(index, 1);
    updateBoard();
  }
}

// Card operations
function addNewCard(laneId: string) {
  const lane = board.value.lanes.find((l) => l.id === laneId);
  if (lane) {
    const newCard: KanbanCard = {
      id: uuidv4(),
      text: "New card",
      checked: false,
    };

    lane.cards.push(newCard);
    updateBoard();
  }
}

function deleteCard(laneId: string, cardId: string) {
  const lane = board.value.lanes.find((l) => l.id === laneId);
  if (lane) {
    const cardIndex = lane.cards.findIndex((c) => c.id === cardId);
    if (cardIndex !== -1) {
      lane.cards.splice(cardIndex, 1);
      updateBoard();
    }
  }
}

function toggleCardChecked(laneId: string, cardId: string) {
  const lane = board.value.lanes.find((l) => l.id === laneId);
  if (lane) {
    const card = lane.cards.find((c) => c.id === cardId);
    if (card) {
      card.checked = !card.checked;
      updateBoard();
    }
  }
}

// Card edit modal
function editCard(laneId: string, card: KanbanCard) {
  editingLaneId.value = laneId;
  editingCardOriginal.value = card;

  // Create a clone to edit
  editingCard.value = JSON.parse(JSON.stringify(card));

  // Ensure we have tags array
  if (!editingCard.value.tags) {
    editingCard.value.tags = [];
  }

  showCardModal.value = true;
}

function closeCardModal() {
  showCardModal.value = false;
  newTag.value = "";
}

function saveCardChanges() {
  if (!editingCardOriginal.value) return;

  // Find the card in the board
  const lane = board.value.lanes.find((l) => l.id === editingLaneId.value);
  if (lane) {
    const cardIndex = lane.cards.findIndex(
      (c) => c.id === editingCardOriginal.value?.id
    );
    if (cardIndex !== -1) {
      // Update the card with edited values
      lane.cards[cardIndex] = { ...editingCard.value };

      // Clean up empty or undefined values
      if (!lane.cards[cardIndex].tags?.length) {
        delete lane.cards[cardIndex].tags;
      }

      if (!lane.cards[cardIndex].description) {
        delete lane.cards[cardIndex].description;
      }

      if (!lane.cards[cardIndex].dueDate) {
        delete lane.cards[cardIndex].dueDate;
      }

      if (lane.cards[cardIndex].color === KanbanColor.NONE) {
        delete lane.cards[cardIndex].color;
      }

      updateBoard();
    }
  }

  closeCardModal();
}

// Tag handling
function addTag() {
  if (!newTag.value.trim()) return;

  // Make sure we have a tags array
  if (!editingCard.value.tags) {
    editingCard.value.tags = [];
  }

  // Remove # prefix if present
  const tagText = newTag.value.trim().replace(/^#/, "");

  // Only add if not already in the list
  if (!editingCard.value.tags.includes(tagText)) {
    editingCard.value.tags.push(tagText);
  }

  // Clear the input
  newTag.value = "";
}

function removeTag(index: number) {
  if (editingCard.value.tags) {
    editingCard.value.tags.splice(index, 1);
  }
}

// Final apply action
function applyKanbanBoard() {
  if (editorMode.value === "visual") {
    const markdown = generateKanbanMarkdown(board.value);
    emit("update:content", markdown);
  } else {
    emit("update:content", rawMarkdown.value.split("\n"));
  }
}
</script>

<style scoped>
.kanban-board-builder {
  width: 100%;
  font-size: 0.9375rem;
  display: flex;
  flex-direction: column;
}

.kanban-board-builder__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.kanban-board-builder__title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #8b5cf6; /* Purple */
}

.kanban-board-builder__view-toggle {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.kanban-board-builder__mode-btn {
  padding: 0.4rem 0.75rem;
  background-color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #64748b;
}

.kanban-board-builder__mode-btn.active {
  background-color: #f5f3ff; /* Light purple */
  font-weight: 500;
  color: #8b5cf6; /* Purple */
}

.kanban-board-builder__validation-error {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

/* Visual Editor */
.kanban-board-builder__visual-mode {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-template-rows: auto 1fr;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  height: calc(100% - 65px); /* Account for header and actions */
  min-height: 520px;
}

.kanban-board-builder__templates-panel {
  grid-column: 1;
  grid-row: 1 / 3;
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 1rem;
  overflow-y: auto;
}

.kanban-board-builder__board-panel {
  grid-column: 2;
  grid-row: 1 / 2;
  padding: 1rem;
  overflow-y: auto;
}

.kanban-board-builder__preview-panel {
  grid-column: 2;
  grid-row: 2 / 3;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* For mobile layout */
@media (max-width: 768px) {
  .kanban-board-builder__visual-mode {
    display: flex;
    flex-direction: column;
    height: auto;
  }

  .kanban-board-builder__templates-panel {
    order: 1;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .kanban-board-builder__board-panel {
    order: 2;
  }

  .kanban-board-builder__preview-panel {
    order: 3;
  }
}

/* Settings */
.kanban-board-builder__section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 0.875rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kanban-board-builder__section-title i {
  color: #8b5cf6; /* Purple */
  font-size: 0.875rem;
}

.kanban-board-builder__settings {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.kanban-board-builder__settings-group {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.kanban-board-builder__setting-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.kanban-board-builder__setting-row--checkbox {
  margin-bottom: 0.5rem;
}

.kanban-board-builder__setting-label {
  flex: 1;
  font-size: 0.875rem;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kanban-board-builder__setting-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: #8b5cf6;
}

.kanban-board-builder__select {
  width: 40%;
  min-width: 120px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  color: #4b5563;
}

.kanban-board-builder__input {
  width: 40%;
  min-width: 120px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4b5563;
}

.kanban-board-builder__input--number {
  width: 80px;
}

/* Templates */
.kanban-board-builder__templates {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kanban-board-builder__template-card {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.kanban-board-builder__template-card:hover {
  border-color: #c4b5fd; /* Light purple */
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
  transform: translateY(-2px);
}

.kanban-board-builder__template-name {
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.375rem;
}

.kanban-board-builder__template-lanes {
  font-size: 0.8125rem;
  color: #6b7280;
}

/* Board Container */
.kanban-board-builder__board-container {
  margin-bottom: 1rem;
}

.kanban-board-builder__add-lane-btn {
  margin-left: auto;
  padding: 0.375rem 0.625rem;
  background-color: #f5f3ff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #8b5cf6;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.kanban-board-builder__add-lane-btn:hover {
  background-color: #ede9fe;
}

.kanban-board-builder__lanes-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  min-height: 300px;
  padding-bottom: 0.5rem;
}

/* Lanes */
.kanban-lane {
  flex: 0 0 280px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.kanban-lane__header {
  padding: 0.75rem;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kanban-lane__handle {
  color: #94a3b8;
  cursor: grab;
  padding: 0.25rem;
}

.kanban-lane__handle:active {
  cursor: grabbing;
}

.kanban-lane__title-input {
  flex: 1;
  padding: 0.375rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.kanban-lane__delete-btn {
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.kanban-lane__delete-btn:hover {
  color: #ef4444;
  background-color: #fee2e2;
}

.kanban-lane__cards {
  padding: 0.75rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kanban-lane__cards-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 20px; /* Allow empty lanes to be drop targets */
}

.kanban-lane__add-card-btn {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background-color: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 4px;
  font-size: 0.8125rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.kanban-lane__add-card-btn:hover {
  background-color: #f1f5f9;
  color: #4b5563;
}

/* Cards */
.kanban-card {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  transition: all 0.15s;
  position: relative;
}

.kanban-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.kanban-card__handle {
  color: #cbd5e1;
  cursor: grab;
  padding: 0.125rem 0.25rem;
  font-size: 0.75rem;
  margin-right: 0.25rem;
  align-self: flex-start;
}

.kanban-card__handle:active {
  cursor: grabbing;
}

.kanban-card__checkbox {
  margin-right: 0.5rem;
  align-self: flex-start;
}

.kanban-card__checkbox input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: #8b5cf6;
}

.kanban-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.kanban-card__text {
  font-size: 0.875rem;
  color: #334155;
  word-break: break-word;
}

.kanban-card--checked .kanban-card__text {
  color: #94a3b8;
  text-decoration: line-through;
}

.kanban-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.kanban-card__tag {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background-color: #f1f5f9;
  color: #64748b;
  border-radius: 100px;
  white-space: nowrap;
}

.kanban-card__delete-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #cbd5e1;
  font-size: 0.75rem;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.kanban-card:hover .kanban-card__delete-btn {
  opacity: 1;
}

.kanban-card__delete-btn:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

/* Card colors */
.kanban-card--red {
  border-left: 4px solid #f87171;
}

.kanban-card--orange {
  border-left: 4px solid #fb923c;
}

.kanban-card--yellow {
  border-left: 4px solid #facc15;
}

.kanban-card--green {
  border-left: 4px solid #4ade80;
}

.kanban-card--blue {
  border-left: 4px solid #60a5fa;
}

.kanban-card--purple {
  border-left: 4px solid #a78bfa;
}

.kanban-card--gray {
  border-left: 4px solid #9ca3af;
}

/* Preview */
.kanban-board-builder__preview-content {
  flex: 1;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  overflow: auto;
}

.kanban-board-builder__preview-content pre {
  margin: 0;
  font-family: "Fira Code", monospace;
  font-size: 0.875rem;
  color: #334155;
  white-space: pre-wrap;
}

/* Code Editor */
.kanban-board-builder__code-mode {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kanban-board-builder__code-textarea {
  width: 100%;
  min-height: 400px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: "Fira Code", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
}

.kanban-board-builder__code-textarea:focus {
  outline: none;
  border-color: #c4b5fd;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.kanban-board-builder__code-help {
  font-size: 0.8125rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kanban-board-builder__code-help code {
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: "Fira Code", monospace;
}

/* Card Edit Modal */
.kanban-card-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.kanban-card-modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.kanban-card-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.kanban-card-modal__title {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.kanban-card-modal__close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.kanban-card-modal__close-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.kanban-card-modal__content {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.kanban-card-modal__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.kanban-card-modal__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.kanban-card-modal__input,
.kanban-card-modal__textarea {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
}

.kanban-card-modal__input:focus,
.kanban-card-modal__textarea:focus {
  outline: none;
  border-color: #c4b5fd;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.kanban-card-modal__checkbox-field {
  display: flex;
  align-items: center;
}

.kanban-card-modal__checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
}

.kanban-card-modal__checkbox-label input {
  width: 1rem;
  height: 1rem;
  accent-color: #8b5cf6;
}

.kanban-card-modal__tags-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kanban-card-modal__tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.kanban-card-modal__tag {
  display: flex;
  align-items: center;
  background-color: #f1f5f9;
  border-radius: 100px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: #4b5563;
}

.kanban-card-modal__tag-text {
  margin-right: 0.25rem;
}

.kanban-card-modal__tag-remove {
  width: 16px;
  height: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  padding: 0;
  font-size: 0.625rem;
}

.kanban-card-modal__tag-remove:hover {
  color: #ef4444;
  background-color: #fee2e2;
}

.kanban-card-modal__tag-add {
  display: flex;
  gap: 0.375rem;
}

.kanban-card-modal__tag-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.8125rem;
}

.kanban-card-modal__tag-input:focus {
  outline: none;
  border-color: #c4b5fd;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.kanban-card-modal__tag-add-btn {
  padding: 0.5rem;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kanban-card-modal__tag-add-btn:hover {
  background-color: #e2e8f0;
}

.kanban-card-modal__color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.kanban-card-modal__color-option {
  width: 24px;
  height: 24px;
  border-radius: 100%;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  transition: all 0.2s;
}

.kanban-card-modal__color-option.selected {
  transform: scale(1.15);
  border-color: #94a3b8;
}

.kanban-card-modal__color-option--none {
  width: auto;
  height: 24px;
  padding: 0 0.75rem;
  background-color: white;
  color: #64748b;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  border-radius: 12px;
}

.kanban-card-modal__color-option--red {
  background-color: #f87171;
}

.kanban-card-modal__color-option--orange {
  background-color: #fb923c;
}

.kanban-card-modal__color-option--yellow {
  background-color: #facc15;
}

.kanban-card-modal__color-option--green {
  background-color: #4ade80;
}

.kanban-card-modal__color-option--blue {
  background-color: #60a5fa;
}

.kanban-card-modal__color-option--purple {
  background-color: #a78bfa;
}

.kanban-card-modal__color-option--gray {
  background-color: #9ca3af;
}

.kanban-card-modal__actions {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  gap: 0.75rem;
}

.kanban-card-modal__cancel-btn {
  padding: 0.625rem 1rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
}

.kanban-card-modal__cancel-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.kanban-card-modal__save-btn {
  padding: 0.625rem 1.25rem;
  background-color: #8b5cf6;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.kanban-card-modal__save-btn:hover {
  background-color: #7c3aed;
}

/* Bottom Actions Bar */
.kanban-board-builder__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.kanban-board-builder__apply-btn {
  padding: 0.625rem 1.25rem;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.kanban-board-builder__apply-btn:hover {
  background-color: #7c3aed;
}
</style>
