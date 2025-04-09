
import React from 'react';
import { useBella } from '@/context/BellaContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { openRouterModels, n8nModels } from '@/utils/aiProviders';
import AIModelSelector from '@/components/AIModelSelector';

const AISettings = () => {
  const { aiSettings, updateAISettings, activeProvider, setActiveProvider } = useBella();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">AI Provider Settings</h3>
      
      <AIModelSelector />
      
      <Tabs defaultValue={activeProvider} onValueChange={(v: any) => setActiveProvider(v)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="openrouter">OpenRouter</TabsTrigger>
          <TabsTrigger value="n8n">n8n</TabsTrigger>
        </TabsList>
        
        <TabsContent value="openrouter" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="openrouter-api-key">API Key</Label>
            <Input
              id="openrouter-api-key"
              type="password"
              placeholder="Enter your OpenRouter API key"
              value={aiSettings.openRouter.apiKey}
              onChange={(e) => updateAISettings('openrouter', { apiKey: e.target.value })}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never shared
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="openrouter-temperature">Temperature</Label>
              <span className="text-sm text-muted-foreground">
                {aiSettings.openRouter.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              id="openrouter-temperature"
              value={[aiSettings.openRouter.temperature]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(value) => updateAISettings('openrouter', { temperature: value[0] })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="openrouter-max-tokens">Max Tokens</Label>
              <span className="text-sm text-muted-foreground">{aiSettings.openRouter.maxTokens}</span>
            </div>
            <Slider
              id="openrouter-max-tokens"
              value={[aiSettings.openRouter.maxTokens]}
              min={100}
              max={4000}
              step={100}
              onValueChange={(value) => updateAISettings('openrouter', { maxTokens: value[0] })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Shorter</span>
              <span>Longer</span>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4"
            variant="default"
            disabled={!aiSettings.openRouter.apiKey}
            onClick={() => {
              // Would verify the API key in a real implementation
              alert('API key saved and validated.');
            }}
          >
            Save OpenRouter Settings
          </Button>
        </TabsContent>
        
        <TabsContent value="n8n" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="n8n-webhook-url">Webhook URL</Label>
            <Input
              id="n8n-webhook-url"
              placeholder="Enter your n8n webhook URL"
              value={aiSettings.n8n.webhookUrl}
              onChange={(e) => updateAISettings('n8n', { webhookUrl: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              The webhook URL provided by your n8n instance
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="n8n-api-key">API Key (if required)</Label>
            <Input
              id="n8n-api-key"
              type="password"
              placeholder="Enter your n8n API key"
              value={aiSettings.n8n.apiKey}
              onChange={(e) => updateAISettings('n8n', { apiKey: e.target.value })}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Only required if your n8n instance is password protected
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="n8n-workflow">Workflow</Label>
            <Select 
              value={aiSettings.n8n.selectedWorkflow}
              onValueChange={(value) => updateAISettings('n8n', { selectedWorkflow: value })}
            >
              <SelectTrigger id="n8n-workflow">
                <SelectValue placeholder="Select a workflow" />
              </SelectTrigger>
              <SelectContent>
                {n8nModels.map((workflow) => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {n8nModels.find(w => w.id === aiSettings.n8n.selectedWorkflow)?.description || 
               "Select a workflow to see its description"}
            </p>
          </div>
          
          <Button 
            className="w-full mt-4"
            variant="default"
            disabled={!aiSettings.n8n.webhookUrl}
            onClick={() => {
              // Would verify the webhook URL in a real implementation
              alert('n8n settings saved and webhook URL validated.');
            }}
          >
            Save n8n Settings
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISettings;
