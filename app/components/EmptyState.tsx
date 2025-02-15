interface EmptyStateProps {
  onCreateNew: () => void;
}

export default function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
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
        </div>
        <h3 className="text-xl font-semibold text-gray-800">
          Start a New Conversation
        </h3>
        <p className="text-gray-500">
          Create a new chat to start talking with our AI assistant. Your conversations will be saved automatically.
        </p>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <span>Create New Chat</span>
        </button>
      </div>
    </div>
  );
} 