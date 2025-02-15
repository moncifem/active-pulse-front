'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '../types/chat';
import VoiceInput from './VoiceInput';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export default function ChatWindow({ messages, onSendMessage }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleVoiceInput = (text: string) => {
    if (text.trim()) {
      onSendMessage(text.trim());
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } group`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 md:mr-3 mt-1 flex-shrink-0">
                <svg 
                  className="w-5 h-5 text-blue-600" 
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
                  ? 'bg-blue-600 text-white ml-2 md:ml-4'
                  : 'bg-gray-100 text-gray-800'
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
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t bg-white p-3 md:p-4 shadow-lg flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex-1 flex items-center space-x-2 md:space-x-4 bg-gray-50 rounded-xl border border-gray-200 pr-2 md:pr-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-transparent focus:outline-none text-gray-700 text-sm md:text-base"
                placeholder="Type your message..."
                disabled={isListening}
              />
              <VoiceInput
                onTranscription={handleVoiceInput}
                isListening={isListening}
                setIsListening={setIsListening}
              />
            </div>
            <button
              type="submit"
              disabled={isListening}
              className={`bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center space-x-2 ${
                isListening ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              <span className="hidden md:inline">Send</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" 
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
        </form>
      </div>
    </div>
  );
} 