// src/components/layout/Sidebar.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { type IConversation } from '../../types';

interface SidebarProps {
  conversations: IConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isLoadingConversations: boolean;
  isOpen: boolean;           // controlled by ChatPage
  onClose: () => void;       // controlled by ChatPage
}

export const Sidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  isLoadingConversations,
  isOpen,
  onClose,
}: SidebarProps) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    onClose(); // auto-close sidebar on mobile after selecting
  };

  const handleNewConversation = () => {
    onNewConversation();
    onClose(); // auto-close sidebar on mobile
  };

  return (
    <>
      {/* ── Mobile backdrop overlay ───────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar panel ─────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex h-full w-72 flex-shrink-0 flex-col bg-[#171717]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:w-64 md:translate-x-0 md:transition-none
        `}
      >
        {/* ── Header: New Chat + Close (mobile) ─────────────── */}
        <div className="flex items-center gap-2 p-3">
          <Button
            variant="ghost"
            fullWidth
            onClick={handleNewConversation}
            className="justify-start gap-3 text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </Button>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-2 text-gray-500 hover:bg-[#2f2f2f] hover:text-gray-300 md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Conversation List ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-2">
          {isLoadingConversations ? (
            <div className="flex justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-gray-300" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-gray-600">
              No conversations yet
            </p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <button
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`
                      w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150
                      ${activeConversationId === conv.id
                        ? 'bg-[#2f2f2f] text-white'
                        : 'text-gray-400 hover:bg-[#2f2f2f] hover:text-gray-200'
                      }
                    `}
                  >
                    <p className="truncate">{conv.title}</p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {conv.messageCount} message{conv.messageCount !== 1 ? 's' : ''}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── User Footer ───────────────────────────────────── */}
        <div className="border-t border-[#2f2f2f] p-3">
          <div className="mb-2 flex items-center gap-3 px-2 py-1">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-600 text-xs font-medium text-white">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-sm text-gray-300">{user?.name}</span>
          </div>
          <Button
            variant="danger"
            fullWidth
            isLoading={isLoggingOut}
            onClick={handleLogout}
            className="justify-start text-xs"
          >
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
};