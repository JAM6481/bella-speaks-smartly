
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Shield, Key, Lock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
        <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>API Keys Storage</AlertTitle>
          <AlertDescription>
            All API keys and sensitive credentials are stored securely in your browser's local storage, encrypted using a unique device key.
          </AlertDescription>
        </Alert>

        <Accordion type="single" collapsible>
          <AccordionItem value="local-storage">
            <AccordionTrigger className="text-sm font-medium">
              Local Storage Encryption
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">
                When you enter API keys into Bella, they are:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Encrypted before being saved to your browser's local storage</li>
                <li>Never sent to our servers or any third parties</li>
                <li>Only decrypted locally in your browser when needed for API calls</li>
                <li>Automatically cleared when you clear your browser data</li>
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
                <li>For OpenAI and Anthropic, consider using organization-specific keys</li>
                <li>Review API usage regularly in your provider dashboards</li>
                <li>Use a private/incognito browser window if using Bella on a shared computer</li>
                <li>Clear your browser data when finished if using a public computer</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="access">
            <AccordionTrigger className="text-sm font-medium">
              Managing Your API Keys
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">
                You can manage your stored API keys at any time:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>View, update, or delete keys in the AI Settings panel</li>
                <li>All keys are automatically removed if you clear your browser data</li>
                <li>You can revoke API keys at any time from your provider's dashboard</li>
              </ul>
              <div className="flex items-center mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <Shield className="h-4 w-4 text-green-500 mr-2" />
                <p className="text-xs">
                  For enterprise-grade security, consider using a backend proxy service with proper API key management.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
          <Lock className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Important Security Notice</h4>
            <p className="text-xs mt-1 text-amber-700 dark:text-amber-400">
              Never share your API keys with others. The keys provide access to paid services billed to your account. Treat them like passwords and store them securely.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeyStorage;
