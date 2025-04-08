
import React from 'react';
import { useBella } from '@/context/BellaContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const GoogleAPISettings: React.FC = () => {
  const { googleAPISettings, updateGoogleAPISettings } = useBella();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">Google API Settings</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Configure your Google API credentials to use Google Calendar, Contacts, and Gmail integrations.
      </p>
      
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">API Credentials</CardTitle>
          <CardDescription>
            Enter your Google Cloud project credentials
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-client-id">Client ID</Label>
            <Input
              id="google-client-id"
              placeholder="Enter your Google OAuth Client ID"
              value={googleAPISettings.clientId}
              onChange={(e) => updateGoogleAPISettings({ clientId: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              From Google Cloud Console under OAuth 2.0 Client IDs
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="google-api-key">API Key</Label>
            <Input
              id="google-api-key"
              placeholder="Enter your Google API Key"
              value={googleAPISettings.apiKey}
              onChange={(e) => updateGoogleAPISettings({ apiKey: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              From Google Cloud Console under API Keys
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Required Scopes</Label>
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="scope-calendar" 
                  checked={googleAPISettings.scopes.includes('https://www.googleapis.com/auth/calendar')}
                  onCheckedChange={(checked) => {
                    let newScopes = [...googleAPISettings.scopes];
                    const scope = 'https://www.googleapis.com/auth/calendar';
                    if (checked) {
                      if (!newScopes.includes(scope)) newScopes.push(scope);
                    } else {
                      newScopes = newScopes.filter(s => s !== scope);
                    }
                    updateGoogleAPISettings({ scopes: newScopes });
                  }}
                />
                <Label htmlFor="scope-calendar" className="text-sm font-normal">Calendar API</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="scope-contacts" 
                  checked={googleAPISettings.scopes.includes('https://www.googleapis.com/auth/contacts')}
                  onCheckedChange={(checked) => {
                    let newScopes = [...googleAPISettings.scopes];
                    const scope = 'https://www.googleapis.com/auth/contacts';
                    if (checked) {
                      if (!newScopes.includes(scope)) newScopes.push(scope);
                    } else {
                      newScopes = newScopes.filter(s => s !== scope);
                    }
                    updateGoogleAPISettings({ scopes: newScopes });
                  }}
                />
                <Label htmlFor="scope-contacts" className="text-sm font-normal">Contacts API</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="scope-gmail" 
                  checked={googleAPISettings.scopes.includes('https://www.googleapis.com/auth/gmail.readonly')}
                  onCheckedChange={(checked) => {
                    let newScopes = [...googleAPISettings.scopes];
                    const scope = 'https://www.googleapis.com/auth/gmail.readonly';
                    if (checked) {
                      if (!newScopes.includes(scope)) newScopes.push(scope);
                    } else {
                      newScopes = newScopes.filter(s => s !== scope);
                    }
                    updateGoogleAPISettings({ scopes: newScopes });
                  }}
                />
                <Label htmlFor="scope-gmail" className="text-sm font-normal">Gmail API</Label>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full"
            variant="default"
            onClick={() => {
              // In a real implementation, we would verify the credentials here
              updateGoogleAPISettings(googleAPISettings);
            }}
          >
            Save Google API Settings
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-sm text-muted-foreground pt-2">
        <p>These credentials are stored securely in your browser's local storage and are never sent to our servers.</p>
        <p className="mt-2">
          <a 
            href="https://console.cloud.google.com/apis/credentials" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Visit Google Cloud Console
          </a>
          {' '}to create your credentials.
        </p>
      </div>
    </div>
  );
};

export default GoogleAPISettings;
