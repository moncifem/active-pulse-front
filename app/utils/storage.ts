import { Conversation } from '../types/chat';

export const saveToLocalStorage = (conversations: Conversation[]) => {
  localStorage.setItem('chat-conversations', JSON.stringify(conversations));
};

export const getFromLocalStorage = (): Conversation[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('chat-conversations');
  return data ? JSON.parse(data) : [];
}; 