// src/pages/ChatPage.tsx
import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { type IConversation } from '../types';

export const ChatPage = () => {
  const [conversations] = useState<IConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#212121] text-white overflow-hidden">

      {/* Sidebar — receives open state + close handler */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={() => setActiveConversationId(null)}
        isLoadingConversations={false}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* ── Main chat area ───────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-hidden">

        {/* ── Mobile top bar ──────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-[#2f2f2f] px-4 py-3 md:hidden">
          {/* Hamburger button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#2f2f2f] hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-300">
            {activeConversationId ? 'Chat' : 'New Chat'}
          </span>
        </div>

        {/* ── Chat content ────────────────────────────────────── */}
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              What can I help with?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Select a conversation or start a new one
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};