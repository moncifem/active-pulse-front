'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from '../components/Navbar';

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

export default function CalendarPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const isCalendarConnected = user?.externalAccounts.some(
    account => account.provider === 'google'
  );

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 7);
      endDate.setHours(23, 59, 59, 999);

      const response = await fetch(
        `/api/calendar/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        {
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/configuration');
          return;
        }
        if (response.status === 503) {
          setError("Calendar API is not enabled. Please try again in a few minutes.");
          return;
        }
        throw new Error(data.error || 'Failed to fetch events');
      }

      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, router]);

  // Handle initial auth check
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setIsLoading(false);
  }, [isLoaded, isSignedIn, router]);

  // Handle calendar data fetching
  useEffect(() => {
    if (isLoaded && isSignedIn && isCalendarConnected) {
      fetchEvents();
    }
  }, [isLoaded, isSignedIn, isCalendarConnected, fetchEvents]); // Include all dependencies

  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!isCalendarConnected) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <main className="pt-16 px-4">
          <div className="max-w-4xl mx-auto mt-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Connect Your Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please connect your Google Calendar to view your events.
            </p>
            <button
              onClick={() => router.push('/configuration')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Go to Settings
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <main className="pt-16 px-4">
          <div className="max-w-4xl mx-auto mt-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Error Loading Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => fetchEvents()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 px-4">
        <div className="max-w-6xl mx-auto mt-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Calendar
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 7);
                  setSelectedDate(newDate);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Previous Week
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 7);
                  setSelectedDate(newDate);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Next Week
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
              {[...Array(7)].map((_, index) => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + index);
                return (
                  <div
                    key={date.toISOString()}
                    className="bg-white dark:bg-gray-800 p-4"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {getDayName(date)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {date.toLocaleDateString()}
                    </p>
                    <div className="mt-2 space-y-2">
                      {events
                        .filter(event => {
                          const eventDate = new Date(event.start.dateTime);
                          return (
                            eventDate.toDateString() === date.toDateString()
                          );
                        })
                        .map(event => (
                          <div
                            key={event.id}
                            className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.summary}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(event.start.dateTime)} -{' '}
                              {formatTime(event.end.dateTime)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 