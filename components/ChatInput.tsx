import React, { useState } from 'react';
import { CommandIcon, SendIcon } from './icons';

interface Command {
    command: string;
    label: string;
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  slashCommands: Command[];
  atCommands: Command[];
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, slashCommands, atCommands }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState<Command[] | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.startsWith('/')) {
        setShowSuggestions(slashCommands.filter(c => c.command.startsWith(value)));
    } else if (value.startsWith('@')) {
        setShowSuggestions(atCommands.filter(c => c.command.startsWith(value)));
    } else {
        setShowSuggestions(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      setShowSuggestions(null);
    }
  };
  
  const handleSuggestionClick = (command: string) => {
      onSendMessage(command);
      setInput('');
      setShowSuggestions(null);
  }

  return (
    <div className="p-3 border-t border-gray-200 bg-gray-50/80 backdrop-blur-sm">
        {showSuggestions && showSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-100 border-b border-gray-200 max-h-32 overflow-y-auto">
                {showSuggestions.map(cmd => (
                    <button
                        key={cmd.command}
                        onClick={() => handleSuggestionClick(cmd.command)}
                        className="bg-white border border-gray-300 rounded-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 transition-colors shadow-sm flex items-center gap-2"
                    >
                       <CommandIcon className="w-3 h-3 fill-gray-600" /> {cmd.label}
                    </button>
                ))}
            </div>
        )}
        <form
        onSubmit={handleSubmit}
        className="relative max-w-4xl mx-auto"
        >
        <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
            className="w-full pl-4 pr-14 py-3 bg-white border border-gray-300 text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:opacity-60"
        />
        <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
            <SendIcon className="w-5 h-5 fill-white" />
        </button>
        </form>
    </div>
  );
};
