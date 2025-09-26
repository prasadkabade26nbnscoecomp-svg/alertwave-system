import { UserAlertPreference } from '../types';
import { format, endOfDay, startOfDay } from 'date-fns';

/**
 * User preference manager implementing State Pattern
 * Manages read/unread/snooze states with proper state transitions
 */
export class UserPreferenceManager {
  private preferences: Map<string, UserAlertPreference> = new Map();

  constructor(initialPreferences: UserAlertPreference[] = []) {
    initialPreferences.forEach(pref => {
      this.preferences.set(`${pref.alertId}_${pref.userId}`, pref);
    });
  }

  getPreference(alertId: string, userId: string): UserAlertPreference | undefined {
    return this.preferences.get(`${alertId}_${userId}`);
  }

  markAsRead(alertId: string, userId: string): UserAlertPreference {
    const key = `${alertId}_${userId}`;
    const existing = this.preferences.get(key);

    const preference: UserAlertPreference = {
      id: existing?.id || `pref_${Date.now()}`,
      alertId,
      userId,
      read: true,
      snoozedUntil: existing?.snoozedUntil || null,
      lastSnoozedDay: existing?.lastSnoozedDay || null
    };

    this.preferences.set(key, preference);
    return preference;
  }

  markAsUnread(alertId: string, userId: string): UserAlertPreference {
    const key = `${alertId}_${userId}`;
    const existing = this.preferences.get(key);

    const preference: UserAlertPreference = {
      id: existing?.id || `pref_${Date.now()}`,
      alertId,
      userId,
      read: false,
      snoozedUntil: existing?.snoozedUntil || null,
      lastSnoozedDay: existing?.lastSnoozedDay || null
    };

    this.preferences.set(key, preference);
    return preference;
  }

  snoozeForDay(alertId: string, userId: string): UserAlertPreference {
    const key = `${alertId}_${userId}`;
    const existing = this.preferences.get(key);
    const today = format(new Date(), 'yyyy-MM-dd');
    const snoozedUntil = endOfDay(new Date()).toISOString();

    const preference: UserAlertPreference = {
      id: existing?.id || `pref_${Date.now()}`,
      alertId,
      userId,
      read: existing?.read || false,
      snoozedUntil,
      lastSnoozedDay: today
    };

    this.preferences.set(key, preference);
    return preference;
  }

  unsnooze(alertId: string, userId: string): UserAlertPreference {
    const key = `${alertId}_${userId}`;
    const existing = this.preferences.get(key);

    if (!existing) {
      throw new Error('Preference not found');
    }

    const preference: UserAlertPreference = {
      ...existing,
      snoozedUntil: null,
      lastSnoozedDay: null
    };

    this.preferences.set(key, preference);
    return preference;
  }

  isSnoozedForToday(alertId: string, userId: string): boolean {
    const preference = this.getPreference(alertId, userId);
    if (!preference?.snoozedUntil) return false;

    const now = new Date();
    const snoozedUntil = new Date(preference.snoozedUntil);
    
    return snoozedUntil > now;
  }

  shouldResetSnooze(alertId: string, userId: string): boolean {
    const preference = this.getPreference(alertId, userId);
    if (!preference?.lastSnoozedDay) return false;

    const today = format(new Date(), 'yyyy-MM-dd');
    return preference.lastSnoozedDay !== today;
  }

  resetExpiredSnoozes(): void {
    const now = new Date();
    
    this.preferences.forEach((preference, key) => {
      if (preference.snoozedUntil && new Date(preference.snoozedUntil) <= now) {
        this.preferences.set(key, {
          ...preference,
          snoozedUntil: null,
          lastSnoozedDay: null
        });
      }
    });
  }

  getAllPreferences(): UserAlertPreference[] {
    return Array.from(this.preferences.values());
  }

  getUserPreferences(userId: string): UserAlertPreference[] {
    return Array.from(this.preferences.values())
      .filter(pref => pref.userId === userId);
  }

  getAlertPreferences(alertId: string): UserAlertPreference[] {
    return Array.from(this.preferences.values())
      .filter(pref => pref.alertId === alertId);
  }
}

// Singleton instance
export const userPreferenceManager = new UserPreferenceManager();