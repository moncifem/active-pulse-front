'use client';

import { SignIn } from "@clerk/nextjs";
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white border-b border-gray-200 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <a href="/" className="flex items-center space-x-2">
            <svg 
              className="w-8 h-8 text-blue-600" 
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
            <span className="text-xl font-bold text-gray-800">AI Chat</span>
          </a>
        </div>
      </nav>
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
              card: "shadow-md rounded-xl border-gray-200",
              headerTitle: "text-gray-900 font-bold",
              headerSubtitle: "text-gray-500",
              socialButtonsBlockButton: 
                "border-gray-200 hover:bg-gray-50 text-gray-600",
              socialButtonsBlockButtonText: "text-gray-600 font-medium",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500",
              formFieldLabel: "text-gray-700",
              formFieldInput: 
                "border-gray-200 focus:border-blue-500 focus:ring-blue-500",
              footerActionLink: "text-blue-600 hover:text-blue-700",
              identityPreviewText: "text-gray-600",
              identityPreviewEditButton: 
                "text-blue-600 hover:text-blue-700",
            },
            layout: {
              socialButtonsPlacement: "top",
              showOptionalFields: false,
            },
          }}
        />
      </div>
    </div>
  );
} 