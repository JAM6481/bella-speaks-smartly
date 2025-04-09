
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Shield, Key, Lock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import APIKeyManager from '@/components/APIKeyManager';

const APIKeyStorage = () => {
  return (
    <Card className="w-full bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-blue-500" />
          API Keys Storage and Security
        </CardTitle>
        <CardDescription>
          How your API keys are stored and protected in Bella
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <APIKeyManager />
        
        <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>API Keys Storage</AlertTitle>
          <AlertDescription>
            API keys and credentials are stored securely in the application with limited access.
          </AlertDescription>
        </Alert>

        <Accordion type="single" collapsible>
          <AccordionItem value="local-storage">
            <AccordionTrigger className="text-sm font-medium">
              API Keys Security
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">
                How Bella handles your API keys:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Keys are stored securely with limited access</li>
                <li>Only used for specific API calls</li>
                <li>Keys can be masked in the UI for security</li>
                <li>You can reveal keys temporarily when needed</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security">
            <AccordionTrigger className="text-sm font-medium">
              Security Best Practices
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">
                For enhanced security:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Use API keys with appropriate permission scopes</li>
                <li>Review API usage regularly in your provider dashboards</li>
                <li>Keep your Bella installation updated</li>
                <li>Enable key masking by default</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
          <Lock className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Important Security Notice</h4>
            <p className="text-xs mt-1 text-amber-700 dark:text-amber-400">
              API keys provide access to paid services. Treat them like passwords and use the masking feature when not actively editing them.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeyStorage;
