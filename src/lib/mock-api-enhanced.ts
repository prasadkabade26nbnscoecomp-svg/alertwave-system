import { Alert, User, UserAlertPreference, AlertWithPreferences, AnalyticsData, AlertSeverity, AlertStatus } from './types';
import { mockAlerts, mockUsers, mockUserAlertPreferences, mockNotificationDeliveries, mockTeams } from './mock-data';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { notificationManager } from './notification/NotificationManager';
import { reminderScheduler, ReminderObserver, ReminderEvent } from './reminder/ReminderScheduler';
import { userPreferenceManager } from './user-preferences/UserPreferenceManager';
import { analyticsEngine } from './analytics/AnalyticsEngine';

// Simulated API responses with realistic delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced Mock API Service implementing OOP principles
 * Integrates with notification system, reminder scheduler, and analytics
 */
class EnhancedMockApiService implements ReminderObserver {
  private alerts: Alert[] = [...mockAlerts];
  private users: User[] = [...mockUsers];
  private currentUserId = 'u2'; // Default to Sarah Chen
  private reminderLogs: ReminderEvent[] = [];

  constructor() {
    // Initialize managers with existing data
    userPreferenceManager.constructor(mockUserAlertPreferences);
    analyticsEngine.updateData(this.alerts, this.users);
    
    // Register as observer for reminder events
    reminderScheduler.addObserver(this);
    
    // Initialize reminders for active alerts
    this.initializeReminders();
  }

  onReminderEvent(event: ReminderEvent): void {
    this.reminderLogs.push(event);
    console.log('Reminder event:', event);
  }

  private initializeReminders(): void {
    const now = new Date();
    
    this.alerts.forEach(alert => {
      if (alert.archived || 
          isBefore(now, new Date(alert.startTime)) || 
          isAfter(now, new Date(alert.expiryTime))) {
        return;
      }

      // Get all users who should receive this alert
      const eligibleUsers = this.getEligibleUsers(alert);
      
      eligibleUsers.forEach(user => {
        const preference = userPreferenceManager.getPreference(alert.id, user.id);
        reminderScheduler.scheduleReminder(alert, user, preference);
      });
    });
  }

  private getEligibleUsers(alert: Alert): User[] {
    return this.users.filter(user => {
      if (alert.visibility.org) return true;
      if (alert.visibility.teams.includes(user.teamId)) return true;
      if (alert.visibility.users.includes(user.id)) return true;
      return false;
    });
  }

  setCurrentUser(userId: string) {
    this.currentUserId = userId;
  }

  getCurrentUser() {
    return this.users.find(u => u.id === this.currentUserId) || this.users[0];
  }

