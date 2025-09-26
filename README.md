# AlertHub - Production-Ready Notification Platform

A comprehensive alerting and notification platform built with React, TypeScript, and modern design patterns. This application demonstrates clean OOP architecture, extensible notification systems, and robust reminder management.

## 🏗️ Architecture Overview

### Object-Oriented Design Patterns

#### 1. Strategy Pattern - Notification Channels
```typescript
// Extensible notification delivery system
BaseNotificationChannel (Abstract)
├── InAppNotificationChannel
├── EmailNotificationChannel (Future-ready)
└── SMSNotificationChannel (Future-ready)
```

#### 2. Observer Pattern - Reminder System
```typescript
// Event-driven reminder management
ReminderScheduler
├── Observers: Analytics, Logging, UI Updates
└── Events: scheduled, triggered, error
```

#### 3. State Pattern - User Preferences
```typescript
// Clean state management for user interactions
UserPreferenceManager
├── States: read, unread, snoozed
└── Transitions: markRead, snooze, reset
```

#### 4. Singleton Pattern - Service Management
```typescript
// Centralized service instances
├── NotificationManager
├── ReminderScheduler
├── UserPreferenceManager
└── AnalyticsEngine
```

## 🚀 Features

### Admin Capabilities
- ✅ **Alert Management**: Create, update, archive alerts
- ✅ **Visibility Control**: Organization, team, or user-specific targeting
- ✅ **Reminder Configuration**: Customizable frequency (default 2 hours)
- ✅ **Analytics Dashboard**: Comprehensive metrics and insights
- ✅ **Bulk Operations**: Trigger reminders, manage multiple alerts

### User Experience
- ✅ **Smart Notifications**: Receive relevant alerts based on visibility rules
- ✅ **Snooze Management**: Day-based snoozing with automatic reset
- ✅ **Read/Unread Tracking**: Persistent state management
- ✅ **Real-time Updates**: Live reminder notifications
- ✅ **Filtering & Search**: Advanced alert discovery

### Technical Excellence
- ✅ **Extensible Architecture**: Easy to add new notification channels
- ✅ **Separation of Concerns**: Modular design with clear boundaries
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Performance Optimized**: Efficient state management and rendering

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Animations**: Framer Motion
- **State Management**: React hooks with OOP services
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Build Tool**: Vite

## 📦 Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd alerthub

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏃‍♂️ Quick Start

1. **Access the Application**: Open http://localhost:8080
2. **Choose Your Role**: 
   - **Admin**: Full alert management capabilities
   - **User**: View and interact with assigned alerts
3. **Explore Features**:
   - Create alerts with different severity levels
   - Test visibility targeting (org/team/user)
   - Experience the reminder system
   - View comprehensive analytics

## 🎯 Core Functionality

### Alert Creation & Management
```typescript
// Example: Creating a critical alert
const alert = await mockApi.createAlert({
  title: "System Outage",
  message: "Critical system components are down",
  severity: "Critical",
  visibility: { org: true, teams: [], users: [] },
  deliveryTypes: ["inapp"],
  reminderEnabled: true,
  reminderFrequencyMinutes: 120,
  startTime: new Date().toISOString(),
  expiryTime: new Date(Date.now() + 24*60*60*1000).toISOString()
});
```

### Notification Delivery
```typescript
// Extensible notification system
const result = await notificationManager.deliverNotification(
  alert, 
  user, 
  ['inapp', 'email', 'sms'] // Multiple channels
);
```

### Reminder Scheduling
```typescript
// Intelligent reminder management
reminderScheduler.scheduleReminder(alert, user, userPreference);
// Automatically handles snooze logic and frequency
```

## 📊 Analytics & Insights

The platform provides comprehensive analytics including:

- **Delivery Metrics**: Success rates, channel performance
- **User Engagement**: Read rates, response times
- **Alert Effectiveness**: Most/least effective alerts
- **System Health**: Active alerts, snooze patterns

## 🔧 Extensibility

### Adding New Notification Channels

```typescript
// 1. Create new channel class
class SlackNotificationChannel extends BaseNotificationChannel {
  async deliver(notification: NotificationPayload): Promise<DeliveryResult> {
    // Implementation
  }
}

// 2. Register with manager
notificationManager.registerChannel(new SlackNotificationChannel());
```

### Custom Reminder Logic

```typescript
// 1. Implement observer
class CustomReminderObserver implements ReminderObserver {
  onReminderEvent(event: ReminderEvent): void {
    // Custom logic
  }
}

// 2. Register observer
reminderScheduler.addObserver(new CustomReminderObserver());
```

## 🧪 Testing

The application includes comprehensive mock data and simulated services for testing:

- **Mock Users & Teams**: Predefined organizational structure
- **Sample Alerts**: Various severity levels and visibility settings
- **Simulated Reminders**: Time-based reminder triggering
- **Analytics Data**: Rich metrics for dashboard testing

## 🎨 Design System

- **Color Palette**: Semantic colors for different alert severities
- **Typography**: Consistent font hierarchy
- **Spacing**: 8px grid system
- **Components**: Reusable UI components with variants
- **Animations**: Smooth transitions and micro-interactions

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for medium screens
- **Desktop Enhanced**: Full feature set on large screens
- **Touch Friendly**: Appropriate touch targets and gestures

## 🔒 Security Considerations

- **Input Validation**: All user inputs are validated
- **XSS Prevention**: Proper content sanitization
- **State Management**: Secure client-side state handling
- **Role-Based Access**: Admin vs User permission separation

## 🚀 Future Enhancements

### Planned Features
- [ ] **Real-time WebSocket Integration**
- [ ] **Push Notification Support**
- [ ] **Advanced Scheduling** (cron-like expressions)
- [ ] **Escalation Rules** (severity upgrades)
- [ ] **Audit Logging** (comprehensive activity tracking)
- [ ] **API Rate Limiting** (production-ready throttling)

### Scalability Considerations
- [ ] **Database Integration** (PostgreSQL/MongoDB)
- [ ] **Microservices Architecture** (service decomposition)
- [ ] **Message Queue Integration** (Redis/RabbitMQ)
- [ ] **Horizontal Scaling** (load balancer support)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions, issues, or contributions, please:
- Open an issue on GitHub
- Review the documentation
- Check existing discussions

---

**Built with ❤️ using modern web technologies and clean architecture principles.**