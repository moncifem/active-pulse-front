export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  fromVoice?: boolean;
  isComplete?: boolean;
  requiresAudio?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
} 