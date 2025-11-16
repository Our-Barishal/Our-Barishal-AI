import React from 'react';
import { Message } from '../types';
import { UserIcon, SparklesIcon } from './icons';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-3">
      <div className="w-2 h-2 bg-gray-500 rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full typing-dot"></div>
    </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading }) => {
  const isUser = message.role === 'user';
  const text = message.parts.map(part => part.text).join('');

  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white rounded-br-none'
    : 'bg-gray-200 text-gray-800 rounded-bl-none';
  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  const Avatar = isUser ? UserIcon : SparklesIcon;
  const avatarClasses = isUser
    ? 'text-blue-100 bg-blue-700'
    : 'text-purple-100 bg-purple-700';
  const avatarOrder = isUser ? 'order-2' : 'order-1';

  return (
    <div className={`flex items-start gap-3 w-full animate-message-appear ${containerClasses}`}>
      <div
        className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${avatarClasses} ${avatarOrder}`}
      >
        <Avatar className="w-6 h-6" />
      </div>
      <div className={`max-w-xs md:max-w-md ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-md ${bubbleClasses}`}
        >
            {isLoading && !text ? <TypingIndicator /> : (
                <div
                    className="prose prose-sm prose-p:m-0 prose-ul:m-0 prose-li:m-0 prose-h4:m-0 prose-h4:mb-1 prose-h4:text-inherit"
                    dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }}
                />
            )}
        </div>
      </div>
    </div>
  );
};
