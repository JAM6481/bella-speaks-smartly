
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, FileText, Clock, Trash2 } from 'lucide-react';
import { PrivacySettings, SafetyGuardrails } from '@/types/bella';

interface PrivacyDashboardProps {
  privacySettings: PrivacySettings;
  safetyGuardrails: SafetyGuardrails;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateSafetyGuardrails: (settings: Partial<SafetyGuardrails>) => void;
  clearConversationHistory: () => void;
}

const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({
  privacySettings,
  safetyGuardrails,
  updatePrivacySettings,
  updateSafetyGuardrails,
  clearConversationHistory
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const handlePrivacySettingChange = (key: keyof PrivacySettings, value: any) => {
    updatePrivacySettings({ [key]: value });
  };
  
  const handleSafetySettingChange = (key: keyof SafetyGuardrails, value: any) => {
    updateSafetyGuardrails({ [key]: value });
  };
  
  const handleClearHistory = () => {
    clearConversationHistory();
    setShowConfirmClear(false);
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-500" />
              Privacy Controls
            </CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">Enhanced</Badge>
          </div>
          <CardDescription>
            Manage how your data is stored, used, and protected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <Label className="flex items-center" htmlFor="save-history">
                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                Save conversation history
              </Label>
              <p className="text-sm text-gray-500">
                Store conversations for future reference
              </p>
            </div>
            <Switch 
              id="save-history" 
              checked={privacySettings.saveConversationHistory}
              onCheckedChange={(checked) => 
                handlePrivacySettingChange('saveConversationHistory', checked)
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <Label className="flex items-center" htmlFor="improve-service">
                <Eye className="mr-2 h-4 w-4 text-blue-500" />
                Use data for service improvement
              </Label>
              <p className="text-sm text-gray-500">
                Help improve Bella by sharing anonymized usage data
              </p>
            </div>
            <Switch 
              id="improve-service" 
              checked={privacySettings.useDataForImprovement}
              onCheckedChange={(checked) => 
                handlePrivacySettingChange('useDataForImprovement', checked)
              }
            />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label className="flex items-center" htmlFor="retention-period">
              <Clock className="mr-2 h-4 w-4 text-blue-500" />
              Data retention period: {privacySettings.dataRetentionPeriod} days
            </Label>
            <Slider 
              id="retention-period"
              min={1}
              max={90}
              step={1}
              value={[privacySettings.dataRetentionPeriod]}
              onValueChange={(value) => 
                handlePrivacySettingChange('dataRetentionPeriod', value[0])
              }
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Set how long your data is kept before automatic deletion
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-3 border-t">
          {!showConfirmClear ? (
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setShowConfirmClear(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Conversation Data
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="destructive"
                onClick={handleClearHistory}
              >
                Confirm Clear
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowConfirmClear(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      
      <Card className="border-indigo-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Lock className="mr-2 h-5 w-5 text-indigo-500" />
              Safety Guardrails
            </CardTitle>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700">Protected</Badge>
          </div>
          <CardDescription>
            Control content filtering and safety measures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <Label className="flex items-center" htmlFor="content-filtering">
                Content filtering
              </Label>
              <p className="text-sm text-gray-500">
                Filter out inappropriate or harmful content
              </p>
            </div>
            <Switch 
              id="content-filtering" 
              checked={safetyGuardrails.contentFiltering}
              onCheckedChange={(checked) => 
                handleSafetySettingChange('contentFiltering', checked)
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <Label className="flex items-center" htmlFor="explicit-content">
                Allow explicit content
              </Label>
              <p className="text-sm text-gray-500">
                Allow content that may be considered explicit
              </p>
            </div>
            <Switch 
              id="explicit-content" 
              checked={safetyGuardrails.allowExplicitContent}
              onCheckedChange={(checked) => 
                handleSafetySettingChange('allowExplicitContent', checked)
              }
              disabled={safetyGuardrails.contentFiltering}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyDashboard;
