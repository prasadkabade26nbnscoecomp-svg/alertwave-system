import { Alert, User, UserAlertPreference, AnalyticsData, AlertSeverity } from '../types';
import { notificationManager } from '../notification/NotificationManager';
import { userPreferenceManager } from '../user-preferences/UserPreferenceManager';
import { isAfter, isBefore, startOfDay, endOfDay, subDays } from 'date-fns';

/**
 * Analytics engine for comprehensive alert metrics
 * Provides detailed insights into alert performance and user engagement
 */
export class AnalyticsEngine {
  private alerts: Alert[] = [];
  private users: User[] = [];

  constructor(alerts: Alert[] = [], users: User[] = []) {
    this.alerts = alerts;
    this.users = users;
  }

  updateData(alerts: Alert[], users: User[]): void {
    this.alerts = alerts;
    this.users = users;
  }

  generateAnalytics(): AnalyticsData {
    const now = new Date();
    const deliveryLogs = notificationManager.getDeliveryLogs();
    const preferences = userPreferenceManager.getAllPreferences();

    // Basic counts
    const totalAlertsCreated = this.alerts.length;
    const alertsActive = this.alerts.filter(alert => 
      !alert.archived && 
      isBefore(now, new Date(alert.expiryTime)) && 
      isAfter(now, new Date(alert.startTime))
    ).length;

    // Delivery metrics
    const deliveredCount = deliveryLogs.filter(log => log.delivered).length;
    const readCount = preferences.filter(pref => pref.read).length;

    // Snooze metrics
    const snoozeCountsPerAlert = preferences
      .filter(pref => pref.snoozedUntil)
      .reduce((acc, pref) => {
        acc[pref.alertId] = (acc[pref.alertId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Severity breakdown
    const severityBreakdown = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<AlertSeverity, number>);

    return {
      totalAlertsCreated,
      alertsActive,
      deliveredCount,
      readCount,
      snoozeCountsPerAlert,
      severityBreakdown
    };
  }

  generateDetailedAnalytics() {
    const basicAnalytics = this.generateAnalytics();
    const deliveryLogs = notificationManager.getDeliveryLogs();
    const preferences = userPreferenceManager.getAllPreferences();
    const now = new Date();

    // Engagement metrics
    const engagementRate = basicAnalytics.deliveredCount > 0 
      ? (basicAnalytics.readCount / basicAnalytics.deliveredCount) * 100 
      : 0;

    // Response time metrics
    const responseTimeMetrics = this.calculateResponseTimes(deliveryLogs, preferences);

    // Channel performance
    const channelPerformance = this.calculateChannelPerformance(deliveryLogs);

    // Time-based analytics
    const timeBasedMetrics = this.calculateTimeBasedMetrics();

    // User engagement
    const userEngagementMetrics = this.calculateUserEngagement(preferences);

    // Alert effectiveness
    const alertEffectiveness = this.calculateAlertEffectiveness();

    return {
      ...basicAnalytics,
      engagementRate: Math.round(engagementRate * 100) / 100,
      responseTimeMetrics,
      channelPerformance,
      timeBasedMetrics,
      userEngagementMetrics,
      alertEffectiveness
    };
  }

  private calculateResponseTimes(deliveryLogs: any[], preferences: UserAlertPreference[]) {
    const responseTimes: number[] = [];

    preferences.forEach(pref => {
      if (pref.read) {
        const delivery = deliveryLogs.find(log => 
          log.alertId === pref.alertId && log.userId === pref.userId
        );
        
        if (delivery) {
          // In a real system, we'd track when the user actually read the alert
          // For now, we'll simulate response times
          const responseTime = Math.random() * 3600000; // 0-1 hour in ms
          responseTimes.push(responseTime);
        }
      }
    });

    if (responseTimes.length === 0) {
      return { average: 0, median: 0, fastest: 0, slowest: 0 };
    }

    responseTimes.sort((a, b) => a - b);
    const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const median = responseTimes[Math.floor(responseTimes.length / 2)];

    return {
      average: Math.round(average / 60000), // Convert to minutes
      median: Math.round(median / 60000),
      fastest: Math.round(responseTimes[0] / 60000),
      slowest: Math.round(responseTimes[responseTimes.length - 1] / 60000)
    };
  }

  private calculateChannelPerformance(deliveryLogs: any[]) {
    const channelStats = deliveryLogs.reduce((acc, log) => {
      if (!acc[log.channel]) {
        acc[log.channel] = { sent: 0, delivered: 0, failed: 0 };
      }
      
      acc[log.channel].sent++;
      if (log.delivered) {
        acc[log.channel].delivered++;
      } else {
        acc[log.channel].failed++;
      }
      
      return acc;
    }, {} as Record<string, { sent: number; delivered: number; failed: number }>);

    // Calculate success rates
    Object.keys(channelStats).forEach(channel => {
      const stats = channelStats[channel];
      (stats as any).successRate = stats.sent > 0 
        ? Math.round((stats.delivered / stats.sent) * 100) 
        : 0;
    });

    return channelStats;
  }

  private calculateTimeBasedMetrics() {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);

    const alertsLast7Days = this.alerts.filter(alert => 
      new Date(alert.createdAt) >= last7Days
    ).length;

    const alertsLast30Days = this.alerts.filter(alert => 
      new Date(alert.createdAt) >= last30Days
    ).length;

    return {
      alertsLast7Days,
      alertsLast30Days,
      averageAlertsPerDay: Math.round(alertsLast30Days / 30 * 100) / 100
    };
  }

  private calculateUserEngagement(preferences: UserAlertPreference[]) {
    const userStats = preferences.reduce((acc, pref) => {
      if (!acc[pref.userId]) {
        acc[pref.userId] = { total: 0, read: 0, snoozed: 0 };
      }
      
      acc[pref.userId].total++;
      if (pref.read) acc[pref.userId].read++;
      if (pref.snoozedUntil) acc[pref.userId].snoozed++;
      
      return acc;
    }, {} as Record<string, { total: number; read: number; snoozed: number }>);

    const engagementRates = Object.values(userStats).map(stats => 
      stats.total > 0 ? (stats.read / stats.total) * 100 : 0
    );

    const averageEngagement = engagementRates.length > 0 
      ? engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length 
      : 0;

    return {
      totalActiveUsers: Object.keys(userStats).length,
      averageEngagementRate: Math.round(averageEngagement * 100) / 100,
      highEngagementUsers: engagementRates.filter(rate => rate > 80).length,
      lowEngagementUsers: engagementRates.filter(rate => rate < 20).length
    };
  }

  private calculateAlertEffectiveness() {
    const alertStats = this.alerts.map(alert => {
      const preferences = userPreferenceManager.getAlertPreferences(alert.id);
      const totalRecipients = preferences.length;
      const readCount = preferences.filter(pref => pref.read).length;
      const snoozeCount = preferences.filter(pref => pref.snoozedUntil).length;
      
      return {
        alertId: alert.id,
        title: alert.title,
        severity: alert.severity,
        totalRecipients,
        readCount,
        snoozeCount,
        readRate: totalRecipients > 0 ? (readCount / totalRecipients) * 100 : 0,
        snoozeRate: totalRecipients > 0 ? (snoozeCount / totalRecipients) * 100 : 0
      };
    });

    // Find most and least effective alerts
    const sortedByReadRate = [...alertStats].sort((a, b) => b.readRate - a.readRate);
    const mostEffective = sortedByReadRate.slice(0, 5);
    const leastEffective = sortedByReadRate.slice(-5).reverse();

    return {
      alertStats,
      mostEffective,
      leastEffective,
      averageReadRate: alertStats.length > 0 
        ? alertStats.reduce((sum, stat) => sum + stat.readRate, 0) / alertStats.length 
        : 0
    };
  }
}

// Singleton instance
export const analyticsEngine = new AnalyticsEngine();