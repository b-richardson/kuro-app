<template>
  <div class="templater-field-editor">
    <div class="templater-field-editor__header">
      <div class="templater-field-editor__title">
        <i class="fas fa-bolt"></i>
        Templater Field
      </div>
      <div class="templater-field-editor__view-toggle">
        <button 
          class="templater-field-editor__mode-btn"
          :class="{ 'active': editorMode === 'visual' }"
          @click="setEditorMode('visual')"
          title="Visual Editor"
        >
          <i class="fas fa-sliders-h"></i>
        </button>
        <button 
          class="templater-field-editor__mode-btn"
          :class="{ 'active': editorMode === 'code' }"
          @click="setEditorMode('code')"
          title="Code Editor"
        >
          <i class="fas fa-code"></i>
        </button>
      </div>
    </div>
    
    <div v-if="validationError" class="templater-field-editor__validation-error">
      <i class="fas fa-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <!-- Visual Editor Mode -->
    <div v-if="editorMode === 'visual'" class="templater-field-editor__visual-mode">
      <div class="templater-field-editor__tabs">
        <div 
          v-for="category in availableCategories"
          :key="category"
          class="templater-field-editor__tab"
          :class="{ 'active': activeCategory === category }"
          @click="activeCategory = category"
        >
          <i :class="getCategoryIcon(category)"></i>
          {{ getCategoryLabel(category) }}
        </div>
      </div>
      
      <div class="templater-field-editor__content">
        <!-- Field selection panel -->
        <div class="templater-field-editor__fields">
          <div 
            v-for="field in filteredFields"
            :key="field.id"
            class="templater-field-editor__field-item"
            :class="{ 'active': selectedField?.id === field.id }"
            @click="selectField(field)"
          >
            <div class="templater-field-editor__field-name">{{ field.name }}</div>
            <div class="templater-field-editor__field-description">{{ field.description }}</div>
          </div>
          
          <div v-if="activeCategory === 'script'" class="templater-field-editor__snippets">
            <h4 class="templater-field-editor__snippets-title">Script Snippets</h4>
            <div 
              v-for="snippet in templaterSnippets"
              :key="snippet.id"
              class="templater-field-editor__snippet-item"
              @click="applySnippet(snippet)"
            >
              <div class="templater-field-editor__snippet-name">{{ snippet.name }}</div>
              <div class="templater-field-editor__snippet-description">{{ snippet.description }}</div>
            </div>
          </div>
        </div>
        
        <!-- Field configuration panel -->
        <div class="templater-field-editor__config">
          <template v-if="selectedField">
            <h3 class="templater-field-editor__config-title">{{ selectedField.name }}</h3>
            <p class="templater-field-editor__config-description">{{ selectedField.description }}</p>
            
            <!-- Field arguments configuration -->
            <div 
              v-if="selectedField.arguments && selectedField.arguments.length > 0"
              class="templater-field-editor__arguments"
            >
              <div 
                v-for="(arg, index) in selectedField.arguments"
                :key="index"
                class="templater-field-editor__argument"
              >
                <label class="templater-field-editor__argument-label">
                  {{ formatArgName(arg.name) }}
                  <span v-if="arg.required" class="templater-field-editor__required">*</span>
                </label>
                
                <!-- String argument type -->
                <select 
                  v-if="arg.type === 'string' && arg.options && arg.options.length > 0"
                  v-model="fieldArgs[arg.name]"
                  class="templater-field-editor__select"
                >
                  <option v-for="opt in arg.options" :key="opt" :value="opt">
                    {{ getOptionLabel(opt) }}
                  </option>
                </select>
                
                <input 
                  v-else-if="arg.type === 'string'"
                  type="text"
                  v-model="fieldArgs[arg.name]"
                  :placeholder="arg.default || ''"
                  class="templater-field-editor__input"
                />
                
                <!-- Number argument type -->
                <input 
                  v-else-if="arg.type === 'number'"
                  type="number"
                  v-model.number="fieldArgs[arg.name]"
                  :placeholder="arg.default || ''"
                  class="templater-field-editor__input"
                />
                
                <!-- Boolean argument type -->
                <div 
                  v-else-if="arg.type === 'boolean'"
                  class="templater-field-editor__toggle-container"
                >
                  <label class="templater-field-editor__toggle">
                    <input 
                      type="checkbox" 
                      :checked="fieldArgs[arg.name] === true || fieldArgs[arg.name] === 'true'"
                      @change="updateBooleanArg(arg.name, $event)"
                    />
                    <span class="templater-field-editor__toggle-slider"></span>
                  </label>
                  <span class="templater-field-editor__toggle-label">
                    {{ fieldArgs[arg.name] === true || fieldArgs[arg.name] === 'true' ? 'Yes' : 'No' }}
                  </span>
                </div>
                
                <!-- Date argument type -->
                <input 
                  v-else-if="arg.type === 'date'"
                  type="date"
                  v-model="fieldArgs[arg.name]"
                  class="templater-field-editor__input"
                />
                
                <div class="templater-field-editor__argument-help">
                  {{ arg.description }}
                </div>
              </div>
            </div>
            
            <div class="templater-field-editor__preview">
              <div class="templater-field-editor__preview-label">Preview:</div>
              <pre class="templater-field-editor__preview-code">{{ generatedSyntax }}</pre>
            </div>
            
            <div class="templater-field-editor__actions">
              <button 
                class="templater-field-editor__insert-btn"
                @click="applyField"
              >
                Insert Field
              </button>
            </div>
          </template>
          
          <!-- Script editor for JavaScript category -->
          <template v-else-if="activeCategory === 'script'">
            <h3 class="templater-field-editor__config-title">JavaScript Script</h3>
            <p class="templater-field-editor__config-description">
              Write custom JavaScript code that will run when the template is applied.
              Use 'return' to output a value.
            </p>
            
            <div class="templater-field-editor__script-editor">
              <textarea
                v-model="scriptCode"
                class="templater-field-editor__script-textarea"
                placeholder="// Write your JavaScript code here
