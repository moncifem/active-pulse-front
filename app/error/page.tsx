'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';

const errorMessages = {
  oauth_error: "Google OAuth error occurred",
  auth_mismatch: "Authentication state mismatch",
  no_code: "No authorization code received",
  token_exchange: "Failed to exchange authorization code for tokens",
  default: "There was an error connecting to Google Calendar"
};

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const errorMessage = reason ? errorMessages[reason as keyof typeof errorMessages] : errorMessages.default;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 px-4">
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {errorMessage}. Please try again.
          </p>
          {reason && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Error code: {reason}
            </p>
          )}
          <Link
            href="/configuration"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Return to Settings
          </Link>
        </div>
      </main>
    </div>
  );
} 