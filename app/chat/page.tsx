'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatWindow from '../components/ChatWindow';
import ConversationList from '../components/ConversationList';
import { Conversation, Message } from '../types/chat';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/storage';
import Navbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  useEffect(() => {
    const savedConversations = getFromLocalStorage();
    setConversations(savedConversations);
    if (savedConversations.length > 0) {
      setActiveConversation(savedConversations[0].id);
    }
  }, []);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: `New Chat ${conversations.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations([...conversations, newConversation]);
    setActiveConversation(newConversation.id);
    saveToLocalStorage([...conversations, newConversation]);
  };

  const deleteConversation = (id: string) => {
    const newConversations = conversations.filter((conv) => conv.id !== id);
    setConversations(newConversations);
    if (activeConversation === id) {
      setActiveConversation(newConversations[0]?.id || null);
    }
    saveToLocalStorage(newConversations);
  };

  const sendMessage = async (content: string) => {
    if (!activeConversation) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    // Create a temporary assistant message for streaming
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    // Create a new reference to the updated conversations
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage, assistantMessage],
        };
      }
      return conv;
    });

    setConversations(updatedConversations);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: updatedConversations.find(
            (conv) => conv.id === activeConversation
          )?.messages.slice(0, -1) || [],
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        streamedContent += text;

        const streamedConversations = updatedConversations.map((conv) => {
          if (conv.id === activeConversation) {
            const messages = [...conv.messages];
            messages[messages.length - 1] = {
              ...assistantMessage,
              content: streamedContent,
            };
            return {
              ...conv,
              messages,
            };
          }
          return conv;
        });

        setConversations(streamedConversations);
      }

      saveToLocalStorage(updatedConversations.map((conv) => {
        if (conv.id === activeConversation) {
          const messages = [...conv.messages];
          messages[messages.length - 1] = {
            ...assistantMessage,
            content: streamedContent,
          };
          return {
            ...conv,
            messages,
          };
        }
        return conv;
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      const errorConversations = updatedConversations.map((conv) => {
        if (conv.id === activeConversation) {
          return {
            ...conv,
            messages: [...conv.messages.slice(0, -1)],
          };
        }
        return conv;
      });
      setConversations(errorConversations);
      saveToLocalStorage(errorConversations);
    }
  };

  const activeChat = conversations.find((conv) => conv.id === activeConversation);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Navbar />
      <main className="flex-1 flex overflow-hidden pt-16">
        <aside className={`
          w-full md:w-[300px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col
          fixed md:relative left-0 top-16 bottom-0 z-20
          transform transition-transform duration-200 ease-in-out
          ${activeConversation ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        `}>
          <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
            <button
              onClick={createNewConversation}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center space-x-2 group"
            >
              <svg 
                className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>New Chat</span>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              onSelect={(id) => {
                setActiveConversation(id);
                if (window.innerWidth < 768) {
                  document.body.classList.remove('sidebar-open');
                }
              }}
              onDelete={deleteConversation}
            />
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
          <div className="md:hidden absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
            <button
              onClick={() => setActiveConversation(null)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {activeChat ? (
            <>
              <header className="hidden md:block border-b border-gray-200 px-6 py-4 bg-white flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">
                  {activeChat.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(activeChat.createdAt).toLocaleDateString()} · {activeChat.messages.length} messages
                </p>
              </header>
              <div className="flex-1 overflow-hidden pt-14 md:pt-0">
                <ChatWindow
                  messages={activeChat.messages}
                  onSendMessage={sendMessage}
                />
              </div>
            </>
          ) : (
            <EmptyState onCreateNew={createNewConversation} />
          )}
        </div>
      </main>
    </div>
  );
} 