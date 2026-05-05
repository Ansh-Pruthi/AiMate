import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StreamingBubbleProps {
  content: string;
}

export const StreamingBubble = ({ content }: StreamingBubbleProps) => {
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed text-gray-100 sm:max-w-[75%]">
        {content ? (
          <div className="prose prose-invert prose-sm max-w-none
            prose-p:leading-relaxed prose-p:mb-3 prose-p:last:mb-0
            prose-headings:text-white prose-headings:font-semibold
            prose-strong:text-white
            prose-code:text-emerald-400 prose-code:bg-[#1a1a1a] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
            prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-[#3f3f3f] prose-pre:rounded-xl prose-pre:p-4
            prose-ul:my-2 prose-ol:my-2
            prose-li:text-gray-200
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          // Thinking dots when stream hasn't started yet
          <div className="flex items-center gap-1 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </div>
  );
};