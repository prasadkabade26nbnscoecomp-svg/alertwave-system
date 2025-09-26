import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Alerting Platform
            </CardTitle>
            <CardDescription className="text-lg">
              Manage and receive important notifications with ease
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate('/signup')}
                  size="lg"
                  className="w-full"
                >
                  Get Started
                </Button>
              </motion.div>
              
              <div className="text-sm text-muted-foreground">
                <p>Choose your role:</p>
                <p className="mt-1">👤 User - View and manage alerts</p>
                <p>⚡ Admin - Create and manage all alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Index;
