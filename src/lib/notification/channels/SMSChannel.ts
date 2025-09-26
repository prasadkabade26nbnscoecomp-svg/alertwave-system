import { BaseNotificationChannel, NotificationPayload, DeliveryResult } from './BaseChannel';

/**
 * SMS notification channel implementation
 * Future-proofed for when SMS delivery is needed
 */
export class SMSNotificationChannel extends BaseNotificationChannel {
  private smsService: any; // Would be actual SMS service

  constructor(smsService?: any) {
    super('sms');
    this.smsService = smsService;
  }

  async deliver(notification: NotificationPayload): Promise<DeliveryResult> {
    try {
      if (!this.isAvailable()) {
        throw new Error('SMS service not configured');
      }

      // Simulate SMS delivery
      const deliveryId = `sms_${Date.now()}_${notification.userId}`;
      
      // In a real implementation:
      // await this.smsService.send({
      //   to: userPhone,
      //   message: `${notification.title}: ${notification.message}`
      // });
      
      return {
        success: true,
        deliveryId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        deliveryId: '',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'SMS delivery failed'
      };
    }
  }

  isAvailable(): boolean {
    return !!this.smsService; // Available if SMS service is configured
  }
}