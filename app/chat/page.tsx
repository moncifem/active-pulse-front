'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatWindow from '../components/ChatWindow';
import ConversationList from '../components/ConversationList';
import { Conversation, Message } from '../types/chat';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/storage';
import Navbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else {
        setIsLoading(false);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      const savedConversations = getFromLocalStorage();
      setConversations(savedConversations);
      if (savedConversations.length > 0) {
        setActiveConversation(savedConversations[0].id);
      }
    }
  }, [isSignedIn]);

  if (!isLoaded || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

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

  const sendMessage = async (content: string, fromVoice = false) => {
    if (!activeConversation) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      fromVoice,
    };

    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      fromVoice,
      isComplete: false,
      requiresAudio: fromVoice
    };

    // Create a new reference for the updated conversations
    const newConversations = conversations.map((conv) => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage, assistantMessage],
        };
      }
      return conv;
    });

    // Update state immediately with the new conversations
    setConversations(newConversations);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: newConversations.find(
            (conv) => conv.id === activeConversation
          )?.messages.slice(0, -1) || [],
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Failed to send message: ${errorDetails.error}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let streamedContent = '';
      let lastUpdate = Date.now();
      const updateInterval = 50; // Update UI every 50ms

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Immediately mark as complete when stream ends
          const finalConversations = newConversations.map((conv) => {
            if (conv.id === activeConversation) {
              const messages = [...conv.messages];
              messages[messages.length - 1] = {
                ...assistantMessage,
                content: streamedContent,
                isComplete: true,
                timestamp: new Date().toISOString(),
              };
              return { ...conv, messages };
            }
            return conv;
          });
          setConversations(finalConversations);
          saveToLocalStorage(finalConversations);
          break;
        }

        const text = new TextDecoder().decode(value);
        streamedContent += text;

        // Throttle UI updates to prevent excessive renders
        if (Date.now() - lastUpdate > updateInterval) {
          const streamedConversations = newConversations.map((conv) => {
            if (conv.id === activeConversation) {
              const messages = [...conv.messages];
              messages[messages.length - 1] = {
                ...assistantMessage,
                content: streamedContent,
              };
              return { ...conv, messages };
            }
            return conv;
          });
          setConversations(streamedConversations);
          lastUpdate = Date.now();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorConversations = newConversations.map((conv) => {
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
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 flex overflow-hidden pt-16">
        <aside className={`
          w-full md:w-[300px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col
          fixed md:relative left-0 top-16 bottom-0 z-20
          transform transition-transform duration-200 ease-in-out
          ${activeConversation ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        `}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
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

        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900 relative">
          <div className="md:hidden absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setActiveConversation(null)}
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
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
              <header className="hidden md:block border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-900 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {activeChat.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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