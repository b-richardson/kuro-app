<template>
  <div class="recent-activity-section glass-card">
    <div class="section-header">
      <h3><i class="fas fa-bolt"></i> Recent Activity</h3>
    </div>
    
    <div class="activity-timeline">
      <div 
        v-for="activity in recentActivities" 
        :key="activity.id"
        class="activity-item"
      >
        <div class="activity-icon" :class="`activity-icon--${activity.type}`">
          <i :class="getActivityIcon(activity.type)"></i>
        </div>
        <div class="activity-content">
          <p class="activity-description">
            {{ getActivityDescription(activity) }}
          </p>
          <span class="activity-time">{{ formatActivityTime(activity.timestamp) }}</span>
        </div>
      </div>
      
      <!-- Empty state for no activities -->
      <div v-if="recentActivities.length === 0" class="empty-activity">
        <i class="fas fa-history empty-icon"></i>
        <p>No recent activity. Your actions will appear here.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useActivityStore } from '@/stores/activity';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const activityStore = useActivityStore();
const authStore = useAuthStore();

// Get recent activities from store for the current user
const recentActivities = computed(() => {
  const userId = authStore.user?.id || '1'; // Default to ID 1 if not logged in
  return activityStore.getUserActivities(userId)
    .slice(0, 5); // Limit to 5 most recent
});

// Get icon based on activity type
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'create': return 'fas fa-plus-circle';
    case 'update': return 'fas fa-edit';
    case 'export': return 'fas fa-file-export';
    case 'duplicate': return 'fas fa-copy';
    case 'delete': return 'fas fa-trash-alt';
    default: return 'fas fa-circle';
  }
};

// Get description based on activity type
const getActivityDescription = (activity: any) => {
  switch (activity.type) {
    case 'create':
      return `Created "${activity.templateName}" template`;
    case 'update':
      return `Updated "${activity.templateName}" template`;
    case 'export':
      return `Exported "${activity.templateName}" template`;
    case 'duplicate':
      return `Duplicated "${activity.templateName}" template`;
    case 'delete':
      return `Deleted "${activity.templateName}" template`;
    default:
      return `Interacted with "${activity.templateName}" template`;
  }
};

// Format activity timestamp
const formatActivityTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Today: show time
  if (diffDays === 0) {
    if (diffMins < 60) {
      return diffMins === 0 ? 'Just now' : `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else {
      return `Today, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    }
  }
  
  // Yesterday: show "Yesterday"
  if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
  }
  
  // Within last week: show day name
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' });
  }
  
  // Otherwise: show full date
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
</script>

<style scoped>
.recent-activity-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.activity-timeline {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-sm) var(--spacing-md);
  gap: var(--spacing-md);
  border-bottom: 1px solid var(--glass-border);
  transition: background-color var(--transition-fast);
}

.activity-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  flex-shrink: 0;
}

.activity-icon--create {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.activity-icon--update {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.activity-icon--export {
  background: rgba(156, 39, 176, 0.1);
  color: #9C27B0;
}

.activity-icon--duplicate {
  background: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}

.activity-icon--delete {
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
}

.activity-content {
  flex: 1;
}

.activity-description {
  font-size: 0.9rem;
  margin: 0 0 4px;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

/* Empty state */
.empty-activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
}

.empty-icon {
  font-size: 2rem;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-activity p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}
</style>