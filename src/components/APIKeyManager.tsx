
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Save, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Hardcoded API keys (for demo purposes only - in production these would be stored securely)
const API_KEYS = {
  OPENAI_API_KEY: "sk-******************************",
  GOOGLE_API_KEY: "AIza**************************",
  ANTHROPIC_API_KEY: "sk-ant-*********************",
  ELEVEN_LABS_API_KEY: "************************"
};

interface APIKeyManagerProps {
  onSave?: (keys: Record<string, string>) => void;
}

const APIKeyManager: React.FC<APIKeyManagerProps> = ({ onSave }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [keys, setKeys] = useState<Record<string, string>>(API_KEYS);
  const { toast } = useToast();

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (!showKeys) {
      const prefix = key.substring(0, 5);
      const suffix = key.substring(key.length - 4);
      return `${prefix}${'*'.repeat(10)}${suffix}`;
    }
    return key;
  };

  const handleSaveKeys = () => {
    // In a real app, this would securely save the keys
    if (onSave) {
      onSave(keys);
    }
    
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been securely saved.",
    });
  };

  const toggleShowKeys = () => {
    setShowKeys(!showKeys);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl flex items-center">
          <Key className="mr-2 h-5 w-5" />
          API Key Management
        </CardTitle>
        <CardDescription>
          Manage your API keys for various services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-keys" className="flex-1">
            Show API Keys
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-keys"
              checked={showKeys}
              onCheckedChange={toggleShowKeys}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleShowKeys}
              className="h-8 w-8"
            >
              {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(keys).map(([keyName, keyValue]) => (
            <div key={keyName} className="space-y-1">
              <Label htmlFor={keyName} className="text-sm">
                {keyName.replace(/_/g, ' ')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={keyName}
                  type={showKeys ? "text" : "password"}
                  value={maskApiKey(keyValue)}
                  onChange={(e) => setKeys({ ...keys, [keyName]: e.target.value })}
                  className="font-mono"
                  placeholder={`Enter your ${keyName.replace(/_/g, ' ').toLowerCase()}`}
                  readOnly={!showKeys}
                />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSaveKeys} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save API Keys
        </Button>
      </CardContent>
    </Card>
  );
};

export default APIKeyManager;
