
import React from 'react';
import { Shield, AlertOctagon, Lock, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SafetyGuardrails as SafetyGuardrailsType } from '@/types/bella';
import { useBella } from '@/context/BellaContext';

const SafetyGuardrails: React.FC = () => {
  const { safetyGuardrails, updateSafetyGuardrails } = useBella();
  const [newTopic, setNewTopic] = React.useState('');
  
  const handleContentFilteringToggle = (checked: boolean) => {
    updateSafetyGuardrails({ contentFiltering: checked });
  };
  
  const handleExplicitContentToggle = (checked: boolean) => {
    updateSafetyGuardrails({ allowExplicitContent: checked });
  };
  
  const handleRetentionChange = (values: number[]) => {
    updateSafetyGuardrails({ maxPersonalDataRetention: values[0] });
  };
  
  const addBlockedTopic = () => {
    if (newTopic.trim() && !safetyGuardrails.sensitiveTopicsBlocked.includes(newTopic.trim())) {
      updateSafetyGuardrails({
        sensitiveTopicsBlocked: [...safetyGuardrails.sensitiveTopicsBlocked, newTopic.trim()]
      });
      setNewTopic('');
    }
  };
  
  const removeTopic = (topic: string) => {
    updateSafetyGuardrails({
      sensitiveTopicsBlocked: safetyGuardrails.sensitiveTopicsBlocked.filter(t => t !== topic)
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-500" />
            Safety Guardrails
          </CardTitle>
          <CardDescription>
            Set boundaries for content and personal data protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="content-filtering" className="font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-blue-500" />
                  Content Filtering
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically filter potentially harmful or inappropriate content
                </p>
              </div>
              <Switch 
                id="content-filtering" 
                checked={safetyGuardrails.contentFiltering} 
                onCheckedChange={handleContentFilteringToggle}
              />
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="explicit-content" className="font-medium flex items-center">
                  <AlertOctagon className="h-4 w-4 mr-2 text-blue-500" />
                  Allow Explicit Content
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  When disabled, blocks responses containing adult or explicit themes
                </p>
              </div>
              <Switch 
                id="explicit-content" 
                checked={safetyGuardrails.allowExplicitContent} 
                onCheckedChange={handleExplicitContentToggle}
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="data-retention" className="font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-blue-500" />
                  Personal Data Retention Limit
                </Label>
                <span className="text-sm font-medium">
                  {safetyGuardrails.maxPersonalDataRetention} days
                </span>
              </div>
              <Slider
                id="data-retention"
                min={1}
                max={90}
                step={1}
                value={[safetyGuardrails.maxPersonalDataRetention]}
                onValueChange={handleRetentionChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>1 day</span>
                <span>7 days</span>
                <span>30 days</span>
                <span>90 days</span>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <Label className="font-medium">Blocked Sensitive Topics</Label>
              <div className="flex flex-wrap gap-2">
                {safetyGuardrails.sensitiveTopicsBlocked.map(topic => (
                  <Badge key={topic} variant="secondary" className="group">
                    {topic}
                    <button 
                      className="ml-1 opacity-50 group-hover:opacity-100"
                      onClick={() => removeTopic(topic)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {safetyGuardrails.sensitiveTopicsBlocked.length === 0 && (
                  <span className="text-sm text-muted-foreground">No topics blocked</span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  placeholder="Add topic to block"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBlockedTopic()}
                  className="flex-1"
                />
                <Button onClick={addBlockedTopic} size="sm">Add</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyGuardrails;
