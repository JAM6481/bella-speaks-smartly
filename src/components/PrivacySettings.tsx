
import React from 'react';
import { Shield, Clock, Users, ServerOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PrivacySettings as PrivacySettingsType } from '@/types/bella';
import { useBella } from '@/context/BellaContext';

const PrivacySettings: React.FC = () => {
  const { privacySettings, updatePrivacySettings } = useBella();
  
  const handleSaveHistoryToggle = (checked: boolean) => {
    updatePrivacySettings({ saveConversationHistory: checked });
  };
  
  const handleImprovement = (checked: boolean) => {
    updatePrivacySettings({ useDataForImprovement: checked });
  };
  
  const handleThirdPartyToggle = (checked: boolean) => {
    updatePrivacySettings({ allowThirdPartyProcessing: checked });
  };
  
  const handleRetentionChange = (values: number[]) => {
    updatePrivacySettings({ dataRetentionPeriod: values[0] });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-500" />
            Privacy & Data Settings
          </CardTitle>
          <CardDescription>
            Control how your data is used and stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="save-history" className="font-medium">Save Conversation History</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  When enabled, Bella will save your conversation history for future reference
                </p>
              </div>
              <Switch 
                id="save-history" 
                checked={privacySettings.saveConversationHistory} 
                onCheckedChange={handleSaveHistoryToggle}
              />
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="data-improvement" className="font-medium">Use Data for Service Improvement</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow anonymous usage of conversations to improve Bella's responses
                </p>
              </div>
              <Switch 
                id="data-improvement" 
                checked={privacySettings.useDataForImprovement} 
                onCheckedChange={handleImprovement}
              />
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="third-party" className="font-medium">Allow Third-Party Processing</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow trusted third parties to process your data for service enhancement
                </p>
              </div>
              <Switch 
                id="third-party" 
                checked={privacySettings.allowThirdPartyProcessing} 
                onCheckedChange={handleThirdPartyToggle}
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="retention-period" className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  Data Retention Period
                </Label>
                <span className="text-sm font-medium">
                  {privacySettings.dataRetentionPeriod} days
                </span>
              </div>
              <Slider
                id="retention-period"
                min={7}
                max={365}
                step={1}
                value={[privacySettings.dataRetentionPeriod]}
                onValueChange={handleRetentionChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>7 days</span>
                <span>30 days</span>
                <span>90 days</span>
                <span>1 year</span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center text-sm">
              <ServerOff className="h-4 w-4 mr-2 text-blue-500" />
              <span>
                Data purge option is available in account settings
              </span>
            </div>
            <div className="flex items-center text-sm mt-2">
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              <span>
                Your privacy is important to us. We never sell your personal data.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;
