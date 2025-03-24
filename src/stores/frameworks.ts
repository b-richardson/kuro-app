import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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
  content: string;
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
      content: '# Daily Journal\n\n## Mood Tracker\n- How are you feeling today?\n- Energy level (1-10):\n\n## Tasks\n- [ ] Task 1\n- [ ] Task 2\n\n## Gratitude\n- I am grateful for:\n\n## Reflection\n- What went well today?\n- What could be improved?'
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
      content: '# Weekly Review\n\n## Past Week Review\n- Accomplishments:\n- Challenges:\n\n## Next Week Planning\n- Priority 1:\n- Priority 2:\n- Priority 3:\n\n## Goals Progress\n- Goal 1 progress:\n- Goal 2 progress:'
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
      content: '# Project Dashboard\n\n## Overview\n- Project Name:\n- Deadline:\n- Status:\n\n## Tasks\n- [ ] Task 1\n- [ ] Task 2\n\n## Resources\n- Link 1\n- Link 2\n\n## Notes\n'
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
      content: '# Habit Tracker\n\n## Daily Habits\n- [ ] Meditation\n- [ ] Exercise\n- [ ] Reading\n\n## Weekly Review\n- Which habits were most consistent?\n- What obstacles did you face?\n\n## Monthly View\n(Table with days and habits)'
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
      content: '# Goal Setting Framework\n\n## Goal Definition\n- What do you want to achieve?\n- Why is this important to you?\n- How will you measure success?\n\n## Action Plan\n- Step 1:\n- Step 2:\n- Step 3:\n\n## Timeline\n- Milestone 1 (date):\n- Milestone 2 (date):\n\n## Obstacles & Solutions\n- Potential obstacle 1:\n  - Solution:\n- Potential obstacle 2:\n  - Solution:'
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
      content: '# Meeting Notes\n\n## Meeting Information\n- Date:\n- Attendees:\n- Purpose:\n\n## Agenda\n1. \n2. \n3. \n\n## Discussion\n- \n\n## Action Items\n- [ ] Action 1 (Owner: )\n- [ ] Action 2 (Owner: )\n\n## Decisions\n- \n\n## Next Steps\n- '
    },
    {
      id: '7',
      title: 'Book Notes Template',
      description: 'Organize your reading notes with this template designed for deep reading and insights capture.',
      category: 'productivity',
      compatibility: ['core'],
      author: 'Book Lover',
      tags: ['reading', 'notes', 'books'],
      featured: false,
      badge: 'Community Favorite',
      content: '# Book Notes: [Title]\n\n## Book Information\n- Author:\n- Year Published:\n- Genre:\n\n## Summary\n\n*Brief summary of the book*\n\n## Key Ideas\n- \n- \n- \n\n## Quotes\n> \n\n## Personal Reflections\n- \n\n## Action Items\n- [ ] \n'
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
      content: '# Workout Log\n\n## Today\'s Stats\n- Date:\n- Weight:\n- Energy Level (1-10):\n- Sleep Quality (1-10):\n\n## Workout Plan\n### Warmup\n- [ ] 5 min cardio\n- [ ] Dynamic stretching\n\n### Main Workout\n| Exercise | Sets | Reps | Weight | Notes |\n| -------- | ---- | ---- | ------ | ----- |\n| | | | | |\n| | | | | |\n| | | | | |\n\n### Cooldown\n- [ ] Static stretching\n- [ ] 5 min light cardio\n\n## Notes\n- \n\n## Next Workout Plan\n- '
    },
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
  
  // Get template by ID
  const getTemplateById = (id: string) => {
    return templates.value.find(template => template.id === id);
  };

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