// Example:
const now = new Date();
return now.toLocaleDateString();"
                rows="10"
              ></textarea>
            </div>
            
            <div class="templater-field-editor__preview">
              <div class="templater-field-editor__preview-label">Preview:</div>
              <pre class="templater-field-editor__preview-code">{{ scriptPreview }}</pre>
            </div>
            
            <div class="templater-field-editor__actions">
              <button 
                class="templater-field-editor__insert-btn"
                @click="applyScript"
              >
                Insert Script
              </button>
            </div>
          </template>
          
          <div v-else class="templater-field-editor__empty-state">
            <i class="fas fa-hand-pointer"></i>
            <p>Select a field from the list to configure it</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Code Editor Mode -->
    <div v-else class="templater-field-editor__code-mode">
      <div class="templater-field-editor__code-editor">
        <textarea
          v-model="rawCode"
          class="templater-field-editor__code-textarea"
          placeholder="Enter Templater syntax, e.g. <% tp.date.now() %>"
          rows="5"
          @input="validateRawCode"
        ></textarea>
      </div>
      
      <div class="templater-field-editor__code-help">
        <i class="fas fa-info-circle"></i>
        Use <code>&lt;% ... %&gt;</code> for Templater expressions or <code>&lt;%* ... %&gt;</code> for JavaScript code.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { 
  TemplaterCategory, 
  TemplaterField, 
  TEMPLATER_FIELDS, 
  TEMPLATER_SNIPPETS,
  generateTemplaterSyntax,
  generateTemplaterScriptSyntax,
  validateTemplaterSyntax,
  DATE_FORMATS 
} from '@/utils/templaterUtils';

// Props and emits
const props = defineProps<{
  content: string[]
}>();

const emit = defineEmits<{
  (e: 'update:content', content: string[]): void
}>();

// State
const editorMode = ref<'visual' | 'code'>('visual');
const activeCategory = ref<TemplaterCategory>(TemplaterCategory.DATE);
const selectedField = ref<TemplaterField | null>(null);
const fieldArgs = ref<Record<string, any>>({});
const rawCode = ref('');
const scriptCode = ref('');
const validationError = ref('');

// Computed properties
const availableCategories = computed(() => {
  return Object.values(TemplaterCategory);
});

const filteredFields = computed(() => {
  return TEMPLATER_FIELDS.filter(field => field.category === activeCategory.value);
});

const templaterSnippets = computed(() => {
  return TEMPLATER_SNIPPETS;
});

const generatedSyntax = computed(() => {
  if (!selectedField.value) return '';
  return generateTemplaterSyntax(selectedField.value.id, fieldArgs.value);
});

const scriptPreview = computed(() => {
  if (!scriptCode.value) return '';
  return generateTemplaterScriptSyntax(scriptCode.value);
});

// Initialize from props
onMounted(() => {
  initializeFromContent();
});

// Watch for content changes from parent
watch(() => props.content, () => {
  initializeFromContent();
}, { deep: true });

