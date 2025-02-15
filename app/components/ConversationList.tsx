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
    <div className="h-full overflow-y-auto bg-white">
      {conversations.length === 0 ? (
        <div className="text-center p-4 text-gray-500 text-sm">
          No conversations yet
        </div>
      ) : (
        <div className="space-y-[1px]">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`hover:bg-gray-50 transition-all duration-200 ${
                activeConversation === conv.id ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <div 
                className="group px-4 py-3 cursor-pointer flex items-center justify-between"
                onClick={() => onSelect(conv.id)}
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                    <svg 
                      className="w-4 h-4 text-blue-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm truncate ${
                      activeConversation === conv.id 
                        ? 'text-blue-600' 
                        : 'text-gray-900'
                    }`}>
                      {conv.title}
                    </h3>
                    {conv.messages.length > 0 && (
                      <p className="text-xs text-gray-500 truncate mt-0.5 leading-tight">
                        {conv.messages[conv.messages.length - 1].content}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conv.createdAt).toLocaleDateString()} · {conv.messages.length} messages
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="ml-2 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <svg 
                    className="w-5 h-5" 
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 