// src/components/chat/ChatInput.tsx
import { useState, useRef, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, isStreaming, disabled }: ChatInputProps) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Send on Enter, new line on Shift+Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow textarea up to 200px
  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <div className="border-t border-[#2f2f2f] bg-[#212121] px-4 py-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-end gap-3 rounded-2xl border border-[#3f3f3f] bg-[#2f2f2f] px-4 py-3 focus-within:border-gray-500 transition-colors">

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Message AI..."
            disabled={disabled ?? isStreaming}
            rows={1}
            className="
              flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500
              focus:outline-none disabled:opacity-50
              max-h-[200px] leading-relaxed
            "
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!value.trim() || isStreaming}
            className="
              mb-0.5 shrink-0 rounded-lg p-1.5
              text-gray-400 transition-colors
              hover:text-white disabled:opacity-30 disabled:cursor-not-allowed
              enabled:hover:bg-[#3f3f3f]
            "
          >
            {isStreaming ? (
              // Stop / loading indicator
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-500 border-t-gray-200" />
            ) : (
              // Send arrow
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>

        {/* Hint text */}
        <p className="mt-2 text-center text-xs text-gray-600">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};