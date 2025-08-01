interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotResponse {
  message: string;
  suggestions?: string[];
}

class ChatbotService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = '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';
    this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  }

  async sendMessage(message: string): Promise<ChatbotResponse> {
    const models = ['openai/gpt-4o-mini', 'openai/gpt-3.5-turbo', 'anthropic/claude-3-haiku'];
    
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        console.log('Sending message to OpenRouter:', message);
        
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://nepaldisastermanagement.com',
            'X-Title': 'Nepal Disaster Management',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: `You are a helpful disaster management assistant for Nepal. You provide information about:
                - Natural disasters (earthquakes, floods, landslides, fires)
                - Emergency procedures and safety tips
                - Disaster preparedness and response
                - Emergency contact information
                - Weather-related safety advice
                - First aid and medical emergency guidance
                
                Keep responses concise, informative, and focused on disaster management. If asked about non-disaster topics, politely redirect to disaster-related assistance.`
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error Response for ${model}:`, errorText);
          continue; // Try next model
        }

        const data = await response.json();
        console.log('API Response data:', JSON.stringify(data, null, 2));
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const aiResponse = data.choices[0].message.content;
          
          // Generate relevant suggestions based on the user's message
          const suggestions = this.generateSuggestions(message);
          
          return {
            message: aiResponse,
            suggestions
          };
        } else {
          console.error('Invalid response format:', data);
          continue; // Try next model
        }
      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        continue; // Try next model
      }
    }
    
    // If all models fail, use fallback
    console.log('All models failed, using fallback response');
    const fallbackResponse = this.getFallbackResponse(message);
    if (fallbackResponse) {
      return {
        message: fallbackResponse,
        suggestions: this.generateSuggestions(message)
      };
    }
    
    throw new Error('All AI models failed and no fallback response available');
  }

  private generateSuggestions(userMessage: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    
    // Common disaster-related queries and their suggestions
    const suggestionMap = {
      'earthquake': [
        'What should I do during an earthquake?',
        'How to prepare for earthquakes?',
        'Earthquake safety tips'
      ],
      'flood': [
        'Flood safety guidelines',
        'What to do during a flood?',
        'Flood preparedness checklist'
      ],
      'landslide': [
        'Landslide warning signs',
        'Landslide safety measures',
        'What to do during a landslide?'
      ],
      'fire': [
        'Fire safety tips',
        'What to do in case of fire?',
        'Fire emergency procedures'
      ],
      'emergency': [
        'Emergency contact numbers',
        'First aid procedures',
        'Emergency evacuation plan'
      ],
      'weather': [
        'Weather safety tips',
        'Storm preparedness',
        'Weather emergency procedures'
      ],
      'help': [
        'Emergency contacts',
        'Disaster preparedness',
        'Safety guidelines'
      ]
    };

    // Find matching suggestions based on user message
    for (const [keyword, suggestions] of Object.entries(suggestionMap)) {
      if (lowerMessage.includes(keyword)) {
        return suggestions;
      }
    }

    // Default suggestions for general queries
    return [
      'Emergency contact numbers',
      'Disaster preparedness tips',
      'Safety guidelines',
      'First aid information'
    ];
  }

  private getFallbackResponse(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    // Fallback responses for common disaster queries
    if (lowerMessage.includes('earthquake')) {
      return "During an earthquake: 1) Drop, Cover, and Hold On under a sturdy table or desk. 2) Stay away from windows, mirrors, and heavy furniture. 3) If outdoors, move to an open area away from buildings, trees, and power lines. 4) After shaking stops, check for injuries and damage. 5) Follow emergency instructions and evacuate if necessary.";
    }
    
    if (lowerMessage.includes('flood')) {
      return "During a flood: 1) Move to higher ground immediately. 2) Avoid walking or driving through floodwaters. 3) Stay informed through local news and weather updates. 4) Prepare an emergency kit with food, water, and essential supplies. 5) Follow evacuation orders from local authorities.";
    }
    
    if (lowerMessage.includes('emergency') && lowerMessage.includes('contact')) {
      return "Emergency contacts in Nepal: Police: 100, Ambulance: 102, Fire: 101, Nepal Red Cross: 01-4270650, National Emergency Operations Center: 01-4211218. Save these numbers in your phone for quick access.";
    }
    
    if (lowerMessage.includes('first aid')) {
      return "Basic first aid: 1) Check for safety before approaching injured person. 2) Call emergency services (102) immediately for serious injuries. 3) Control bleeding with clean cloth and pressure. 4) Keep injured person warm and comfortable. 5) Don't move someone with potential spinal injury.";
    }
    
    if (lowerMessage.includes('prepare') || lowerMessage.includes('preparedness')) {
      return "Disaster preparedness: 1) Create an emergency kit with food, water, first aid, flashlight, and radio. 2) Make a family emergency plan with meeting points. 3) Learn evacuation routes from your area. 4) Keep important documents in a waterproof container. 5) Stay informed about local disaster risks.";
    }
    
    return null;
  }

  // Get predefined quick questions for the chatbot
  getQuickQuestions(): string[] {
    return [
      'What should I do during an earthquake?',
      'Emergency contact numbers',
      'First aid procedures'
    ];
  }
}

export default new ChatbotService();
export type { ChatbotResponse, ChatMessage };

