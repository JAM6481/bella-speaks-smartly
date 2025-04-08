
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mail, Users, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useBella } from '@/context/BellaContext';
import { IntegrationType } from '@/types/bella';
import { useToast } from '@/hooks/use-toast';

const IntegrationsPanel: React.FC = () => {
  const { integrations, connectIntegration, disconnectIntegration } = useBella();
  const { toast } = useToast();
  
  const integrationsList: {
    type: IntegrationType;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'googleCalendar',
      title: 'Google Calendar',
      description: 'Schedule and manage events, meetings, and appointments',
      icon: <Calendar className="h-5 w-5" />,
      color: 'bg-blue-500 text-white'
    },
    {
      type: 'googleContacts',
      title: 'Google Contacts',
      description: 'Access and manage your contacts',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-green-500 text-white'
    },
    {
      type: 'gmail',
      title: 'Gmail',
      description: 'Send and receive emails from your Google account',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-red-500 text-white'
    },
    {
      type: 'outlookEmail',
      title: 'Outlook Email',
      description: 'Send and receive emails from your Microsoft account',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-blue-600 text-white'
    }
  ];
  
  const handleToggleIntegration = async (type: IntegrationType, isConnected: boolean) => {
    if (isConnected) {
      // Disconnect
      disconnectIntegration(type);
    } else {
      // Connect
      try {
        const success = await connectIntegration(type);
        if (!success) {
          throw new Error('Connection failed');
        }
      } catch (error) {
        console.error('Integration error:', error);
        toast({
          title: 'Connection Failed',
          description: `Unable to connect to ${type}. Please try again.`,
          variant: 'destructive'
        });
      }
    }
  };
  
  const formatLastSynced = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4">Connected Services</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect Bella with your favorite services to enable advanced features like calendar management, 
          email integration, and contact synchronization.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrationsList.map((integration) => (
          <motion.div
            key={integration.type}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="border-blue-200 dark:border-blue-800 transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${integration.color}`}>
                      {integration.icon}
                    </div>
                    <CardTitle className="text-base">{integration.title}</CardTitle>
                  </div>
                  <Switch
                    checked={integrations[integration.type].isConnected}
                    onCheckedChange={(checked) => handleToggleIntegration(integration.type, !checked)}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <CardDescription>{integration.description}</CardDescription>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  <span>Last synced: {formatLastSynced(integrations[integration.type].lastSynced)}</span>
                </div>
                
                <div>
                  {integrations[integration.type].isConnected ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 text-xs">
                      Disconnected
                    </Badge>
                  )}
                </div>
              </CardFooter>
              
              {integrations[integration.type].isConnected && (
                <div className="px-6 pb-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 w-full"
                    onClick={() => handleToggleIntegration(integration.type, true)}
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Disconnect
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
      
      <Separator className="my-6 bg-blue-200 dark:bg-blue-800" />
      
      <div>
        <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">Privacy Notice</h3>
        <p className="text-sm text-muted-foreground">
          Bella only accesses your connected services when you explicitly request information or actions.
          Your data is not stored or shared with third parties. You can disconnect any service at any time.
        </p>
      </div>
    </div>
  );
};

export default IntegrationsPanel;