  // Admin Alert Management
  async createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    await delay(500);
    const newAlert: Alert = {
      ...alertData,
      id: `a${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.alerts.push(newAlert);
    analyticsEngine.updateData(this.alerts, this.users);

    // Schedule reminders for eligible users
    const eligibleUsers = this.getEligibleUsers(newAlert);
    eligibleUsers.forEach(user => {
      reminderScheduler.scheduleReminder(newAlert, user);
    });

    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert> {
    await delay(300);
    const index = this.alerts.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Alert not found');
    
    const oldAlert = this.alerts[index];
    this.alerts[index] = {
      ...oldAlert,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    analyticsEngine.updateData(this.alerts, this.users);

    // Update reminders if necessary
    if (updates.reminderEnabled !== undefined || 
        updates.reminderFrequencyMinutes !== undefined ||
        updates.archived !== undefined) {
      
      const eligibleUsers = this.getEligibleUsers(this.alerts[index]);
      eligibleUsers.forEach(user => {
        const reminderId = `${id}_${user.id}`;
        reminderScheduler.clearReminder(reminderId);
        
        if (!updates.archived) {
          const preference = userPreferenceManager.getPreference(id, user.id);
          reminderScheduler.scheduleReminder(this.alerts[index], user, preference);
        }
      });
    }

    return this.alerts[index];
  }

  async getAlertsAdmin(filters?: {
    severity?: AlertSeverity;
    status?: AlertStatus;
    audience?: 'org' | 'team' | 'user';
    teamId?: string;
    userId?: string;
  }): Promise<Alert[]> {
    await delay(200);
    let filtered = [...this.alerts];

    if (filters?.severity) {
      filtered = filtered.filter(a => a.severity === filters.severity);
    }

    if (filters?.status) {
      const now = new Date();
      filtered = filtered.filter(a => {
        if (filters.status === 'archived') return a.archived;
        if (filters.status === 'expired') return !a.archived && isAfter(now, new Date(a.expiryTime));
        if (filters.status === 'active') return !a.archived && isBefore(now, new Date(a.expiryTime)) && isAfter(now, new Date(a.startTime));
        return true;
      });
    }

    return filtered;
  }

  // User Alert Management
  async getUserAlerts(): Promise<AlertWithPreferences[]> {
    await delay(200);
    const currentUser = this.getCurrentUser();
    const now = new Date();

    // Reset expired snoozes
    userPreferenceManager.resetExpiredSnoozes();

    // Filter alerts visible to current user
    const visibleAlerts = this.alerts.filter(alert => {
      if (alert.archived) return false;
      if (isBefore(now, new Date(alert.startTime)) || isAfter(now, new Date(alert.expiryTime))) return false;

      // Check visibility
      if (alert.visibility.org) return true;
      if (alert.visibility.teams.includes(currentUser.teamId)) return true;
      if (alert.visibility.users.includes(currentUser.id)) return true;
      return false;
    });

    // Add user preferences and reminder info
    return visibleAlerts.map(alert => {
      const preference = userPreferenceManager.getPreference(alert.id, currentUser.id);
      
      // Calculate next reminder time
      let nextReminderAt: string | undefined;
      let isEligibleForReminder = false;

      if (alert.reminderEnabled && !userPreferenceManager.isSnoozedForToday(alert.id, currentUser.id)) {
        // Check if there's an active reminder scheduled
        const reminderId = `${alert.id}_${currentUser.id}`;
        const activeReminders = reminderScheduler.getActiveReminders();
        
        if (activeReminders.includes(reminderId)) {
          // Calculate approximate next reminder time
          const lastDelivery = notificationManager.getDeliveryLogs()
            .filter(log => log.alertId === alert.id && log.userId === currentUser.id)
            .sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime())[0];

          if (lastDelivery) {
            const nextReminder = new Date(new Date(lastDelivery.deliveredAt).getTime() + alert.reminderFrequencyMinutes * 60000);
            if (isAfter(nextReminder, now)) {
              nextReminderAt = nextReminder.toISOString();
            }
          }
        } else {
          isEligibleForReminder = true;
        }
      }

      return {
        ...alert,
        userPreference: preference,
        nextReminderAt,
        isEligibleForReminder
      };
    });
  }

  async snoozeAlert(alertId: string): Promise<void> {
    await delay(200);
    const currentUser = this.getCurrentUser();
    
    const preference = userPreferenceManager.snoozeForDay(alertId, currentUser.id);
    
    // Clear any active reminders
    const reminderId = `${alertId}_${currentUser.id}`;
    reminderScheduler.clearReminder(reminderId);
  }

  async markAlertRead(alertId: string): Promise<void> {
    await delay(100);
    const currentUser = this.getCurrentUser();
    userPreferenceManager.markAsRead(alertId, currentUser.id);
  }

  async markAlertUnread(alertId: string): Promise<void> {
    await delay(100);
    const currentUser = this.getCurrentUser();
    userPreferenceManager.markAsUnread(alertId, currentUser.id);
  }

  async getAnalytics(): Promise<AnalyticsData> {
    await delay(300);
    return analyticsEngine.generateAnalytics();
  }

  async getDetailedAnalytics() {
    await delay(300);
    return analyticsEngine.generateDetailedAnalytics();
  }

  async triggerReminders(): Promise<{ triggered: number }> {
    await delay(1000);
    let triggered = 0;
    const now = new Date();

    for (const alert of this.alerts) {
      if (!alert.reminderEnabled || alert.archived) continue;
      if (isBefore(now, new Date(alert.startTime)) || isAfter(now, new Date(alert.expiryTime))) continue;

      const eligibleUsers = this.getEligibleUsers(alert);

      for (const user of eligibleUsers) {
        if (!userPreferenceManager.isSnoozedForToday(alert.id, user.id)) {
          // Deliver notification
          await notificationManager.deliverNotification(alert, user, alert.deliveryTypes);
          triggered++;
          
          // Reschedule reminder
          const preference = userPreferenceManager.getPreference(alert.id, user.id);
          reminderScheduler.scheduleReminder(alert, user, preference);
        }
      }
    }

    return { triggered };
  }

  getUsers() {
    return [...this.users];
  }

  getTeams() {
    return [...mockTeams];
  }

  getReminderLogs(): ReminderEvent[] {
    return [...this.reminderLogs];
  }

  getNotificationLogs() {
    return notificationManager.getDeliveryLogs();
  }

  getAvailableChannels(): string[] {
    return notificationManager.getAvailableChannels();
  }
}

export const enhancedMockApi = new EnhancedMockApiService();