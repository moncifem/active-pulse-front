export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
} 