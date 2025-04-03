/**
 * Service for loading templates from the filesystem or API
 */

// Import template content
import dailyJournal from '@/assets/frameworks/00 - Templates/Daily Journal.md?raw';
import weeklyReview from '@/assets/frameworks/00 - Templates/Weekly Review.md?raw';
import projectDashboard from '@/assets/frameworks/00 - Templates/Project Dashboard.md?raw';
import meetingNotes from '@/assets/frameworks/00 - Templates/Meeting Notes.md?raw';
import habitTracker from '@/assets/frameworks/00 - Templates/Habit Tracker.md?raw';
import goalSetting from '@/assets/frameworks/00 - Templates/Goal Setting Framework.md?raw';
import bookNotes from '@/assets/frameworks/00 - Templates/Book Notes.md?raw';
import workoutTracker from '@/assets/frameworks/00 - Templates/Workout Tracker.md?raw';
import moodTracker from '@/assets/frameworks/00 - Templates/Mood Tracker.md?raw';

/**
 * Load a template by ID
 * @param id The template ID
 * @returns The content of the template
 */
export function loadTemplateById(id: string): string {
  const templateMap = {
    '1': dailyJournal,
    '2': weeklyReview,
    '3': projectDashboard,
    '4': habitTracker,
    '5': goalSetting,
    '6': meetingNotes,
    '7': bookNotes,
    '8': workoutTracker,
    '9': moodTracker,
  };

  return templateMap[id] || '';
}

/**
 * Load all templates
 * @returns An object with all templates
 */
export function loadAllTemplates() {
  return {
    dailyJournal,
    weeklyReview,
    projectDashboard,
    meetingNotes,
    habitTracker,
    goalSetting,
    bookNotes,
    workoutTracker,
    moodTracker,
  };
}