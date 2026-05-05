// src/pages/ChatPage.tsx
import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { useChat } from '../hooks/useChat';

export const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isStreaming,
    streamingContent,
    error,
    loadConversations,
    selectConversation,
    startNewConversation,
    sendMessage,
    deleteConversation,
  } = useChat();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="flex h-screen bg-[#212121] text-white overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={startNewConversation}
        onDeleteConversation={deleteConversation}
        isLoadingConversations={isLoadingConversations}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main area */}
      <main className="flex flex-1 flex-col overflow-hidden">

        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-[#2f2f2f] px-4 py-3 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#2f2f2f] hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-300">
            {activeConversationId
              ? conversations.find((c) => c.id === activeConversationId)?.title ?? 'Chat'
              : 'New Chat'}
          </span>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Messages or empty state */}
        {activeConversationId || messages.length > 0 || isStreaming ? (
          <MessageList
            messages={messages}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
            isLoadingMessages={isLoadingMessages}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              What can I help with?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Type a message below to start
            </p>
          </div>
        )}

        {/* Chat input */}
        <ChatInput
          onSend={sendMessage}
          isStreaming={isStreaming}
        />
      </main>
    </div>
  );
};