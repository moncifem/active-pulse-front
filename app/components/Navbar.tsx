'use client';

import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center space-x-2">
              <svg 
                className="w-7 h-7 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">AI Chat</span>
            </Link>

            {isSignedIn && (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/chat"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/chat')
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Chat
                </Link>
                <Link
                  href="/calendar"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/calendar')
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Calendar
                </Link>
                <Link
                  href="/configuration"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/configuration')
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Settings
                </Link>
                <Link
                  href="/motivation"
                  className="ml-8 inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Motivation
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 px-2 md:px-3 py-2 rounded-md text-sm font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu for signed-in users */}
      {isSignedIn && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-2 py-3 space-y-1">
            <Link
              href="/chat"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/chat')
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Chat
            </Link>
            <Link
              href="/calendar"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/calendar')
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Calendar
            </Link>
            <Link
              href="/configuration"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/configuration')
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Settings
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 