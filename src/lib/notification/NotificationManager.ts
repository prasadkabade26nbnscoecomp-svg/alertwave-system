import { BaseNotificationChannel, NotificationPayload } from './channels/BaseChannel';
import { InAppNotificationChannel } from './channels/InAppChannel';
import { EmailNotificationChannel } from './channels/EmailChannel';
import { SMSNotificationChannel } from './channels/SMSChannel';
import { Alert, User } from '../types';

/**
 * Central notification manager implementing Strategy Pattern
 * Manages multiple delivery channels and handles notification routing
 */
export class NotificationManager {
  private channels: Map<string, BaseNotificationChannel> = new Map();
  private deliveryLogs: any[] = []; // In real app, this would be persisted

  constructor() {
    // Register default channels
    this.registerChannel(new InAppNotificationChannel());
    this.registerChannel(new EmailNotificationChannel());
    this.registerChannel(new SMSNotificationChannel());
  }

  registerChannel(channel: BaseNotificationChannel): void {
    this.channels.set(channel.getChannelType(), channel);
  }

  unregisterChannel(channelType: string): void {
    this.channels.delete(channelType);
  }

  getAvailableChannels(): string[] {
    return Array.from(this.channels.values())
      .filter(channel => channel.isAvailable())
      .map(channel => channel.getChannelType());
  }

  async deliverNotification(
    alert: Alert,
    user: User,
    channelTypes: string[] = ['inapp']
  ): Promise<{ success: boolean; results: any[] }> {
    const payload: NotificationPayload = {
      alertId: alert.id,
      userId: user.id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      timestamp: new Date().toISOString()
    };

    const results = [];
    let overallSuccess = true;

    for (const channelType of channelTypes) {
      const channel = this.channels.get(channelType);
      
      if (!channel) {
        results.push({
          channel: channelType,
          success: false,
          error: 'Channel not found'
        });
        overallSuccess = false;
        continue;
      }

      if (!channel.isAvailable()) {
        results.push({
          channel: channelType,
          success: false,
          error: 'Channel not available'
        });
        overallSuccess = false;
        continue;
      }

      try {
        const result = await channel.deliver(payload);
        results.push({
          channel: channelType,
          ...result
        });

        if (!result.success) {
          overallSuccess = false;
        }

        // Log delivery attempt
        this.deliveryLogs.push({
          id: result.deliveryId || `failed_${Date.now()}`,
          alertId: alert.id,
          userId: user.id,
          channel: channelType,
          delivered: result.success,
          deliveredAt: result.timestamp,
          error: result.error
        });
      } catch (error) {
        results.push({
          channel: channelType,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        overallSuccess = false;
      }
    }

    return { success: overallSuccess, results };
  }

  getDeliveryLogs(): any[] {
    return [...this.deliveryLogs];
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();