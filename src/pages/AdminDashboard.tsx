import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateAlertDialog } from '@/components/CreateAlertDialog';
import { Alert, AlertStatus, AlertSeverity } from '@/lib/types';
import { mockApi } from '@/lib/mock-api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, Filter, Archive, CreditCard as Edit, Users, User, Building, Clock, TriangleAlert as AlertTriangle, Info, Zap, Play, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { getCurrentUser, logout } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [triggeringReminders, setTriggeringReminders] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const loadAlerts = async () => {
    try {
      const alertsData = await mockApi.getAlertsAdmin({ 
        severity: severityFilter !== 'all' ? severityFilter as AlertSeverity : undefined,
        status: statusFilter !== 'all' ? statusFilter as AlertStatus : undefined
      });
      setAlerts(alertsData);
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
  }, [severityFilter, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
  };

  const handleArchiveAlert = async (alertId: string) => {
    try {
      await mockApi.updateAlert(alertId, { archived: true });
      await loadAlerts();
      toast({
        title: "Alert Archived",
        description: "Alert has been archived successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTriggerReminders = async () => {
    setTriggeringReminders(true);
    try {
      const result = await mockApi.triggerReminders();
      toast({
        title: "Reminders Triggered",
        description: `${result.triggered} reminders have been sent using the enhanced notification system.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger reminders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTriggeringReminders(false);
    }
  };

  const getAlertStatus = (alert: Alert): { status: string; color: string } => {
    const now = new Date();
    if (alert.archived) return { status: 'Archived', color: 'text-muted-foreground' };
    if (isAfter(now, new Date(alert.expiryTime))) return { status: 'Expired', color: 'text-destructive' };
    if (isBefore(now, new Date(alert.startTime))) return { status: 'Scheduled', color: 'text-info' };
    return { status: 'Active', color: 'text-success' };
  };

  const getVisibilityDisplay = (alert: Alert) => {
    if (alert.visibility.org) return { text: 'Organization', icon: Building };
    if (alert.visibility.teams.length > 0) return { text: `${alert.visibility.teams.length} Teams`, icon: Users };
    if (alert.visibility.users.length > 0) return { text: `${alert.visibility.users.length} Users`, icon: User };
    return { text: 'None', icon: User };
  };

  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case 'Info': return { icon: Info, color: 'text-info', bgColor: 'bg-info', textColor: 'text-info-foreground' };
      case 'Warning': return { icon: AlertTriangle, color: 'text-warning', bgColor: 'bg-warning', textColor: 'text-warning-foreground' };
      case 'Critical': return { icon: Zap, color: 'text-critical', bgColor: 'bg-critical', textColor: 'text-critical-foreground' };
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => {
      const now = new Date();
      return !a.archived && 
             isBefore(now, new Date(a.expiryTime)) && 
             isAfter(now, new Date(a.startTime));
    }).length,
    archived: alerts.filter(a => a.archived).length,
    expired: alerts.filter(a => {
      const now = new Date();
      return !a.archived && isAfter(now, new Date(a.expiryTime));
    }).length
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
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {currentUser?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <CreateAlertDialog onAlertCreated={loadAlerts} />
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
                <Settings className="w-8 h-8 text-primary" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-success">{stats.active}</p>
                </div>
                <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center border-success text-success">
                  {stats.active}
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
                  <p className="text-sm font-medium text-muted-foreground">Archived</p>
                  <p className="text-2xl font-bold text-muted-foreground">{stats.archived}</p>
                </div>
                <Archive className="w-8 h-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
                </div>
                <Clock className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alert Management</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTriggerReminders}
                disabled={triggeringReminders}
                className="gap-2"
              >
                <Play className={cn("w-4 h-4", triggeringReminders && "animate-spin")} />
                Trigger Reminders
              </Button>
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredAlerts.map((alert, index) => {
                    const alertStatus = getAlertStatus(alert);
                    const visibilityInfo = getVisibilityDisplay(alert);
                    const severityConfig = getSeverityConfig(alert.severity);
                    const SeverityIcon = severityConfig.icon;
                    const VisibilityIcon = visibilityInfo.icon;

                    return (
                      <motion.tr
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <TableCell className="max-w-xs">
                          <div>
                            <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(severityConfig.bgColor, severityConfig.textColor, "gap-1")}>
                            <SeverityIcon className="w-3 h-3" />
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={cn("text-sm font-medium", alertStatus.color)}>
                            {alertStatus.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <VisibilityIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{visibilityInfo.text}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(alert.expiryTime), 'MMM dd, HH:mm')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit Alert"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!alert.archived && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleArchiveAlert(alert.id)}
                                title="Archive Alert"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </main>
    </div>
  );
};