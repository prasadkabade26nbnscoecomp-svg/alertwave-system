import { Alert, User, UserAlertPreference } from '../types';
import { notificationManager } from '../notification/NotificationManager';

/**
 * Reminder scheduler implementing Observer Pattern
 * Manages recurring reminders with proper snooze logic
 */
export class ReminderScheduler {
  private reminders: Map<string, NodeJS.Timeout> = new Map();
  private observers: ReminderObserver[] = [];

  addObserver(observer: ReminderObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: ReminderObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  private notifyObservers(event: ReminderEvent): void {
    this.observers.forEach(observer => observer.onReminderEvent(event));
  }

  scheduleReminder(
    alert: Alert,
    user: User,
    preference?: UserAlertPreference
  ): void {
    const reminderId = `${alert.id}_${user.id}`;
    
    // Clear existing reminder if any
    this.clearReminder(reminderId);

    // Check if reminder should be scheduled
    if (!this.shouldScheduleReminder(alert, preference)) {
      return;
    }

    // Calculate next reminder time
    const nextReminderTime = this.calculateNextReminderTime(alert, preference);
    const delay = nextReminderTime.getTime() - Date.now();

    if (delay <= 0) {
      // Should trigger immediately
      this.triggerReminder(alert, user);
      return;
    }

    // Schedule the reminder
    const timeout = setTimeout(() => {
      this.triggerReminder(alert, user);
    }, delay);

    this.reminders.set(reminderId, timeout);

    this.notifyObservers({
      type: 'scheduled',
      alertId: alert.id,
      userId: user.id,
      scheduledFor: nextReminderTime
    });
  }

  private shouldScheduleReminder(
    alert: Alert,
    preference?: UserAlertPreference
  ): boolean {
    const now = new Date();
    
    // Don't schedule if alert is not active
    if (alert.archived || 
        now < new Date(alert.startTime) || 
        now > new Date(alert.expiryTime)) {
      return false;
    }

    // Don't schedule if reminders are disabled
    if (!alert.reminderEnabled) {
      return false;
    }

    // Don't schedule if snoozed for today
    if (preference?.snoozedUntil && 
        new Date(preference.snoozedUntil) > now) {
      return false;
    }

    return true;
  }

  private calculateNextReminderTime(
    alert: Alert,
    preference?: UserAlertPreference
  ): Date {
    const now = new Date();
    const frequencyMs = alert.reminderFrequencyMinutes * 60 * 1000;

    // If no previous delivery, schedule immediately
    if (!preference) {
      return now;
    }

    // Calculate based on last delivery or creation time
    const baseTime = new Date(alert.createdAt);
    const timeSinceBase = now.getTime() - baseTime.getTime();
    const intervalsPassed = Math.floor(timeSinceBase / frequencyMs);
    
    return new Date(baseTime.getTime() + (intervalsPassed + 1) * frequencyMs);
  }

  private async triggerReminder(alert: Alert, user: User): Promise<void> {
    try {
      // Deliver the reminder
      const result = await notificationManager.deliverNotification(
        alert,
        user,
        alert.deliveryTypes
      );

      this.notifyObservers({
        type: 'triggered',
        alertId: alert.id,
        userId: user.id,
        success: result.success,
        timestamp: new Date()
      });

      // Schedule next reminder
      this.scheduleReminder(alert, user);
    } catch (error) {
      this.notifyObservers({
        type: 'error',
        alertId: alert.id,
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  }

  clearReminder(reminderId: string): void {
    const timeout = this.reminders.get(reminderId);
    if (timeout) {
      clearTimeout(timeout);
      this.reminders.delete(reminderId);
    }
  }

  clearAllReminders(): void {
    this.reminders.forEach(timeout => clearTimeout(timeout));
    this.reminders.clear();
  }

  getActiveReminders(): string[] {
    return Array.from(this.reminders.keys());
  }
}

export interface ReminderObserver {
  onReminderEvent(event: ReminderEvent): void;
}

export interface ReminderEvent {
  type: 'scheduled' | 'triggered' | 'error';
  alertId: string;
  userId: string;
  scheduledFor?: Date;
  timestamp?: Date;
  success?: boolean;
  error?: string;
}

// Singleton instance
export const reminderScheduler = new ReminderScheduler();