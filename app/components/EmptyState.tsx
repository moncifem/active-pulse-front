interface EmptyStateProps {
  onCreateNew: () => void;
}

export default function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No conversation selected
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Start a new conversation or select an existing one from the sidebar.
        </p>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Start New Chat
        </button>
      </div>
    </div>
  );
} 