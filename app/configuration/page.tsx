'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from '../components/Navbar';

export default function ConfigurationPage() {
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    checkCalendarStatus();
  }, [isLoaded, isSignedIn, router]);

  const checkCalendarStatus = async () => {
    try {
      const res = await fetch('/api/calendar/status');
      if (res.ok) {
        const data = await res.json();
        setIsCalendarConnected(data.connected);
      }
    } catch (error) {
      console.error('Failed to check calendar status:', error);
      setError('Failed to check calendar connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      if (isCalendarConnected) {
        const res = await fetch('/api/callback/disconnect', {
          method: 'POST',
        });
        
        if (!res.ok) {
          throw new Error('Failed to disconnect');
        }
        
        setIsCalendarConnected(false);
      } else {
        const res = await fetch('/api/calendar/auth-url');
        if (!res.ok) {
          throw new Error('Failed to start OAuth flow');
        }
        
        const data = await res.json();
        if (!data.url) {
          throw new Error('No authorization URL received');
        }
        
        setIsLoading(true);
        window.location.href = data.url;
        return;
      }
    } catch (error) {
      console.error('Calendar connection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 px-4">
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Configuration
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Calendar Integration
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 dark:text-gray-300">Google Calendar</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isCalendarConnected 
                      ? 'Your calendar is connected' 
                      : 'Connect your Google Calendar to view and manage events'}
                  </p>
                  {error && (
                    <p className="text-sm text-red-500 mt-1">
                      {error}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleGoogleConnect}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {isCalendarConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}