import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle, Info, Zap, Calendar, Users, User, Building } from 'lucide-react';
import { Alert, AlertSeverity } from '@/lib/types';
import { mockApi } from '@/lib/mock-api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreateAlertDialogProps {
  onAlertCreated: () => void;
}

const severityOptions = [
  { value: 'Info', label: 'Info', icon: Info, color: 'text-info' },
  { value: 'Warning', label: 'Warning', icon: AlertTriangle, color: 'text-warning' },
  { value: 'Critical', label: 'Critical', icon: Zap, color: 'text-critical' }
];

export const CreateAlertDialog: React.FC<CreateAlertDialogProps> = ({ onAlertCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'Info' as AlertSeverity,
    visibilityOrg: false,
    visibilityTeams: [] as string[],
    visibilityUsers: [] as string[],
    reminderEnabled: true,
    reminderFrequencyMinutes: 120,
    startTime: new Date().toISOString().slice(0, 16),
    expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });

  const teams = mockApi.getTeams();
  const users = mockApi.getUsers();
  const currentUser = mockApi.getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const alertData = {
        title: formData.title,
        message: formData.message,
        severity: formData.severity,
        visibility: {
          org: formData.visibilityOrg,
          teams: formData.visibilityTeams,
          users: formData.visibilityUsers
        },
        deliveryTypes: ['inapp'],
        reminderEnabled: formData.reminderEnabled,
        reminderFrequencyMinutes: formData.reminderFrequencyMinutes,
        startTime: new Date(formData.startTime).toISOString(),
        expiryTime: new Date(formData.expiryTime).toISOString(),
        archived: false,
        createdBy: currentUser.id
      };

      await mockApi.createAlert(alertData);
      
      toast({
        title: "Alert Created",
        description: "Your alert has been created successfully and is now active.",
      });

      setOpen(false);
      onAlertCreated();
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        severity: 'Info',
        visibilityOrg: false,
        visibilityTeams: [],
        visibilityUsers: [],
        reminderEnabled: true,
        reminderFrequencyMinutes: 120,
        startTime: new Date().toISOString().slice(0, 16),
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create alert. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityPreview = () => {
    if (formData.visibilityOrg) return "Organization-wide";
    if (formData.visibilityTeams.length > 0) return `Teams: ${formData.visibilityTeams.join(', ')}`;
    if (formData.visibilityUsers.length > 0) return `Users: ${formData.visibilityUsers.length} selected`;
    return "No recipients selected";
  };

  const selectedSeverity = severityOptions.find(s => s.value === formData.severity);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4" />
          Create Alert
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Alert</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label htmlFor="title">Alert Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief, descriptive title for your alert"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="message">Alert Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Detailed message explaining the alert and any required actions"
                  required
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select 
                    value={formData.severity} 
                    onValueChange={(value: AlertSeverity) => setFormData(prev => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map(option => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className={cn("w-4 h-4", option.color)} />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="frequency">Reminder Frequency (minutes)</Label>
                  <Input
                    id="frequency"
                    type="number"
                    min="1"
                    value={formData.reminderFrequencyMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderFrequencyMinutes: parseInt(e.target.value) || 120 }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiryTime">Expiry Time</Label>
                  <Input
                    id="expiryTime"
                    type="datetime-local"
                    value={formData.expiryTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryTime: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminderEnabled"
                  checked={formData.reminderEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reminderEnabled: checked as boolean }))}
                />
                <Label htmlFor="reminderEnabled">Enable recurring reminders</Label>
              </div>
            </div>
            
            {/* Live Preview */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {selectedSeverity && (
                      <>
                        <selectedSeverity.icon className={cn("w-4 h-4", selectedSeverity.color)} />
                        <Badge className={
                          formData.severity === 'Info' ? 'bg-info text-info-foreground' :
                          formData.severity === 'Warning' ? 'bg-warning text-warning-foreground' :
                          'bg-critical text-critical-foreground'
                        }>
                          {formData.severity}
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">
                      {formData.title || "Alert Title"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                      {formData.message || "Alert message will appear here"}
                    </p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(formData.startTime).toLocaleDateString()} - {new Date(formData.expiryTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1">
                      Audience: {getVisibilityPreview()}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Visibility Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Visibility Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visibilityOrg"
                      checked={formData.visibilityOrg}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visibilityOrg: checked as boolean }))}
                    />
                    <Label htmlFor="visibilityOrg" className="flex items-center gap-1 text-sm">
                      <Building className="w-3 h-3" />
                      Entire Organization
                    </Label>
                  </div>
                  
                  {!formData.visibilityOrg && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground">Specific Teams</Label>
                        <div className="space-y-2 mt-1">
                          {teams.map(team => (
                            <div key={team.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`team-${team.id}`}
                                checked={formData.visibilityTeams.includes(team.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({ ...prev, visibilityTeams: [...prev.visibilityTeams, team.id] }));
                                  } else {
                                    setFormData(prev => ({ ...prev, visibilityTeams: prev.visibilityTeams.filter(id => id !== team.id) }));
                                  }
                                }}
                              />
                              <Label htmlFor={`team-${team.id}`} className="text-sm">{team.name}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Specific Users</Label>
                        <div className="space-y-2 mt-1 max-h-32 overflow-y-auto">
                          {users.map(user => (
                            <div key={user.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={formData.visibilityUsers.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({ ...prev, visibilityUsers: [...prev.visibilityUsers, user.id] }));
                                  } else {
                                    setFormData(prev => ({ ...prev, visibilityUsers: prev.visibilityUsers.filter(id => id !== user.id) }));
                                  }
                                }}
                              />
                              <Label htmlFor={`user-${user.id}`} className="text-sm">{user.name}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title || !formData.message}>
              {loading ? "Creating..." : "Create Alert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};