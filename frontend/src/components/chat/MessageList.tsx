import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { StreamingBubble } from './StreamingBubble';
import { Spinner } from '../ui/Spinner';
import type { IMessage } from '../../types';

interface MessageListProps {
  messages: IMessage[];
  streamingContent: string;
  isStreaming: boolean;
  isLoadingMessages: boolean;
}

export const MessageList = ({
  messages,
  streamingContent,
  isStreaming,
  isLoadingMessages,
}: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or streaming chunks
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  if (isLoadingMessages) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Live streaming bubble */}
        {isStreaming && (
          <StreamingBubble content={streamingContent} />
        )}

        {/* Invisible div to scroll to */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};