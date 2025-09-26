/**
 * Abstract base class for all notification channels
 * Implements Strategy Pattern for extensible delivery methods
 */
export abstract class BaseNotificationChannel {
  protected channelType: string;

  constructor(channelType: string) {
    this.channelType = channelType;
  }

  abstract deliver(notification: NotificationPayload): Promise<DeliveryResult>;
  
  abstract isAvailable(): boolean;
  
  getChannelType(): string {
    return this.channelType;
  }
}

export interface NotificationPayload {
  alertId: string;
  userId: string;
  title: string;
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  timestamp: string;
}

export interface DeliveryResult {
  success: boolean;
  deliveryId: string;
  timestamp: string;
  error?: string;
}

export { BaseNotificationChannel }