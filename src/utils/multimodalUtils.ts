// Utilities for enhanced multimodal interaction

type InteractionType = 'voice' | 'text' | 'touch';

/**
 * Detects the optimal interaction modality based on user behavior and context
 * @param userInteractions - Recent user interaction history
 * @param deviceCapabilities - Available device capabilities
 * @returns The recommended interaction modality
 */
export const detectOptimalModality = (
  userInteractions: { type: InteractionType; timestamp: number }[],
  deviceCapabilities: {
    hasMicrophone: boolean;
    hasCamera: boolean;
    hasTouchscreen: boolean;
    hasKeyboard: boolean;
  }
): InteractionType => {
  // Count recent interactions by type
  const recentInteractions = userInteractions.filter(
    i => Date.now() - i.timestamp < 5 * 60 * 1000 // Last 5 minutes
  );
  
  const interactionCounts: Record<InteractionType, number> = {
    voice: 0,
    text: 0,
    touch: 0
  };
  
  recentInteractions.forEach(interaction => {
    interactionCounts[interaction.type]++;
  });
  
  // Determine most used modality
  let preferredModality: InteractionType = 'text'; // Default
  let maxCount = 0;
  
  // Using type-safe approach with Object.entries and proper type assertions
  (Object.entries(interactionCounts) as [InteractionType, number][]).forEach(([modality, count]) => {
    if (count > maxCount) {
      maxCount = count;
      preferredModality = modality;
    }
  });
  
  // Validate against device capabilities with proper type handling
  if (preferredModality === 'voice' && !deviceCapabilities.hasMicrophone) {
    preferredModality = deviceCapabilities.hasTouchscreen ? 'touch' : 'text';
  } else if (preferredModality === 'touch' && !deviceCapabilities.hasTouchscreen) {
    preferredModality = deviceCapabilities.hasMicrophone ? 'voice' : 'text';
  } else if (preferredModality === 'text' && !deviceCapabilities.hasKeyboard) {
    preferredModality = deviceCapabilities.hasMicrophone ? 'voice' : 'touch';
  }
  
  return preferredModality;
};

/**
 * Detects device capabilities for multimodal interaction
 * @returns Object containing detected device capabilities
 */
export const detectDeviceCapabilities = async (): Promise<{
  hasMicrophone: boolean;
  hasCamera: boolean;
  hasTouchscreen: boolean;
  hasKeyboard: boolean;
}> => {
  // Default capabilities
  const capabilities = {
    hasMicrophone: false,
    hasCamera: false,
    hasTouchscreen: 'ontouchstart' in window,
    hasKeyboard: true // Assume keyboard is available by default
  };
  
  // Check for microphone and camera access
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      capabilities.hasMicrophone = devices.some(device => device.kind === 'audioinput');
      capabilities.hasCamera = devices.some(device => device.kind === 'videoinput');
    }
  } catch (error) {
    console.error('Error detecting media devices:', error);
  }
  
  return capabilities;
};

/**
 * Tracks user interaction with the application
 * @param interactionType - Type of interaction (voice, text, touch)
 * @param interactionData - Additional interaction data
 */
export const trackUserInteraction = (
  interactionType: InteractionType,
  interactionData?: any
): void => {
  // Create interaction record
  const interaction = {
    type: interactionType,
    timestamp: Date.now(),
    data: interactionData
  };
  
  // Get existing interaction history from storage
  let interactionHistory = [];
  try {
    const storedHistory = localStorage.getItem('bella_interaction_history');
    if (storedHistory) {
      interactionHistory = JSON.parse(storedHistory);
    }
  } catch (error) {
    console.error('Error reading interaction history:', error);
  }
  
  // Add new interaction and limit history size
  interactionHistory.push(interaction);
  if (interactionHistory.length > 100) {
    interactionHistory = interactionHistory.slice(-100);
  }
  
  // Save updated history
  try {
    localStorage.setItem('bella_interaction_history', JSON.stringify(interactionHistory));
  } catch (error) {
    console.error('Error saving interaction history:', error);
  }
};
