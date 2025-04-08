
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Code, DollarSign, Share, Briefcase, Heart, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBella } from '@/context/BellaContext';
import { AgentType } from '@/types/bella';

const OfflineAgents: React.FC = () => {
  const { offlineAgents, activeAgent, setActiveAgent } = useBella();
  
  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'briefcase': return <Briefcase className="h-5 w-5" />;
      case 'code': return <Code className="h-5 w-5" />;
      case 'stethoscope': return <Heart className="h-5 w-5" />;
      case 'dollar-sign': return <DollarSign className="h-5 w-5" />;
      case 'share': return <Share className="h-5 w-5" />;
      default: return <Bot className="h-5 w-5" />;
    }
  };
  
  const getAgentColor = (type: AgentType): string => {
    switch (type) {
      case 'business': return 'bg-blue-500 text-white';
      case 'coding': return 'bg-purple-500 text-white';
      case 'medical': return 'bg-red-500 text-white';
      case 'finance': return 'bg-green-500 text-white';
      case 'social': return 'bg-pink-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const handleSetActiveAgent = (type: AgentType) => {
    setActiveAgent(type);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4">Offline Specialist Agents</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Access specialized AI agents that work offline on your device for specific tasks and domains.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card 
            className={`border-blue-200 dark:border-blue-800 transition-all duration-300 hover:shadow-md ${activeAgent === 'general' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
            onClick={() => handleSetActiveAgent('general')}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-blue-500 text-white">
                    <Bot className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">General Assistant</CardTitle>
                </div>
                {activeAgent === 'general' && (
                  <Badge variant="default" className="bg-blue-500">
                    <Check className="h-3 w-3 mr-1" /> Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <CardDescription>
                The default Bella assistant for general questions and tasks
              </CardDescription>
            </CardContent>
            
            <CardFooter className="pt-2 flex justify-end">
              <Button 
                variant={activeAgent === 'general' ? "default" : "outline"} 
                size="sm"
                onClick={() => handleSetActiveAgent('general')}
                className={activeAgent === 'general' ? "bg-blue-500 hover:bg-blue-600" : "text-blue-500 border-blue-200"}
              >
                {activeAgent === 'general' ? "Active" : "Activate"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        <Separator className="my-2" />
        
        {offlineAgents.map((agent) => (
          <motion.div
            key={agent.id}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card 
              className={`border-blue-200 dark:border-blue-800 transition-all duration-300 hover:shadow-md ${activeAgent === agent.type ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
              onClick={() => handleSetActiveAgent(agent.type)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${getAgentColor(agent.type)}`}>
                      {getAgentIcon(agent.icon)}
                    </div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                  </div>
                  {activeAgent === agent.type ? (
                    <Badge variant="default" className="bg-blue-500">
                      <Check className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
                      {agent.isAvailable ? "Available" : "Coming Soon"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <CardDescription>{agent.description}</CardDescription>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {agent.expertise.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {agent.expertise.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{agent.expertise.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-end">
                <Button 
                  variant={activeAgent === agent.type ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleSetActiveAgent(agent.type)}
                  disabled={!agent.isAvailable}
                  className={activeAgent === agent.type ? "bg-blue-500 hover:bg-blue-600" : "text-blue-500 border-blue-200"}
                >
                  {activeAgent === agent.type ? "Active" : "Activate"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          <strong>Offline agents</strong> operate entirely on your device without sending data to external servers.
          This provides enhanced privacy and allows Bella to function even without an internet connection.
        </p>
      </div>
    </div>
  );
};

export default OfflineAgents;
