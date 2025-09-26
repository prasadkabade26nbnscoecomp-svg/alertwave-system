import React from 'react';
import { motion } from 'framer-motion';
import { AlertWithPreferences, AlertSeverity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Users, Building, CheckCircle, Moon, RotateCcw, AlertTriangle, Info, Zap } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: AlertWithPreferences;
  onSnooze?: (alertId: string) => void;
  onMarkRead?: (alertId: string) => void;
  onMarkUnread?: (alertId: string) => void;
  className?: string;
  isReminderPulse?: boolean;
}

const severityConfig = {
  Info: {
    icon: Info,
    gradient: 'bg-gradient-info',
    badge: 'bg-info text-info-foreground',
    border: 'border-info/20',
    glow: 'shadow-[0_0_20px_hsl(var(--info)/0.3)]'
  },
  Warning: {
    icon: AlertTriangle,
    gradient: 'bg-gradient-warning',
    badge: 'bg-warning text-warning-foreground',
    border: 'border-warning/20',
    glow: 'shadow-[0_0_20px_hsl(var(--warning)/0.3)]'
  },
  Critical: {
    icon: Zap,
    gradient: 'bg-gradient-critical',
    badge: 'bg-critical text-critical-foreground',
    border: 'border-critical/20',
    glow: 'shadow-[0_0_20px_hsl(var(--critical)/0.3)]'
  }
};

const getVisibilityInfo = (alert: AlertWithPreferences) => {
  if (alert.visibility.org) {
    return { icon: Building, text: 'Organization-wide', color: 'text-primary' };
  }
  if (alert.visibility.teams.length > 0) {
    return { icon: Users, text: `Team: ${alert.visibility.teams.join(', ')}`, color: 'text-info' };
  }
  if (alert.visibility.users.length > 0) {
    return { icon: User, text: 'Personal Alert', color: 'text-warning' };
  }
  return { icon: User, text: 'Personal', color: 'text-muted-foreground' };
};

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onSnooze,
  onMarkRead,
  onMarkUnread,
  className,
  isReminderPulse = false
}) => {
  const config = severityConfig[alert.severity];
  const SeverityIcon = config.icon;
  const visibilityInfo = getVisibilityInfo(alert);
  const VisibilityIcon = visibilityInfo.icon;
  const isRead = alert.userPreference?.read || false;
  const isSnoozed = alert.userPreference?.snoozedUntil && 
    new Date(alert.userPreference.snoozedUntil) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isReminderPulse ? [1, 1.02, 1] : 1
      }}
      transition={{ 
        duration: 0.3,
        scale: isReminderPulse ? { duration: 0.6, repeat: 2 } : undefined
      }}
      className={className}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        config.border,
        isReminderPulse && config.glow,
        isSnoozed && "opacity-60",
        isRead && "bg-muted/30"
      )}>
        {/* Gradient accent bar */}
        <div className={cn("absolute top-0 left-0 w-full h-1", config.gradient)} />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <SeverityIcon className={cn(
                "w-5 h-5 flex-shrink-0",
                alert.severity === 'Info' && "text-info",
                alert.severity === 'Warning' && "text-warning", 
                alert.severity === 'Critical' && "text-critical"
              )} />
              <CardTitle className="text-lg leading-tight">{alert.title}</CardTitle>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {isSnoozed && (
                <Badge variant="secondary" className="gap-1">
                  <Moon className="w-3 h-3" />
                  Snoozed
                </Badge>
              )}
              <Badge className={config.badge}>
                {alert.severity}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <VisibilityIcon className="w-4 h-4" />
              <span className={visibilityInfo.color}>{visibilityInfo.text}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Created {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-foreground mb-4 leading-relaxed">
            {alert.message}
          </p>
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {alert.nextReminderAt && (
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  Next reminder: {format(new Date(alert.nextReminderAt), 'HH:mm')}
                </span>
              )}
              {alert.expiryTime && (
                <span>
                  Expires: {format(new Date(alert.expiryTime), 'MMM dd, HH:mm')}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isSnoozed && onSnooze && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSnooze(alert.id)}
                  className="gap-1"
                >
                  <Moon className="w-3 h-3" />
                  Snooze Today
                </Button>
              )}
              
              {isRead ? (
                onMarkUnread && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onMarkUnread(alert.id)}
                    className="gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Mark Unread
                  </Button>
                )
              ) : (
                onMarkRead && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => onMarkRead(alert.id)}
                    className="gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Mark Read
                  </Button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};