// Methods
function initializeFromContent() {
  const content = props.content.join('\n');
  rawCode.value = content;
  
  // Try to parse the content
  if (content.trim().startsWith('<%*')) {
    // This is a script
    editorMode.value = 'visual';
    activeCategory.value = TemplaterCategory.SCRIPT;
    
    // Extract the script content
    const scriptMatch = content.match(/<%\*\s*([\s\S]*?)\s*%>/);
    if (scriptMatch && scriptMatch[1]) {
      scriptCode.value = scriptMatch[1].trim();
    }
  } else if (content.trim().startsWith('<%')) {
    // This is a field
    editorMode.value = 'visual';
    
    // Try to match with a known field
    const sanitizedContent = content.replace(/<%|%>/g, '').trim();
    
    for (const field of TEMPLATER_FIELDS) {
      if (sanitizedContent.startsWith(field.syntax)) {
        selectedField.value = field;
        activeCategory.value = field.category;
        
        // Extract arguments if present
        if (field.arguments && field.arguments.length > 0) {
          const argsMatch = sanitizedContent.match(/\((.*)\)/);
          if (argsMatch && argsMatch[1]) {
            const args = argsMatch[1].split(',').map(arg => arg.trim());
            
            // Assign arguments to the fieldArgs object
            field.arguments.forEach((argDef, index) => {
              if (index < args.length) {
                // Handle string arguments (remove quotes)
                if (argDef.type === 'string' && args[index].startsWith('"') && args[index].endsWith('"')) {
                  fieldArgs.value[argDef.name] = args[index].slice(1, -1);
                } else if (argDef.type === 'boolean') {
                  fieldArgs.value[argDef.name] = args[index] === 'true';
                } else if (argDef.type === 'number') {
                  fieldArgs.value[argDef.name] = Number(args[index]);
                } else {
                  fieldArgs.value[argDef.name] = args[index];
                }
              }
            });
          }
        }
        
        break;
      }
    }
  }
  
  // Validate the content
  validateRawCode();
}

function setEditorMode(mode: 'visual' | 'code') {
  if (mode === 'code' && editorMode.value === 'visual') {
    // Switching to code mode, update raw code from visual editor
    if (activeCategory.value === TemplaterCategory.SCRIPT) {
      rawCode.value = scriptPreview.value;
    } else if (selectedField.value) {
      rawCode.value = generatedSyntax.value;
    }
  } else if (mode === 'visual' && editorMode.value === 'code') {
    // Switching to visual mode, try to parse the raw code
    initializeFromContent();
  }
  
  editorMode.value = mode;
}

function getCategoryIcon(category: TemplaterCategory): string {
  const icons: Record<TemplaterCategory, string> = {
    [TemplaterCategory.DATE]: 'fas fa-calendar-alt',
    [TemplaterCategory.FILE]: 'fas fa-file-alt',
    [TemplaterCategory.SYSTEM]: 'fas fa-cog',
    [TemplaterCategory.WEB]: 'fas fa-globe',
    [TemplaterCategory.FRONTMATTER]: 'fas fa-list',
    [TemplaterCategory.SCRIPT]: 'fas fa-code'
  };
  
  return icons[category] || 'fas fa-question';
}

function getCategoryLabel(category: TemplaterCategory): string {
  const labels: Record<TemplaterCategory, string> = {
    [TemplaterCategory.DATE]: 'Date & Time',
    [TemplaterCategory.FILE]: 'File Properties',
    [TemplaterCategory.SYSTEM]: 'System',
    [TemplaterCategory.WEB]: 'Web',
    [TemplaterCategory.FRONTMATTER]: 'Frontmatter',
    [TemplaterCategory.SCRIPT]: 'JavaScript'
  };
  
  return labels[category] || category;
}

function selectField(field: TemplaterField) {
  selectedField.value = field;
  
  // Initialize arguments with defaults
  fieldArgs.value = {};
  if (field.arguments) {
    field.arguments.forEach(arg => {
      if (arg.default !== undefined) {
        fieldArgs.value[arg.name] = arg.default;
      }
    });
  }
}

function formatArgName(name: string): string {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getOptionLabel(option: string): string {
  // For date formats, find the label
  const dateFormat = DATE_FORMATS.find(df => df.value === option);
  if (dateFormat) {
    return dateFormat.label;
  }
  
  return option;
}

function updateBooleanArg(name: string, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  fieldArgs.value[name] = checked;
}

function applyField() {
  if (!selectedField.value) return;
  
  // Generate the syntax and update the content
  const syntax = generatedSyntax.value;
  emit('update:content', [syntax]);
}

function applyScript() {
  if (!scriptCode.value.trim()) return;
  
  // Generate the script syntax and update the content
  const syntax = scriptPreview.value;
  emit('update:content', [syntax]);
}

function applySnippet(snippet: { id: string; code: string }) {
  scriptCode.value = snippet.code;
}

function validateRawCode() {
  validationError.value = '';
  
  // Skip validation if empty
  if (!rawCode.value.trim()) return;
  
  // Validate Templater syntax
  const validation = validateTemplaterSyntax(rawCode.value);
  if (!validation.isValid) {
    validationError.value = validation.error || 'Invalid Templater syntax';
    return;
  }
  
  // If valid, update the content
  emit('update:content', [rawCode.value]);
}
</script>

<style scoped>
.templater-field-editor {
  width: 100%;
  font-size: 0.9375rem;
}

.templater-field-editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.templater-field-editor__title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
}

