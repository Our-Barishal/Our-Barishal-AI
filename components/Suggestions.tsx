import React from 'react';

interface SuggestionsProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export const Suggestions: React.FC<SuggestionsProps> = ({ suggestions, onSelectSuggestion }) => {
  return (
    <div className="flex justify-start">
        <div className="flex flex-wrap items-start gap-2 max-w-xs md:max-w-md lg:max-w-2xl ml-13">
            {suggestions.map((suggestion, index) => (
                <button
                key={index}
                onClick={() => onSelectSuggestion(suggestion)}
                className="px-4 py-2 bg-gray-700 text-gray-200 text-sm rounded-full hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                >
                {suggestion}
                </button>
            ))}
        </div>
    </div>
  );
};
