import Link from 'next/link';
import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 pb-16 px-4">
        <div className="max-w-4xl mx-auto mt-12 md:mt-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to AI Chat
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            Experience natural conversations with our AI assistant
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <a
              href="/chat"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Start Chatting
            </a>
            <a
              href="/about"
              className="inline-block px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