.templater-field-editor__view-toggle {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.templater-field-editor__mode-btn {
  padding: 0.4rem 0.75rem;
  background-color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #64748b;
}

.templater-field-editor__mode-btn.active {
  background-color: #f1f5f9;
  font-weight: 500;
  color: #3b82f6;
}

.templater-field-editor__validation-error {
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
.templater-field-editor__visual-mode {
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.templater-field-editor__tabs {
  display: flex;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.templater-field-editor__tab {
  padding: 0.75rem 1rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid transparent;
}

.templater-field-editor__tab.active {
  color: #3b82f6;
  background-color: rgba(219, 234, 254, 0.5);
  border-bottom-color: #3b82f6;
}

.templater-field-editor__tab:hover:not(.active) {
  background-color: #f1f5f9;
  color: #475569;
}

.templater-field-editor__content {
  display: flex;
  min-height: 320px;
}

.templater-field-editor__fields {
  width: 40%;
  border-right: 1px solid #e2e8f0;
  background-color: #f8fafc;
  overflow-y: auto;
  max-height: 500px;
}

.templater-field-editor__field-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.templater-field-editor__field-item:hover {
  background-color: #f1f5f9;
}

.templater-field-editor__field-item.active {
  background-color: rgba(219, 234, 254, 0.5);
}

.templater-field-editor__field-name {
  font-weight: 500;
  color: #334155;
  margin-bottom: 0.25rem;
}

.templater-field-editor__field-description {
  font-size: 0.8125rem;
  color: #64748b;
}

.templater-field-editor__snippets {
  padding: 0.75rem 1rem;
}

.templater-field-editor__snippets-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #475569;
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.templater-field-editor__snippet-item {
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.templater-field-editor__snippet-item:hover {
  background-color: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.templater-field-editor__snippet-name {
  font-weight: 500;
  color: #334155;
  margin-bottom: 0.25rem;
}

.templater-field-editor__snippet-description {
  font-size: 0.8125rem;
  color: #64748b;
}

.templater-field-editor__config {
  flex: 1;
  padding: 1.25rem;
  overflow-y: auto;
}

.templater-field-editor__config-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #334155;
  margin: 0 0 0.5rem;
}

.templater-field-editor__config-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1.25rem;
}

.templater-field-editor__arguments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.templater-field-editor__argument-label {
  display: block;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
}

.templater-field-editor__required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.templater-field-editor__input,
.templater-field-editor__select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9375rem;
  background-color: white;
  transition: all 0.2s;
}

.templater-field-editor__input:focus,
.templater-field-editor__select:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.templater-field-editor__toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.templater-field-editor__toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.templater-field-editor__toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.templater-field-editor__toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
  border-radius: 24px;
}

.templater-field-editor__toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.templater-field-editor__toggle input:checked + .templater-field-editor__toggle-slider {
  background-color: #3b82f6;
}

.templater-field-editor__toggle input:checked + .templater-field-editor__toggle-slider:before {
  transform: translateX(24px);
}

.templater-field-editor__toggle-label {
  font-size: 0.9375rem;
  color: #475569;
}

.templater-field-editor__argument-help {
  font-size: 0.8125rem;
  color: #64748b;
  margin-top: 0.375rem;
}

.templater-field-editor__preview {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.templater-field-editor__preview-label {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: #64748b;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.templater-field-editor__preview-code {
  padding: 0.75rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  color: #334155;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.templater-field-editor__actions {
  display: flex;
  justify-content: flex-end;
}

.templater-field-editor__insert-btn {
  padding: 0.625rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.templater-field-editor__insert-btn:hover {
  background-color: #2563eb;
}

.templater-field-editor__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.templater-field-editor__empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.templater-field-editor__script-editor {
  margin-bottom: 1.25rem;
}

.templater-field-editor__script-textarea {
  width: 100%;
  min-height: 200px;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
}

.templater-field-editor__script-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Code Editor */
.templater-field-editor__code-mode {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.templater-field-editor__code-textarea {
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
}

.templater-field-editor__code-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.templater-field-editor__code-help {
  font-size: 0.8125rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.templater-field-editor__code-help code {
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: 'Fira Code', monospace;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .templater-field-editor__content {
    flex-direction: column;
  }
  
  .templater-field-editor__fields {
    width: 100%;
    max-height: 250px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .templater-field-editor__tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  
  .templater-field-editor__tab {
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
  }
}
</style>