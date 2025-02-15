export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <svg 
                className="w-7 h-7 md:w-8 md:h-8 text-blue-600" 
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
              <span className="text-lg md:text-xl font-bold text-gray-800">AI Chat</span>
            </a>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <a 
              href="/" 
              className="text-gray-600 hover:text-gray-800 px-2 md:px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </a>
            <a 
              href="/chat" 
              className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Open Chat
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
} 