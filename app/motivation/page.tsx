'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from '../components/Navbar';

export default function MotivationPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Handle auth check in useEffect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleGenerateMotivation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      const response = await fetch('/api/motivation/generate', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate motivation');
      }

      const data = await response.json();
      
      // Create audio blob for browser playback
      const audioBlob = new Blob(
        [Buffer.from(data.audio, 'base64')],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      setMessage(data.text);

      // Send to WhatsApp with audio
      const sendResponse = await fetch('/api/motivation/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: data.text,
          audio: data.audio
        }),
      });

      if (!sendResponse.ok) {
        throw new Error('Failed to send WhatsApp message');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Don't render anything if not signed in (will redirect)
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 px-4">
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Daily Motivation
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <button
              onClick={handleGenerateMotivation}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Get Daily Motivation'}
            </button>

            {error && (
              <p className="mt-4 text-red-500 text-sm">
                {error}
              </p>
            )}

            {message && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {message}
                </p>
              </div>
            )}

            {audioUrl && (
              <div className="mt-4">
                <audio controls className="w-full mt-2">
                  <source src={audioUrl} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 