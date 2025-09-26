import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { UserDashboard } from '@/pages/UserDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'admin' | 'analytics'>('alerts');
  const [unreadCount, setUnreadCount] = useState(0);

  const renderContent = () => {
    switch (activeTab) {
      case 'alerts':
        return <UserDashboard onUnreadCountChange={setUnreadCount} />;
      case 'admin':
        return <AdminDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <UserDashboard onUnreadCountChange={setUnreadCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
