import { defineStore } from "pinia";
import { ref } from "vue";

export type FocusMode = "none" | "editor" | "preview";

export const useUIStore = defineStore("ui", () => {
  // State
  const showMarkdownPreview = ref(false);
  const currentView = ref("editor");
  const toastMessages = ref<
    { id: string; message: string; type: string; timeout: number }[]
  >([]);
  const isLoading = ref(false);
  const isModified = ref(false);
  const focusMode = ref<FocusMode>("none");

  // Confirmation dialog state
  const showConfirmDialog = ref(false);
  const confirmDialogTitle = ref("");
  const confirmDialogMessage = ref("");
  const confirmDialogIsHTML = ref(false);
  const confirmDialogConfirmText = ref("Confirm");
  const confirmDialogCancelText = ref("Cancel");
  const confirmDialogShowCancel = ref(true);
  const confirmDialogConfirmCallback = ref<(() => void) | null>(null);
  const confirmDialogCancelCallback = ref<(() => void) | null>(null);

  // Actions
  function toggleMarkdownPreview() {
    showMarkdownPreview.value = !showMarkdownPreview.value;
    saveUIPreferences();
  }

  function setMarkdownPreview(show: boolean) {
    showMarkdownPreview.value = show;
    saveUIPreferences();
  }

  function showToast(
    message: string,
    type: "success" | "error" | "info" = "info",
    timeout: number = 3000
  ) {
    const id = Date.now().toString();
    toastMessages.value.push({ id, message, type, timeout });
    return id;
  }

  function removeToast(id: string) {
    toastMessages.value = toastMessages.value.filter(
      (toast) => toast.id !== id
    );
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setModified(modified: boolean) {
    isModified.value = modified;
  }

  function setFocusMode(mode: FocusMode) {
    focusMode.value = mode;
    saveUIPreferences();
  }

  function showConfirmationDialog(
    title: string,
    message: string,
    confirmText: string = "Confirm",
    cancelText: string = "Cancel",
    onConfirm: (() => void) | null = null,
    onCancel: (() => void) | null = null,
    isHTML: boolean = false,
    showCancel: boolean = true
  ) {
    confirmDialogTitle.value = title;
    confirmDialogMessage.value = message;
    confirmDialogIsHTML.value = isHTML;
    confirmDialogConfirmText.value = confirmText;
    confirmDialogCancelText.value = cancelText;
    confirmDialogShowCancel.value = showCancel;
    confirmDialogConfirmCallback.value = onConfirm;
    confirmDialogCancelCallback.value = onCancel;
    showConfirmDialog.value = true;
  }

  function setConfirmDialog(options: {
    title: string;
    message: string;
    isHTML?: boolean;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) {
    confirmDialogTitle.value = options.title;
    confirmDialogMessage.value = options.message;
    confirmDialogIsHTML.value = options.isHTML ?? false;
    confirmDialogConfirmText.value = options.confirmText ?? "Confirm";
    confirmDialogCancelText.value = options.cancelText ?? "Cancel";
    confirmDialogShowCancel.value = options.showCancel ?? true;
    confirmDialogConfirmCallback.value = options.onConfirm ?? null;
    confirmDialogCancelCallback.value = options.onCancel ?? null;
    showConfirmDialog.value = true;
  }

  function closeConfirmDialog() {
    showConfirmDialog.value = false;
  }

  function handleConfirmDialogConfirm() {
    if (confirmDialogConfirmCallback.value) {
      confirmDialogConfirmCallback.value();
    }
    showConfirmDialog.value = false;
  }

  function handleConfirmDialogCancel() {
    if (confirmDialogCancelCallback.value) {
      confirmDialogCancelCallback.value();
    }
    showConfirmDialog.value = false;
  }

  function loadUIPreferences() {
    const preferences = localStorage.getItem("ui-preferences");
    if (preferences) {
      const {
        showMarkdownPreview: showPreview,
        sidebarHidden: hidden,
        editorWidth: width,
        focusMode: mode,
      } = JSON.parse(preferences);

      showMarkdownPreview.value = showPreview ?? false;
      focusMode.value = mode ?? "none";
    }
  }

  function saveUIPreferences() {
    localStorage.setItem(
      "ui-preferences",
      JSON.stringify({
        showMarkdownPreview: showMarkdownPreview.value,
        focusMode: focusMode.value,
      })
    );
  }

  return {
    showMarkdownPreview,
    currentView,
    toastMessages,
    isLoading,
    isModified,
    focusMode,
    showConfirmDialog,
    confirmDialogTitle,
    confirmDialogMessage,
    confirmDialogIsHTML,
    confirmDialogConfirmText,
    confirmDialogCancelText,
    confirmDialogShowCancel,
    toggleMarkdownPreview,
    setMarkdownPreview,
    showToast,
    removeToast,
    setLoading,
    setModified,
    setFocusMode,
    showConfirmationDialog,
    setConfirmDialog,
    closeConfirmDialog,
    handleConfirmDialogConfirm,
    handleConfirmDialogCancel,
    loadUIPreferences,
    saveUIPreferences,
  };
});
