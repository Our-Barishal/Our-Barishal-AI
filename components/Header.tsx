import React from 'react';
import { CloseIcon, HistoryIcon, NewChatIcon, SparklesIcon, ThemeIcon } from './icons';

interface HeaderProps {
    headerColor: string;
    onToggleThemePanel: (e: React.MouseEvent) => void;
    onNewChat: () => void;
    onToggleHistoryPanel: () => void;
}

const lightenColor = (color: string, percent: number) => {
    try {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = ((num >> 8) & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        const toHex = (c: number) => ('0' + c.toString(16)).slice(-2);
        const newR = R < 255 ? (R < 1 ? 0 : R) : 255;
        const newG = G < 255 ? (G < 1 ? 0 : G) : 255;
        const newB = B < 255 ? (B < 1 ? 0 : B) : 255;
        return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
    } catch (e) {
        return color; // fallback
    }
};

export const Header: React.FC<HeaderProps> = ({ headerColor, onToggleThemePanel, onNewChat, onToggleHistoryPanel }) => {
  const gradientStyle = {
    background: `linear-gradient(135deg, ${headerColor} 0%, ${lightenColor(headerColor, 30)} 100%)`
  };

  const ActionButton: React.FC<{ onClick: (e: any) => void; title: string; children: React.ReactNode }> = ({ onClick, title, children }) => (
    <button
      onClick={onClick}
      title={title}
      className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-white/30 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
    >
      {children}
    </button>
  );

  return (
    <header style={gradientStyle} className="text-white p-4 flex justify-between items-center z-10 rounded-t-xl flex-shrink-0">
      <h3 className="m-0 text-lg font-bold flex items-center gap-2">
        <SparklesIcon className="w-6 h-6" /> Our Barishal AI
      </h3>
      <div className="flex gap-2">
        <ActionButton onClick={onToggleThemePanel} title="Change Theme">
          <ThemeIcon className="w-4 h-4 fill-white" />
        </ActionButton>
        <ActionButton onClick={onNewChat} title="New Chat">
          <NewChatIcon className="w-4 h-4 fill-white" />
        </ActionButton>
        <ActionButton onClick={onToggleHistoryPanel} title="Chat History">
          <HistoryIcon className="w-4 h-4 fill-white" />
        </ActionButton>
      </div>
    </header>
  );
};