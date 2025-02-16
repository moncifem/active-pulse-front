'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types/chat';
import VoiceInput from './VoiceInput';
import { synthesizeSpeech } from '../utils/textToSpeech';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string, fromVoice?: boolean) => void;
}

interface AudioState {
  isPlaying: string | null;
  isGenerating: string | null;
}

export default function ChatWindow({ messages, onSendMessage }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: null,
    isGenerating: null
  });

  const handleAudioEnd = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: null }));
    if (audioRef.current?.src) {
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current.src = '';
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isListening) {
      onSendMessage(input.trim(), false);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleVoiceInput = (text: string) => {
    if (text.trim()) {
      onSendMessage(text.trim(), true);
      setInput('');
      setInterimTranscript('');
    }
  };

  const handleInterimTranscript = (text: string) => {
    setInterimTranscript(text);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnd}
        onError={handleAudioEnd}
        className="hidden"
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-2 border rounded"
              placeholder={isListening ? 'Listening...' : 'Type your message...'}
              disabled={isListening}
            />
            <VoiceInput
              onTranscription={handleVoiceInput}
              onInterimTranscript={handleInterimTranscript}
              isListening={isListening}
              setIsListening={setIsListening}
              disabled={input.trim().length > 0}
            />
            <button
              type="submit"
              disabled={(!input.trim() && !interimTranscript) || isListening}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}