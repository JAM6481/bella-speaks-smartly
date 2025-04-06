
import React from 'react';
import BellaAssistant from '@/components/BellaAssistant';
import { BellaProvider } from '@/context/BellaContext';

const Index = () => {
  return (
    <BellaProvider>
      <BellaAssistant />
    </BellaProvider>
  );
};

export default Index;
