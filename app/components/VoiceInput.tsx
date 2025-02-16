'use client';

import { useState, useEffect, useRef } from 'react';
import { startTranscription, stopTranscription } from '../utils/speechRecognition';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  disabled?: boolean;
  onInterimTranscript?: (text: string) => void;
}

export default function VoiceInput({ 
  onTranscription, 
  isListening, 
  setIsListening,
  disabled,
  onInterimTranscript 
}: VoiceInputProps) {
  const [error, setError] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSpokenRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopTranscription();
      setIsListening(false);
    };
  }, [setIsListening]);

  const startRecording = async () => {
    if (disabled) return;
    
    try {
      setError('');
      hasSpokenRef.current = false;
      setIsListening(true);

      timeoutRef.current = setTimeout(() => {
        if (!hasSpokenRef.current) {
          stopRecording();
          setError('No speech detected. Please try again.');
        }
      }, 5000);

      await startTranscription((result) => {
        hasSpokenRef.current = true;
        // Show interim results
        if (onInterimTranscript && !result.isFinal) {
          onInterimTranscript(result.text);
        }
        // Handle final results
        if (result.isFinal && result.text.trim()) {
          onTranscription(result.text.trim());
          stopRecording();
        }
      });
    } catch (err) {
      console.error('Speech recognition error:', err);
      setError('Could not access microphone. Please check permissions.');
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    stopTranscription();
    setIsListening(false);
  };

  return (
    <div className="relative">
      <button
        type="button" // Prevent form submission
        onClick={isListening ? stopRecording : startRecording}
        disabled={disabled}
        className={`p-2 rounded-full transition-colors dark:hover:bg-gray-700 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed'
            : isListening 
              ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100'
        }`}
        title={isListening ? 'Stop recording' : 'Start recording'}
      >
        <svg 
          className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d={isListening 
              ? "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            }
          />
        </svg>
      </button>
      {error && (
        <div className="absolute bottom-full left-0 mb-2 text-sm text-red-500 whitespace-nowrap bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-red-100 dark:border-red-900">
          {error}
        </div>
      )}
    </div>
  );
} 