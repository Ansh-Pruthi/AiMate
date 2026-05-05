import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type IMessage } from '../../types';

interface MessageBubbleProps {
  message: IMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          sm:max-w-[75%]
          ${isUser
            ? 'bg-[#2f2f2f] text-white rounded-br-sm'
            : 'text-gray-100 rounded-bl-sm'
          }
        `}
      >
        {isUser ? (
          // User messages: plain text, preserve line breaks
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          // AI messages: full markdown rendering
          <div className="prose prose-invert prose-sm max-w-none
            prose-p:leading-relaxed prose-p:mb-3 prose-p:last:mb-0
            prose-headings:text-white prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
            prose-strong:text-white prose-strong:font-semibold
            prose-code:text-emerald-400 prose-code:bg-[#1a1a1a] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
            prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-[#3f3f3f] prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto
            prose-ul:my-2 prose-ul:space-y-1
            prose-ol:my-2 prose-ol:space-y-1
            prose-li:text-gray-200
            prose-blockquote:border-l-2 prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:text-gray-400
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-hr:border-[#3f3f3f]
            prose-table:text-sm
            prose-th:text-white prose-th:font-semibold
            prose-td:text-gray-300
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};