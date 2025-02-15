'use client';

import { useState, useEffect, useRef } from 'react';
import { startTranscription, stopTranscription, TranscriptionResult } from '../utils/speechRecognition';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

export default function VoiceInput({ onTranscription, isListening, setIsListening }: VoiceInputProps) {
  const [error, setError] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const finalTextRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, []);

  const handleTranscriptionResult = (result: TranscriptionResult) => {
    if (result.isFinal) {
      setInterimText('');
      if (result.text.trim()) {
        finalTextRef.current += ' ' + result.text.trim();
      }
    } else {
      setInterimText(result.text);
    }
  };

  const startRecording = async () => {
    try {
      isProcessingRef.current = false;
      finalTextRef.current = ''; // Reset the final text
      setIsListening(true);
      setError('');
      setInterimText('');
      await startTranscription(handleTranscriptionResult);
    } catch (err) {
      console.error('Speech recognition error:', err);
      setError('Could not access microphone or speech recognition');
      setIsListening(false);
    }
  };

  const stopRecording = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      stopTranscription();
      setIsListening(false);
      setInterimText('');
      
      // Small delay to ensure all final results are captured
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Send the accumulated final text to the model
      const finalText = finalTextRef.current.trim();
      if (finalText) {
        console.log('Sending transcribed text:', finalText); // Debug log
        onTranscription(finalText);
        finalTextRef.current = ''; // Reset after sending
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('Error processing speech');
    } finally {
      isProcessingRef.current = false;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={isListening ? stopRecording : startRecording}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isListening 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
      {interimText && (
        <div className="absolute bottom-full left-0 mb-2 text-sm text-gray-600 whitespace-nowrap bg-gray-50 px-3 py-2 rounded-lg shadow-sm border border-gray-200 max-w-xs overflow-hidden">
          {interimText}
        </div>
      )}
      {error && (
        <div className="absolute bottom-full left-0 mb-2 text-sm text-red-500 whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
} 