import { Alert, User, UserAlertPreference, AlertWithPreferences, AnalyticsData, AlertSeverity, AlertStatus } from './types';
import { mockAlerts, mockUsers, mockUserAlertPreferences, mockNotificationDeliveries, mockTeams } from './mock-data';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

// Simulated API responses with realistic delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockApiService {
  private alerts: Alert[] = [...mockAlerts];
  private users: User[] = [...mockUsers];
  private userPreferences: UserAlertPreference[] = [...mockUserAlertPreferences];
  private deliveries = [...mockNotificationDeliveries];

  // Current user simulation
  private currentUserId = 'u2'; // Default to Sarah Chen

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
    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert> {
    await delay(300);
    const index = this.alerts.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Alert not found');
    
    this.alerts[index] = {
      ...this.alerts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
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
      const preference = this.userPreferences.find(p => p.alertId === alert.id && p.userId === currentUser.id);
      
      // Calculate next reminder time
      let nextReminderAt: string | undefined;
      let isEligibleForReminder = false;

      if (alert.reminderEnabled && (!preference?.snoozedUntil || isAfter(now, new Date(preference.snoozedUntil)))) {
        // Find last delivery
        const lastDelivery = this.deliveries
          .filter(d => d.alertId === alert.id && d.userId === currentUser.id)
          .sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime())[0];

        if (lastDelivery) {
          const nextReminder = new Date(new Date(lastDelivery.deliveredAt).getTime() + alert.reminderFrequencyMinutes * 60000);
          if (isBefore(now, nextReminder)) {
            nextReminderAt = nextReminder.toISOString();
          } else {
            isEligibleForReminder = true;
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
    const today = format(new Date(), 'yyyy-MM-dd');
    const snoozedUntil = endOfDay(new Date()).toISOString();

    const existingIndex = this.userPreferences.findIndex(
      p => p.alertId === alertId && p.userId === currentUser.id
    );

    if (existingIndex >= 0) {
      this.userPreferences[existingIndex] = {
        ...this.userPreferences[existingIndex],
        snoozedUntil,
        lastSnoozedDay: today
      };
    } else {
      this.userPreferences.push({
        id: `p${Date.now()}`,
        alertId,
        userId: currentUser.id,
        read: false,
        snoozedUntil,
        lastSnoozedDay: today
      });
    }
  }

  async markAlertRead(alertId: string): Promise<void> {
    await delay(100);
    const currentUser = this.getCurrentUser();

    const existingIndex = this.userPreferences.findIndex(
      p => p.alertId === alertId && p.userId === currentUser.id
    );

    if (existingIndex >= 0) {
      this.userPreferences[existingIndex] = {
        ...this.userPreferences[existingIndex],
        read: true
      };
    } else {
      this.userPreferences.push({
        id: `p${Date.now()}`,
        alertId,
        userId: currentUser.id,
        read: true,
        snoozedUntil: null,
        lastSnoozedDay: null
      });
    }
  }

  async markAlertUnread(alertId: string): Promise<void> {
    await delay(100);
    const currentUser = this.getCurrentUser();

    const existingIndex = this.userPreferences.findIndex(
      p => p.alertId === alertId && p.userId === currentUser.id
    );

    if (existingIndex >= 0) {
      this.userPreferences[existingIndex] = {
        ...this.userPreferences[existingIndex],
        read: false
      };
    } else {
      this.userPreferences.push({
        id: `p${Date.now()}`,
        alertId,
        userId: currentUser.id,
        read: false,
        snoozedUntil: null,
        lastSnoozedDay: null
      });
    }
  }

  async getAnalytics(): Promise<AnalyticsData> {
    await delay(300);
    const now = new Date();
    
    const activeAlerts = this.alerts.filter(a => 
      !a.archived && 
      isBefore(now, new Date(a.expiryTime)) && 
      isAfter(now, new Date(a.startTime))
    );

    const severityBreakdown = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<AlertSeverity, number>);

    const snoozeCountsPerAlert = this.userPreferences
      .filter(p => p.snoozedUntil)
      .reduce((acc, pref) => {
        acc[pref.alertId] = (acc[pref.alertId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalAlertsCreated: this.alerts.length,
      alertsActive: activeAlerts.length,
      deliveredCount: this.deliveries.filter(d => d.delivered).length,
      readCount: this.userPreferences.filter(p => p.read).length,
      snoozeCountsPerAlert,
      severityBreakdown
    };
  }

  async triggerReminders(): Promise<{ triggered: number }> {
    await delay(1000);
    // Simulate reminder triggering
    let triggered = 0;
    const now = new Date();

    for (const alert of this.alerts) {
      if (!alert.reminderEnabled || alert.archived) continue;
      if (isBefore(now, new Date(alert.startTime)) || isAfter(now, new Date(alert.expiryTime))) continue;

      // Find users who should receive this alert
      const eligibleUsers = this.users.filter(user => {
        if (alert.visibility.org) return true;
        if (alert.visibility.teams.includes(user.teamId)) return true;
        if (alert.visibility.users.includes(user.id)) return true;
        return false;
      });

      for (const user of eligibleUsers) {
        const preference = this.userPreferences.find(p => p.alertId === alert.id && p.userId === user.id);
        
        // Skip if snoozed for today
        if (preference?.snoozedUntil && isAfter(new Date(preference.snoozedUntil), now)) continue;

        // Check if reminder is due
        const lastDelivery = this.deliveries
          .filter(d => d.alertId === alert.id && d.userId === user.id)
          .sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime())[0];

        const shouldTrigger = !lastDelivery || 
          isAfter(now, new Date(new Date(lastDelivery.deliveredAt).getTime() + alert.reminderFrequencyMinutes * 60000));

        if (shouldTrigger) {
          // Add delivery record
          this.deliveries.push({
            id: `n${Date.now()}_${user.id}`,
            alertId: alert.id,
            userId: user.id,
            deliveredAt: now.toISOString(),
            channel: 'inapp',
            delivered: true
          });
          triggered++;
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
}

export const mockApi = new MockApiService();