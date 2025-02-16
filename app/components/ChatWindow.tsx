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

  const playAudioResponse = async (text: string, messageId: string) => {
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
  };

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
  }, [messages, messageJustAdded]);

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
              } shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                {message.content}
              </p>
              <span className={`text-xs mt-2 block opacity-70 ${
                message.role === 'user' 
                  ? 'text-blue-100' 
                  : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ml-2 md:ml-3 mt-1 flex-shrink-0">
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            {message.role === 'assistant' && (
              <div className="flex items-center">
                <button
                  onClick={() => playAudioResponse(message.content, message.timestamp)}
                  disabled={audioState.isPlaying === message.timestamp || audioState.isGenerating === message.timestamp}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                >
                  {audioState.isGenerating === message.timestamp ? (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <LoadingWaveform />
                    </div>
                  ) : audioState.isPlaying === message.timestamp ? (
                    <svg
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.25 8.25h2.5m9.5 0h2.5m-16 4h2.5m9.5 0h2.5m-16 4h2.5m9.5 0h2.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex flex-col space-y-2">
            {/* Show interim transcript */}
            {isListening && interimTranscript && (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic px-3">
                {interimTranscript}
              </div>
            )}
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex-1 flex items-center space-x-2 md:space-x-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 pr-2 md:pr-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-transparent focus:outline-none text-gray-700 dark:text-gray-200 text-sm md:text-base rounded-xl"
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
              </div>
              <button
                type="submit"
                disabled={(!input.trim() && !interimTranscript) || isListening}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                  (!input.trim() && !interimTranscript) || isListening
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-700'
                }`}
              >
                <span>Send</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 