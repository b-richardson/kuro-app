import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue';
import { loadTemplateById } from '@/services/templates';

// Template category type
export type TemplateCategory = 'journaling' | 'productivity' | 'wellness' | 'goal' | 'all';

// Template compatibility type
export type TemplateCompatibility = 'core' | 'dataview' | 'tasks' | 'kanban';

// Template interface
export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  compatibility: TemplateCompatibility[];
  author: string;
  tags: string[];
  featured: boolean;
  badge?: string;
  fileName: string;
  content?: string; // Content is loaded dynamically
}

export const useFrameworksStore = defineStore('frameworks', () => {
  // State
  const templates = ref<Template[]>([
    {
      id: '1',
      title: 'Daily Journal',
      description: 'A comprehensive daily journal template with mood tracking, task planning, and reflection prompts.',
      category: 'journaling',
      compatibility: ['core'],
      author: 'Obsidian Team',
      tags: ['journaling', 'daily', 'reflection'],
      featured: true,
      badge: 'Staff Pick',
      fileName: 'Daily Journal.md'
    },
    {
      id: '2',
      title: 'Weekly Review',
      description: 'Review your week, plan ahead, and track your goals with this powerful weekly template.',
      category: 'productivity',
      compatibility: ['core', 'tasks'],
      author: 'Productivity Guru',
      tags: ['weekly', 'review', 'planning'],
      featured: true,
      badge: 'Expert Curated',
      fileName: 'Weekly Review.md'
    },
    {
      id: '3',
      title: 'Project Dashboard',
      description: 'Track all aspects of your project in one place with this comprehensive dashboard.',
      category: 'productivity',
      compatibility: ['dataview', 'tasks'],
      author: 'Project Manager',
      tags: ['project', 'dashboard', 'tracking'],
      featured: true,
      badge: 'Community Favorite',
      fileName: 'Project Dashboard.md'
    },
    {
      id: '4',
      title: 'Habit Tracker',
      description: 'Track your daily habits and build consistency with this visual habit tracker.',
      category: 'wellness',
      compatibility: ['dataview'],
      author: 'Wellness Coach',
      tags: ['habits', 'tracking', 'wellness'],
      featured: false,
      badge: 'Staff Pick',
      fileName: 'Habit Tracker.md'
    },
    {
      id: '5',
      title: 'Goal Setting Framework',
      description: 'Define and track meaningful goals with this structured approach to goal setting.',
      category: 'goal',
      compatibility: ['core'],
      author: 'Goal Expert',
      tags: ['goals', 'planning', 'achievement'],
      featured: false,
      badge: 'Expert Curated',
      fileName: 'Goal Setting Framework.md'
    },
    {
      id: '6',
      title: 'Meeting Notes',
      description: 'Capture effective meeting notes with action items, decisions, and follow-ups.',
      category: 'productivity',
      compatibility: ['core', 'tasks'],
      author: 'Efficiency Expert',
      tags: ['meetings', 'notes', 'work'],
      featured: false,
      badge: 'Community Favorite',
      fileName: 'Meeting Notes.md'
    },
    {
      id: '7',
      title: 'Book Notes',
      description: 'Organize your reading notes with this template designed for deep reading and insights capture.',
      category: 'productivity',
      compatibility: ['core'],
      author: 'Book Lover',
      tags: ['reading', 'notes', 'books'],
      featured: false,
      badge: 'Community Favorite',
      fileName: 'Book Notes.md'
    },
    {
      id: '8',
      title: 'Workout Tracker',
      description: 'Keep track of your workouts, progress, and fitness goals with this comprehensive template.',
      category: 'wellness',
      compatibility: ['core', 'dataview'],
      author: 'Fitness Coach',
      tags: ['fitness', 'workout', 'tracking'],
      featured: false,
      fileName: 'Workout Tracker.md'
    },
    {
      id: '9',
      title: 'Mood Tracker',
      description: 'Monitor and analyze your emotional well-being with this detailed mood tracking template.',
      category: 'wellness',
      compatibility: ['core'],
      author: 'Mental Health Expert',
      tags: ['wellness', 'mental health', 'mood'],
      featured: false,
      badge: 'New',
      fileName: 'Mood Tracker.md'
    }
  ]);
  
  const categories = ref([
    { id: 'all', name: 'All', icon: '📋' },
    { id: 'goal', name: 'Goal-Oriented', icon: '🎯' },
    { id: 'wellness', name: 'Wellness', icon: '🧘' },
    { id: 'productivity', name: 'Productivity', icon: '⚡' },
    { id: 'journaling', name: 'Journaling', icon: '📝' },
  ]);
  
  const compatibilityOptions = ref([
    { id: 'core', name: 'Core Obsidian' },
    { id: 'dataview', name: 'Dataview' },
    { id: 'tasks', name: 'Tasks' },
    { id: 'kanban', name: 'Kanban' },
  ]);

  // Computed
  const featuredTemplates = computed(() => {
    return templates.value.filter(template => template.featured);
  });
  
  // Get templates by category
  const getTemplatesByCategory = (category: TemplateCategory) => {
    if (category === 'all') {
      return templates.value;
    }
    return templates.value.filter(template => template.category === category);
  };
  
  // Get templates by compatibility
  const getTemplatesByCompatibility = (compatibility: TemplateCompatibility) => {
    return templates.value.filter(template => 
      template.compatibility.includes(compatibility)
    );
  };
  
  // Get template by ID with content
  const getTemplateById = (id: string) => {
    const template = templates.value.find(template => template.id === id);
    
    if (template && !template.content) {
      // Load content if not already loaded
      template.content = loadTemplateById(id);
    }
    
    return template;
  };
  
  // Initialize template content
  onMounted(() => {
    // Preload featured templates for better UX
    featuredTemplates.value.forEach(template => {
      if (!template.content) {
        template.content = loadTemplateById(template.id);
      }
    });
  });

  return {
    templates,
    categories,
    compatibilityOptions,
    featuredTemplates,
    getTemplatesByCategory,
    getTemplatesByCompatibility,
    getTemplateById
  };
});