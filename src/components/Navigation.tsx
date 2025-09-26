import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Settings, BarChart3, AlertTriangle, User, Moon, Sun } from 'lucide-react';
import { mockApi } from '@/lib/mock-api';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: 'alerts' | 'admin' | 'analytics';
  onTabChange: (tab: 'alerts' | 'admin' | 'analytics') => void;
  unreadCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  unreadCount 
}) => {
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState(mockApi.getCurrentUser());

  useEffect(() => {
    // Check for dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleUserChange = (userId: string) => {
    mockApi.setCurrentUser(userId);
    setCurrentUser(mockApi.getCurrentUser());
    // Trigger a page refresh to update data
    window.location.reload();
  };

  const users = mockApi.getUsers();
  const isAdmin = currentUser.role === 'admin';

  const tabs = [
    {
      id: 'alerts' as const,
      label: 'My Alerts',
      icon: Bell,
      badge: unreadCount,
      available: true
    },
    {
      id: 'admin' as const,
      label: 'Admin',
      icon: Settings,
      available: isAdmin
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
      available: isAdmin
    }
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AlertHub
              </h1>
              <p className="text-xs text-muted-foreground">
                Notification Platform
              </p>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1">
            {tabs.filter(tab => tab.available).map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "relative gap-2 transition-all duration-200",
                      isActive && "bg-gradient-primary text-white hover:opacity-90"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs min-w-[1.2rem] h-5"
                      >
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* User Controls */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="w-9 h-9 p-0"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* User Selector */}
            <div className="flex items-center gap-2">
              <Select value={currentUser.id} onValueChange={handleUserChange}>
                <SelectTrigger className="w-[180px] gap-2">
                  <User className="w-4 h-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current User Info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser.role === 'admin' ? 'Administrator' : 'User'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};