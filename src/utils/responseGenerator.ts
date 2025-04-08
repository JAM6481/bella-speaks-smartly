
import { IntentResult } from '@/types/bella';

// Enhanced responses for a more premium, helpful experience
const premiumResponses = [
  "I'm Bella, your premium AI assistant. I'm designed to be helpful, informative, and engaging. How can I assist you today?",
  "The current weather shows clear skies with a temperature of 73°F. It's a beautiful day with a gentle breeze from the southwest at 5 mph. The forecast predicts similar conditions for the next 24 hours.",
  "I've set that reminder for you. You'll receive a notification at the specified time. Is there anything else you'd like me to add to the reminder?",
  "I've found several relevant results for your query. Would you like me to summarize the key points or would you prefer more detailed information on a specific aspect?",
  "I'm constantly learning and evolving. While I strive to be helpful, there might be topics where my knowledge is limited. Please feel free to ask for clarification or rephrase your question.",
  "Is there anything specific you'd like to know or discuss? I'm here to assist with information, tasks, or just conversation.",
];

export const getEnhancedResponse = () => {
  return premiumResponses[Math.floor(Math.random() * premiumResponses.length)];
};

// Enhanced intent-based responses for a more helpful and natural experience
export const getIntentBasedResponse = (intentResult: IntentResult, activeProvider: string, selectedModel: string): string => {
  const { topIntent, entities, text, primaryEmotion, contextualMemory } = intentResult;
  const userPreferences = contextualMemory?.userPreferences || {};
  const recentTopics = contextualMemory?.recentTopics || [];
  
  // Add information about the AI model being used
  const modelInfo = activeProvider === 'openRouter' ? 
    `I'm using the ${selectedModel.split('/')[1]?.split('-').slice(0, 2).join(' ')} model. ` : 
    '';
  
  // Personalization based on user preferences and context
  let personalizedPrefix = "";
  if (Object.keys(userPreferences).length > 0) {
    if (userPreferences.like && Math.random() > 0.7) {
      personalizedPrefix = `Since you like ${userPreferences.like}, I thought you might appreciate this: `;
    } else if (userPreferences.favorite_color && Math.random() > 0.8) {
      personalizedPrefix = `I remember your favorite color is ${userPreferences.favorite_color}. `;
    }
  }
  
  // Reference to recent topics for conversational continuity
  let topicReference = "";
  if (recentTopics.length > 1 && Math.random() > 0.8) {
    topicReference = `Going back to our conversation about ${recentTopics[1]}, `;
  }
  
  switch (topIntent) {
    case 'greeting':
      const timeOfDay = new Date().getHours();
      let greeting = "Hello";
      
      if (timeOfDay < 12) greeting = "Good morning";
      else if (timeOfDay < 18) greeting = "Good afternoon";
      else greeting = "Good evening";
      
      return `${greeting}! ${modelInfo}I'm Bella, your premium AI assistant. I'm designed to help with information, tasks, and conversation. How can I make your day better?`;
    
    case 'weather':
      const locations = entities && Array.isArray(entities) 
        ? entities.filter(e => e.entity === 'location')
        : [];
      const weatherLocation = locations.length > 0 ? locations[0].value : 'your location';
      
      return `${personalizedPrefix}${modelInfo}Based on the latest data for ${weatherLocation}, it's currently 72°F with clear skies. The forecast shows a high of 78°F with a 5% chance of precipitation. Would you like more detailed weather information or a forecast for the coming days?`;
    
    case 'reminder':
      let reminderResponse = "I'll set that reminder for you.";
      
      // Check for time/date entities
      const timeEntity = entities && Array.isArray(entities) ? entities.find(e => e.entity === 'time') : null;
      const dateEntity = entities && Array.isArray(entities) ? entities.find(e => e.entity === 'date') : null;
      const taskEntity = entities && Array.isArray(entities) ? entities.find(e => e.entity === 'task') : null;
      
      if (timeEntity && dateEntity) {
        reminderResponse = `I've set a reminder for ${dateEntity.value} at ${timeEntity.value}.`;
      } else if (timeEntity) {
        reminderResponse = `I've set a reminder for today at ${timeEntity.value}.`;
      } else if (dateEntity) {
        reminderResponse = `I've set a reminder for ${dateEntity.value}.`;
      }
      
      if (taskEntity) {
        reminderResponse += ` I'll remind you to "${taskEntity.value}".`;
      }
      
      return reminderResponse + " Is there anything else you'd like me to remind you about or any details you'd like to add?";
    
    case 'calendar':
      const eventTitle = entities && Array.isArray(entities) ? entities.find(e => e.entity === 'event_title') : null;
      const eventDate = entities && Array.isArray(entities) ? entities.find(e => e.entity === 'date') : null;
      const eventTime = entities && Array.isArray(entities) ? entities.find(e => e.entity === 'time') : null;
      const attendees = entities && Array.isArray(entities) ? entities.find(e => e.entity === 'attendees') : null;
      
      if (eventTitle) {
        let calendarResponse = `I'll add "${eventTitle.value}" to your calendar`;
        
        if (eventDate && eventTime) {
          calendarResponse += ` on ${eventDate.value} at ${eventTime.value}`;
        } else if (eventDate) {
          calendarResponse += ` on ${eventDate.value}`;
        } else if (eventTime) {
          calendarResponse += ` at ${eventTime.value} today`;
        }
        
        if (attendees) {
          calendarResponse += ` with ${attendees.value}`;
        }
        
        return `${calendarResponse}. Would you like me to set a reminder for this event as well?`;
      }
      
      return "I can help you manage your calendar. Would you like to add an event, check your schedule, or sync with your Google Calendar?";
    
    case 'email':
      const emailEntity = entities && Array.isArray(entities) ? entities.find(e => e.entity === 'email') : null;
      
      if (text && text.toLowerCase().includes('check') || text && text.toLowerCase().includes('read')) {
        return `${topicReference}I can check your emails for you. Would you like me to show your most recent unread messages?`;
      } else if (text && text.toLowerCase().includes('send') || text && text.toLowerCase().includes('write') || text && text.toLowerCase().includes('compose')) {
        let emailResponse = "I can help you compose an email";
        
        if (emailEntity) {
          emailResponse += ` to ${emailEntity.value}`;
        }
        
        return `${emailResponse}. What would you like the subject and content to be?`;
      }
      
      return "I can help you with your emails. Would you like to check your inbox or compose a new message?";
    
    case 'contacts':
      if (text && text.toLowerCase().includes('find') || text && text.toLowerCase().includes('search')) {
        return "I can search your contacts for you. Who would you like to find?";
      } else if (text && text.toLowerCase().includes('add')) {
        return "I can help you add a new contact. Please provide the name and contact information.";
      }
      
      return "I can help you manage your contacts. Would you like to search for someone, add a new contact, or view your recent contacts?";
    
    case 'search':
      // Detect the search topic for a more personalized response
      const searchTopic = text ? text.replace(/search for|find|look up|google|information about/gi, '').trim() : '';
      if (searchTopic) {
        return `${personalizedPrefix}I've found some information about "${searchTopic}". Would you like me to summarize the key points or would you prefer more detailed information?`;
      }
      return "I've searched for that information. Would you like me to provide a summary or more specific details on a particular aspect?";
    
    case 'help':
      return `${topicReference}I'm here to assist you with a wide range of tasks and questions. I can help with weather updates, setting reminders, answering questions, providing recommendations, managing your calendar, checking emails, or just having a conversation. What specifically would you like help with today?`;
    
    case 'learning_preference':
      return "Thank you for sharing that preference with me. I'll remember it for future interactions to provide you with more personalized assistance.";
    
    case 'joke':
      const premiumJokes = [
        "Why did the AI assistant go to art school? To learn how to draw better conclusions!",
        "What do you call an AI that sings? Artificial Harmonies!",
        "Why don't scientists trust atoms? Because they make up everything!",
        "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
        "Why did the computer go to therapy? It had too many bytes of emotional baggage!",
        "How does a penguin build its house? Igloos it together!"
      ];
      return `${personalizedPrefix}${premiumJokes[Math.floor(Math.random() * premiumJokes.length)]}`;
    
    case 'farewell':
      const farewellResponses = [
        "Goodbye! It was a pleasure assisting you. Feel free to return whenever you need help!",
        "Until next time! If you have any more questions later, I'll be here to help.",
        "Take care! Looking forward to our next conversation.",
        "Farewell! Don't hesitate to reach out again if you need assistance."
      ];
      return farewellResponses[Math.floor(Math.random() * farewellResponses.length)];
    
    case 'gratitude':
      const gratitudeResponses = [
        "You're very welcome! It's my pleasure to assist you.",
        "Happy to help! Is there anything else you'd like to know?",
        "Glad I could be of assistance! Don't hesitate to ask if you need anything else.",
        "My pleasure! I'm here whenever you need help."
      ];
      return `${gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)]}`;
      
    default:
      return `${personalizedPrefix}${topicReference}${modelInfo}${getEnhancedResponse()}`;
  }
};
