import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleBarChart, SimplePieChart } from '@/components/ui/simple-chart';
import { AnalyticsData } from '@/lib/types';
import { mockApi } from '@/lib/mock-api';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Moon, TrendingUp, Activity, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  description?: string;
}> = ({ title, value, icon: Icon, gradient, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="relative overflow-hidden">
      <div className={cn("absolute top-0 left-0 w-full h-1", gradient)} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            gradient.replace('bg-gradient-', 'bg-'),
            "bg-opacity-10"
          )}>
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await mockApi.getDetailedAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Unable to load analytics data</p>
        </CardContent>
      </Card>
    );
  }

  const engagementRate = analytics.deliveredCount > 0 
    ? ((analytics.readCount / analytics.deliveredCount) * 100).toFixed(1)
    : '0';

  const totalSnoozes = Object.values(analytics.snoozeCountsPerAlert).reduce((sum, count) => sum + count, 0);

  // Prepare chart data
  const severityChartData = Object.entries(analytics.severityBreakdown).map(([severity, count]) => ({
    name: severity,
    value: count,
    color: severity === 'Info' ? 'hsl(var(--info))' : 
           severity === 'Warning' ? 'hsl(var(--warning))' : 
           'hsl(var(--critical))'
  }));

  const engagementChartData = [
    { name: 'Read', value: analytics.readCount, color: 'hsl(var(--success))' },
    { name: 'Delivered', value: analytics.deliveredCount - analytics.readCount, color: 'hsl(var(--muted))' },
    { name: 'Snoozed', value: totalSnoozes, color: 'hsl(var(--warning))' }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Alerts"
          value={analytics.totalAlertsCreated}
          icon={AlertTriangle}
          gradient="bg-gradient-primary"
          description="All time created"
        />
        
        <StatCard
          title="Active Alerts"
          value={analytics.alertsActive}
          icon={Activity}
          gradient="bg-gradient-info"
          description="Currently active"
        />
        
        <StatCard
          title="Engagement Rate"
          value={`${engagementRate}%`}
          icon={CheckCircle}
          gradient="bg-gradient-success"
          description="Read vs delivered"
        />
        
        <StatCard
          title="Total Snoozes"
          value={analytics.userEngagementMetrics?.totalActiveUsers || totalSnoozes}
          icon={Moon}
          gradient="bg-gradient-warning"
          description="Active users"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Alerts by Severity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={severityChartData} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimplePieChart data={engagementChartData} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Analytics */}
      {analytics.alertEffectiveness && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Alert Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Most Effective Alerts</h4>
                  <div className="space-y-2">
                    {analytics.alertEffectiveness.mostEffective.slice(0, 3).map((alert, index) => (
                      <div key={alert.alertId} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm truncate">{alert.title}</span>
                        <Badge variant="outline">{alert.readRate.toFixed(1)}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Read Rate</span>
                      <span className="font-medium">{analytics.alertEffectiveness.averageReadRate.toFixed(1)}%</span>
                    </div>
                    {analytics.responseTimeMetrics && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Avg Response Time</span>
                          <span className="font-medium">{analytics.responseTimeMetrics.average}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Fastest Response</span>
                          <span className="font-medium">{analytics.responseTimeMetrics.fastest}m</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Detailed Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Detailed Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">DELIVERY STATS</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Delivered</span>
                    <span className="font-medium">{analytics.deliveredCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Read</span>
                    <span className="font-medium">{analytics.readCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Unread</span>
                    <span className="font-medium">{analytics.deliveredCount - analytics.readCount}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">SEVERITY BREAKDOWN</h4>
                <div className="space-y-1">
                  {Object.entries(analytics.severityBreakdown).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between">
                      <span className="text-sm flex items-center gap-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          severity === 'Info' && "bg-info",
                          severity === 'Warning' && "bg-warning",
                          severity === 'Critical' && "bg-critical"
                        )} />
                        {severity}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">SNOOZE ACTIVITY</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Snoozes</span>
                    <span className="font-medium">{totalSnoozes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Alerts Snoozed</span>
                    <span className="font-medium">{Object.keys(analytics.snoozeCountsPerAlert).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg per Alert</span>
                    <span className="font-medium">
                      {Object.keys(analytics.snoozeCountsPerAlert).length > 0 
                        ? (totalSnoozes / Object.keys(analytics.snoozeCountsPerAlert).length).toFixed(1)
                        : '0'
                      }
                    </span>
                  </div>
                  {analytics.userEngagementMetrics && (
                    <div className="flex justify-between">
                      <span className="text-sm">Engagement Rate</span>
                      <span className="font-medium">{analytics.userEngagementMetrics.averageEngagementRate.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};