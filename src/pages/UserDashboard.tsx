import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCard } from '@/components/AlertCard';
import { AlertWithPreferences } from '@/lib/types';
import { mockApi } from '@/lib/mock-api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, Filter, Moon, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDashboardProps {
  onUnreadCountChange: (count: number) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onUnreadCountChange }) => {
  const [alerts, setAlerts] = useState<AlertWithPreferences[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reminderPulses, setReminderPulses] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loadAlerts = async () => {
    try {
      const alertsData = await mockApi.getUserAlerts();
      setAlerts(alertsData);
      
      // Calculate unread count
      const unreadCount = alertsData.filter(alert => !alert.userPreference?.read).length;
      onUnreadCountChange(unreadCount);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // Simulate reminder system
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(prevAlerts => {
        const updatedAlerts = [...prevAlerts];
        let hasNewReminders = false;

        updatedAlerts.forEach((alert, index) => {
          if (alert.isEligibleForReminder && !reminderPulses.has(alert.id)) {
            hasNewReminders = true;
            setReminderPulses(prev => new Set([...prev, alert.id]));
            
            // Show notification toast
            toast({
              title: "Reminder",
              description: `${alert.title} - ${alert.severity} alert`,
              variant: alert.severity === 'Critical' ? 'destructive' : 'default'
            });

            // Remove pulse after animation
            setTimeout(() => {
              setReminderPulses(prev => {
                const newSet = new Set(prev);
                newSet.delete(alert.id);
                return newSet;
              });
            }, 2000);
          }
        });

        return updatedAlerts;
      });
    }, 30000); // Check every 30 seconds for demo

    return () => clearInterval(interval);
  }, [toast, reminderPulses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
  };

  const handleSnooze = async (alertId: string) => {
    try {
      await mockApi.snoozeAlert(alertId);
      await loadAlerts();
      toast({
        title: "Alert Snoozed",
        description: "Alert has been snoozed until tomorrow.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to snooze alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkRead = async (alertId: string) => {
    try {
      await mockApi.markAlertRead(alertId);
      await loadAlerts();
      toast({
        title: "Marked as Read",
        description: "Alert has been marked as read.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark alert as read. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkUnread = async (alertId: string) => {
    try {
      await mockApi.markAlertUnread(alertId);
      await loadAlerts();
      toast({
        title: "Marked as Unread",
        description: "Alert has been marked as unread.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark alert as unread. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'unread' && !alert.userPreference?.read) ||
                         (statusFilter === 'read' && alert.userPreference?.read) ||
                         (statusFilter === 'snoozed' && alert.userPreference?.snoozedUntil);
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.userPreference?.read).length,
    snoozed: alerts.filter(a => a.userPreference?.snoozedUntil && new Date(a.userPreference.snoozedUntil) > new Date()).length,
    critical: alerts.filter(a => a.severity === 'Critical').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-4" />
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold text-warning">{stats.unread}</p>
                </div>
                <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center border-warning text-warning">
                  {stats.unread}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Snoozed</p>
                  <p className="text-2xl font-bold text-info">{stats.snoozed}</p>
                </div>
                <Moon className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-critical">{stats.critical}</p>
                </div>
                <Zap className="w-8 h-8 text-critical" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Alerts</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Info">Info</SelectItem>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="snoozed">Snoozed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No alerts found</h3>
                  <p className="text-muted-foreground">
                    {alerts.length === 0 
                      ? "You don't have any alerts at the moment." 
                      : "No alerts match your current filters."
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                layout
              >
                <AlertCard
                  alert={alert}
                  onSnooze={handleSnooze}
                  onMarkRead={handleMarkRead}
                  onMarkUnread={handleMarkUnread}
                  isReminderPulse={reminderPulses.has(alert.id)}
                />
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};