'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types/chat';
import VoiceInput from './VoiceInput';
import { synthesizeSpeech, preloadAudio } from '../utils/textToSpeech';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string, fromVoice?: boolean) => void;
}

interface AudioState {
  isPlaying: string | null;
  isGenerating: string | null;
}

// Add a new icon component for the loading state
const LoadingWaveform = () => (
  <div className="flex items-center space-x-0.5 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div 
        key={i} 
        className="w-0.5 h-3 bg-blue-600 dark:bg-blue-400 rounded-full" 
        style={{
          animation: `waveform 1s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </div>
);

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
  const audioQueue = useRef<{content: string, timestamp: string}[]>([]);
  const lastProcessedMessageId = useRef<string | null>(null);
  const pendingMessage = useRef<{content: string, timestamp: string, timeoutId?: number} | null>(null);
  const isFirstRender = useRef(true);
  const messageJustAdded = useRef(false);
  const lastVoiceMessageTimestamp = useRef<string | null>(null);
  const wasVoiceInput = useRef(false);
  const [isVoiceResponse, setIsVoiceResponse] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAudioEnd = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: null }));
    if (audioRef.current?.src) {
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current.src = '';
    }
  }, []);

  const playAudioResponse = useCallback(async (text: string, messageId: string) => {
    try {
      if (!text?.trim() || audioState.isPlaying || audioState.isGenerating) return;

      // Set generating state immediately
      setAudioState(prev => ({ ...prev, isGenerating: messageId }));

      // Stop any current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = '';
        }
      }

      const audioBlob = await synthesizeSpeech(text, messageId);
      
      if (!audioBlob) {
        throw new Error('Failed to generate audio');
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Update state to playing
      setAudioState(prev => ({
        isGenerating: null,
        isPlaying: messageId
      }));

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioState(prev => ({
        isGenerating: null,
        isPlaying: null
      }));
    }
  }, [audioState.isGenerating, audioRef]);

  const processAudioQueue = useCallback(async () => {
    if (audioQueue.current.length === 0 || audioState.isGenerating) return;
    
    const { content, timestamp } = audioQueue.current[0];
    
    try {
      await playAudioResponse(content, timestamp);
      audioQueue.current.shift();
      lastProcessedMessageId.current = timestamp;
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [audioState.isGenerating, playAudioResponse]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    scrollToBottom();
    
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || 
        lastMessage.role !== 'assistant' || 
        lastProcessedMessageId.current === lastMessage.timestamp ||
        !messageJustAdded.current ||
        !lastMessage.requiresAudio
    ) {
      return;
    }

    // If message is complete, process immediately
    if (lastMessage.isComplete) {
      lastProcessedMessageId.current = lastMessage.timestamp;
      playAudioResponse(lastMessage.content, lastMessage.timestamp);
      messageJustAdded.current = false;
      return;
    }
  }, [messages, messageJustAdded, playAudioResponse]);

  useEffect(() => {
    if (!isFirstRender.current) {
      messageJustAdded.current = true;
    }
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isListening) {  // Prevent sending while listening
      onSendMessage(input.trim(), false); // Explicitly mark as not voice input
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
      onSendMessage(text.trim(), true);  // Mark as voice input
      setInput('');
      setInterimTranscript('');
    }
  };

  const handleInterimTranscript = (text: string) => {
    setInterimTranscript(text);
  };

  // Add cleanup
  useEffect(() => {
    return () => {
      setIsVoiceResponse(false);
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = '';
        }
      }
      audioQueue.current = [];
      lastProcessedMessageId.current = null;
      messageJustAdded.current = false;
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnd}
        onError={handleAudioEnd}
        className="hidden"
      />
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } group`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 md:mr-3 mt-1 flex-shrink-0">
                <svg 
                  className="w-5 h-5 text-blue-600 dark:text-blue-400" 
                  fill="none"
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 md:px-5 py-3 md:py-3.5 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              } shadow-sm hover:shadow-md transition-shadow duration-200`