import { Conversation } from '../types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ConversationList({
  conversations,
  activeConversation,
  onSelect,
  onDelete,
}: ConversationListProps) {
  return (
    <div className="h-full overflow-y-auto py-4 bg-white dark:bg-gray-900">
      <div className="space-y-2 px-3">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeConversation === conversation.id
                ? 'bg-gray-100 dark:bg-gray-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => onSelect(conversation.id)}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-gray-400 dark:text-gray-500"
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
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {conversation.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(conversation.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.id);
              }}
              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 