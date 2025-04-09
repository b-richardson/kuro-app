import { ref } from "vue";

interface TemplateFile {
  path: string;
  title: string;
  category: string;
  subcategory: string;
  content: string;
}

// Dynamically import all markdown files under your templates directory
const files = import.meta.glob("@/assets/frameworks/00 - Templates/**/*.md", {
  as: "raw",
  eager: true,
});

export function useTemplateLibrary() {
  const templates = ref<TemplateFile[]>([]);

  for (const path in files) {
    const content = files[path] as string;

    // Normalize path: "@/assets/frameworks/00 - Templates/01 - Logs/1.1 - Daily.md"
    const parts = path.replace(/^.*00 - Templates\//, "").split("/");

    const category = parts[0]?.replace(/\d+ - /, "") || "Uncategorized";
    const fileName = parts.at(-1)?.replace(".md", "") || "Untitled";
    const subcategory =
      parts.length > 2 ? parts[1]?.replace(/\d+\.\d+ - /, "") : "";

    templates.value.push({
      path,
      title: fileName,
      category,
      subcategory,
      content,
    });
  }

  return {
    templates,
  };
}
