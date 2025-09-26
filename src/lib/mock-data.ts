import { Alert, User, Team, NotificationDelivery, UserAlertPreference, AlertSeverity } from './types';

// Mock Teams
export const mockTeams: Team[] = [
  { id: 't1', name: 'Engineering' },
  { id: 't2', name: 'Marketing' },
  { id: 't3', name: 'Operations' }
];

// Mock Users
export const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Johnson', teamId: 't1', role: 'admin' },
  { id: 'u2', name: 'Sarah Chen', teamId: 't1', role: 'user' },
  { id: 'u3', name: 'Mike Rodriguez', teamId: 't1', role: 'user' },
  { id: 'u4', name: 'Emma Wilson', teamId: 't2', role: 'user' },
  { id: 'u5', name: 'James Brown', teamId: 't2', role: 'user' },
  { id: 'u6', name: 'Lisa Garcia', teamId: 't3', role: 'admin' }
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    title: 'Database Maintenance Scheduled',
    message: 'Primary database will be down for maintenance from 2:00 AM to 4:00 AM EST. Please plan accordingly and ensure all critical operations are completed beforehand.',
    severity: 'Warning' as AlertSeverity,
    visibility: { org: true, teams: [], users: [] },
    deliveryTypes: ['inapp'],
    reminderEnabled: true,
    reminderFrequencyMinutes: 120,
    startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    expiryTime: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    archived: false,
    createdBy: 'u1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'a2',
    title: 'Critical Security Patch Required',
    message: 'Immediate action required: A critical security vulnerability has been discovered. All team members must update their systems immediately. This affects all production environments.',
    severity: 'Critical' as AlertSeverity,
    visibility: { org: false, teams: ['t1'], users: [] },
    deliveryTypes: ['inapp'],
    reminderEnabled: true,
    reminderFrequencyMinutes: 120,
    startTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    expiryTime: new Date(Date.now() + 172800000).toISOString(), // 48 hours from now
    archived: false,
    createdBy: 'u1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'a3',
    title: 'New Product Launch Campaign',
    message: 'Exciting news! We are launching our new product next week. Marketing team, please review the campaign materials and prepare for the coordinated launch across all channels.',
    severity: 'Info' as AlertSeverity,
    visibility: { org: false, teams: ['t2'], users: [] },
    deliveryTypes: ['inapp'],
    reminderEnabled: true,
    reminderFrequencyMinutes: 120,
    startTime: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    expiryTime: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
    archived: false,
    createdBy: 'u6',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'a4',
    title: 'Personal Action Required: Code Review',
    message: 'Sarah, please review the pull request #247 for the authentication module. The deadline is approaching and your input is crucial for the release.',
    severity: 'Warning' as AlertSeverity,
    visibility: { org: false, teams: [], users: ['u2'] },
    deliveryTypes: ['inapp'],
    reminderEnabled: true,
    reminderFrequencyMinutes: 120,
    startTime: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    expiryTime: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    archived: false,
    createdBy: 'u1',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: 'a5',
    title: 'System Performance Degradation',
    message: 'We are experiencing slower than normal response times across our services. The operations team is investigating. Updates will be provided every hour.',
    severity: 'Critical' as AlertSeverity,
    visibility: { org: true, teams: [], users: [] },
    deliveryTypes: ['inapp'],
    reminderEnabled: true,
    reminderFrequencyMinutes: 120,
    startTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    expiryTime: new Date(Date.now() + 43200000).toISOString(), // 12 hours from now
    archived: false,
    createdBy: 'u6',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString()
  }
];

// Mock Notification Deliveries
export const mockNotificationDeliveries: NotificationDelivery[] = [
  {
    id: 'n1',
    alertId: 'a1',
    userId: 'u2',
    deliveredAt: new Date(Date.now() - 3600000).toISOString(),
    channel: 'inapp',
    delivered: true
  },
  {
    id: 'n2',
    alertId: 'a1',
    userId: 'u3',
    deliveredAt: new Date(Date.now() - 3600000).toISOString(),
    channel: 'inapp',
    delivered: true
  },
  {
    id: 'n3',
    alertId: 'a2',
    userId: 'u2',
    deliveredAt: new Date(Date.now() - 1800000).toISOString(),
    channel: 'inapp',
    delivered: true
  },
  {
    id: 'n4',
    alertId: 'a2',
    userId: 'u3',
    deliveredAt: new Date(Date.now() - 1800000).toISOString(),
    channel: 'inapp',
    delivered: true
  }
];

// Mock User Alert Preferences
export const mockUserAlertPreferences: UserAlertPreference[] = [
  {
    id: 'p1',
    alertId: 'a1',
    userId: 'u2',
    read: true,
    snoozedUntil: null,
    lastSnoozedDay: null
  },
  {
    id: 'p2',
    alertId: 'a1',
    userId: 'u3',
    read: false,
    snoozedUntil: null,
    lastSnoozedDay: null
  },
  {
    id: 'p3',
    alertId: 'a2',
    userId: 'u2',
    read: false,
    snoozedUntil: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
    lastSnoozedDay: new Date().toISOString().split('T')[0]
  },
  {
    id: 'p4',
    alertId: 'a4',
    userId: 'u2',
    read: false,
    snoozedUntil: null,
    lastSnoozedDay: null
  }
];