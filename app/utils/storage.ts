import { Conversation } from '../types/chat';

const STORAGE_KEY = 'conversations';

export function saveToLocalStorage(conversations: Conversation[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }
}

export function getFromLocalStorage(): Conversation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const conversations = JSON.parse(saved);
    
    // Clear fromVoice flags when loading from storage
    return conversations.map((conv: Conversation) => ({
      ...conv,
      messages: conv.messages.map(msg => ({
        ...msg,
        fromVoice: false // Reset the voice flag on page load
      }))
    }));
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
} 