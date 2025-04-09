
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  openAIModels, 
  openRouterModels, 
  anthropicModels, 
  n8nModels,
  AIModel,
  AIProvider
} from '@/utils/aiProviders';
import { useBella } from '@/context/BellaContext';

const AIModelSelector = () => {
  const { aiSettings, updateAISettings, activeProvider, setActiveProvider } = useBella();

  const handleModelChange = (provider: AIProvider, modelId: string) => {
    updateAISettings(provider, { selectedModel: modelId });
  };

  const renderModelList = (models: AIModel[], provider: AIProvider) => {
    const selectedModel = aiSettings[provider].selectedModel;
    
    return (
      <RadioGroup 
        value={selectedModel}
        onValueChange={(value) => handleModelChange(provider, value)}
        className="space-y-3 mt-3"
      >
        {models.map((model) => (
          <div 
            key={model.id} 
            className={`flex items-start space-x-2 rounded-md border p-3 transition-colors ${
              selectedModel === model.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                : 'border-gray-200 dark:border-gray-800'
            }`}
          >
            <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center">
                <Label 
                  htmlFor={model.id} 
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {model.name}
                </Label>
                {model.isPremium && (
                  <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{model.description}</p>
              {model.contextLength && (
                <div className="text-xs text-muted-foreground">
                  Context: {(model.contextLength / 1000).toLocaleString()}k tokens
                </div>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    );
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-xl text-blue-700 dark:text-blue-300">AI Model Selection</CardTitle>
        <CardDescription>
          Choose which AI model Bella should use for responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeProvider} onValueChange={(v: any) => setActiveProvider(v)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
            <TabsTrigger value="openrouter">OpenRouter</TabsTrigger>
          </TabsList>
          
          <TabsContent value="openai" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              OpenAI models provide cutting-edge AI capabilities with state-of-the-art performance.
            </p>
            {renderModelList(openAIModels, 'openai')}
          </TabsContent>
          
          <TabsContent value="anthropic" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Anthropic's Claude models are known for their helpfulness, harmlessness, and honesty.
            </p>
            {renderModelList(anthropicModels, 'anthropic')}
          </TabsContent>
          
          <TabsContent value="openrouter" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              OpenRouter provides unified access to various AI models through a single API.
            </p>
            {renderModelList(openRouterModels, 'openrouter')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIModelSelector;
