import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { Suggestions } from './components/Suggestions';
import { createChatSession } from './services/geminiService';
import { Message, User, ChatSession } from './types';
import { ChatIcon, CloseIcon, EmailIcon, HistoryIcon, RegistrationUserIcon, SparklesIcon, ThemeIcon } from './components/icons';

// --- Helper Functions for Commands ---
const slashCommands = [ { command: '/districts', label: 'All Districts' }, { command: '/barishal', label: 'Barishal' }, { command: '/bhola', label: 'Bhola' }, { command: '/patuakhali', label: 'Patuakhali' }, { command: '/pirojpur', label: 'Pirojpur' }, { command: '/jhalokati', label: 'Jhalokati' }, { command: '/barguna', label: 'Barguna' } ];
const atCommands = [ { command: '@download', label: 'Download App' }, { command: '@tourist', label: 'Tourist Info' }, { command: '@help', label: 'Help' } ];

const handleSlashCommand = (command: string) => {
    const districtInfoStyle = "background: rgba(248, 249, 250, 0.65); border-radius: 10px; padding: 12px; margin-top: 8px; border-left: 3px solid #1e5799;";
    const h4Style = "color: #1e5799; margin-bottom: 5px; font-size: 1rem; font-weight: bold;";
    switch (command) {
        case '/districts': return `Barishal Division has 6 districts:<br><div style="${districtInfoStyle}"><h4 style="${h4Style}">1. Barishal District</h4>Area: 2,784.52 sq km</div><div style="${districtInfoStyle}"><h4 style="${h4Style}">2. Bhola District</h4>Area: 3,403.48 sq km</div><div style="${districtInfoStyle}"><h4 style="${h4Style}">3. Patuakhali District</h4>Area: 3,220.15 sq km</div><div style="${districtInfoStyle}"><h4 style="${h4Style}">4. Pirojpur District</h4>Area: 1,277.80 sq km</div><div style="${districtInfoStyle}"><h4 style="${h4Style}">5. Jhalokati District</h4>Area: 758.06 sq km</div><div style="${districtInfoStyle}"><h4 style="${h4Style}">6. Barguna District</h4>Area: 1,831.31 sq km</div>`;
        case '/barishal': return `<div style="${districtInfoStyle}"><h4 style="${h4Style}">Barishal District</h4>Established: 1797<br>Area: 2,784.52 sq km<br>Upazilas: 10<br>Tourist spots: Durgasagar Dighi, Guthia Mosque</div>`;
        case '/bhola': return `<div style="${districtInfoStyle}"><h4 style="${h4Style}">Bhola District</h4>Established: 1984<br>Area: 3,403.48 sq km<br>Upazilas: 7<br>Tourist spots: Char Kukri Mukri, Monpura Island</div>`;
        default: return 'Unknown command. Available commands: /districts, /barishal, /bhola, /patuakhali, /pirojpur, /jhalokati, /barguna';
    }
}
const handleAtCommand = (command: string) => {
    const districtInfoStyle = "background: rgba(248, 249, 250, 0.65); border-radius: 10px; padding: 12px; margin-top: 8px; border-left: 3px solid #1e5799;";
    const h4Style = "color: #1e5799; margin-bottom: 5px; font-size: 1rem; font-weight: bold;";
    switch (command) {
        case '@download': setTimeout(() => { window.open('https://ourbarishal.apk.com/', '_blank'); }, 500); return 'Redirecting you to the Our Barishal App download page...';
        case '@tourist': return `Popular tourist spots in Barishal Division:<br><div style="${districtInfoStyle}"><h4 style="${h4Style}">Kuakata Sea Beach</h4>Located in Patuakhali district</div><div style="${districtInfoStyle}"><h4 style="${h4Style}">Durgasagar Dighi</h4>Historic pond in Barishal district</div>`;
        case '@help': return 'How to use this chatbot:<br>- Use / commands for district information<br>- Use @ commands for app and tourist information<br>- Type your questions directly to chat with AI.';
        default: return 'Unknown command. Available commands: @download, @tourist, @help';
    }
}


// --- THEMES ---
const themeImages: Record<string, string> = {
    default: '',
    village1: 'https://pngmagic.com/webp_images/nature-background-images-with-powerful-sunsets_tzZ.webp',
    village2: 'https://i.pinimg.com/564x/07/54/6b/07546b0505b9d3042433b18210e83f8f.jpg',
    village3: 'https://i.pinimg.com/736x/8a/10/62/8a1062f2114d0c340c9ff7bc1e300d40.jpg',
    village4: 'https://m.media-amazon.com/images/I/81Knzi24ikL.jpg',
};
const headerColors = ["#1e5799", "#2c3e50", "#27ae60", "#8e44ad", "#e74c3c", "#f39c12", "#16a085", "#2980b9"];

// --- Helper Components ---
const RegistrationForm: React.FC<{ onRegister: (user: User) => void }> = ({ onRegister }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && email.trim()) { // Basic validation
            onRegister({ name, email });
        } else {
            alert('Please enter your name and email.');
        }
    };

    return (
        <div className="p-8 flex flex-col gap-5 h-full justify-center bg-white/60 backdrop-blur-sm">
            <h3 className="text-center text-xl font-bold text-gray-800 flex items-center justify-center gap-3"><ChatIcon className="w-7 h-7 fill-blue-700"/> Welcome to Barishal Support</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="userName" className="text-sm font-medium text-gray-600 flex items-center gap-2"><RegistrationUserIcon className="w-4 h-4 fill-blue-700" /> Your Name</label>
                    <input type="text" id="userName" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="userEmail" className="text-sm font-medium text-gray-600 flex items-center gap-2"><EmailIcon className="w-4 h-4 fill-blue-700" /> Email Address</label>
                    <input type="email" id="userEmail" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                </div>
                <button type="submit" className="mt-2 p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">Start Chat</button>
            </form>
        </div>
    );
};

const ThemePanel: React.FC<{ onSetTheme: (theme: string) => void; onSetColor: (color: string) => void; }> = ({ onSetTheme, onSetColor }) => {
    return (
        <div className="absolute top-[70px] right-5 bg-white rounded-lg shadow-2xl p-4 z-20 w-56 animate-slide-up">
            <div className="flex flex-col gap-2">
                {Object.keys(themeImages).map(theme => (
                    <button key={theme} onClick={() => onSetTheme(theme)} className="w-full text-left p-2 rounded-md hover:bg-gray-100 text-gray-700 capitalize flex items-center gap-2"><ThemeIcon className="w-4 h-4 fill-gray-600"/> Theme: {theme}</button>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2"><SparklesIcon className="w-4 h-4 fill-gray-600"/> Header Color:</p>
                <div className="grid grid-cols-4 gap-2">
                    {headerColors.map(color => (
                        <button key={color} onClick={() => onSetColor(color)} className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform" style={{ backgroundColor: color }}></button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const HistoryPanel: React.FC<{ history: ChatSession[], onSelectChat: (id: string) => void; currentChatId: string | null; onClose: () => void;}> = ({ history, onSelectChat, currentChatId, onClose }) => {
    return (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-30 flex flex-col p-4 animate-slide-up">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5 fill-gray-700" /> Chat History
                </h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                    <CloseIcon className="w-5 h-5 fill-gray-600" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {history.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">No history found.</div>
                ) : (
                    history.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                                currentChatId === chat.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                            }`}
                        >
                            <p className="font-semibold text-gray-800 truncate">{chat.title}</p>
                            <p className="text-xs text-gray-500">{new Date(chat.updatedAt).toLocaleString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [session, setSession] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [theme, setTheme] = useState('default');
  const [headerColor, setHeaderColor] = useState('#1e5799');
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentMessages = history.find(c => c.id === currentChatId)?.messages ?? [];

  useEffect(() => {
    // Load user and history from localStorage
    const savedUser = localStorage.getItem('barishalChatUser');
    const savedHistory = localStorage.getItem('barishalChatHistory');
    const savedTheme = localStorage.getItem('barishalChatTheme');
    const savedColor = localStorage.getItem('barishalChatHeaderColor');

    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
    if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
    }
    if(savedTheme) setTheme(savedTheme);
    if(savedColor) setHeaderColor(savedColor);

  }, []);

  useEffect(() => {
      if (user && history.length > 0) {
          const latestChatId = history[0].id;
          handleSelectChat(latestChatId);
      } else if (user) {
          handleNewChat();
      }
  }, [user]); // Run when user logs in

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);


  const saveHistory = (newHistory: ChatSession[]) => {
      setHistory(newHistory);
      localStorage.setItem('barishalChatHistory', JSON.stringify(newHistory));
  }

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('barishalChatUser', JSON.stringify(newUser));
  };
  
  const handleNewChat = () => {
    setIsLoading(true);
    const newChatSession = createChatSession();
    setSession(newChatSession);

    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{ role: 'model', parts: [{ text: "আসসালামু আলাইকুম! আমি আমাদের বরিশাল এআই সাপোর্ট। কিভাবে আপনাকে আমাদের বরিশাল ওয়েবসাইট (our-barishal.blogspot.com) সম্পর্কিত তথ্য দিয়ে সাহায্য করতে পারি?" }] }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedHistory = [newChat, ...history];
    saveHistory(updatedHistory);
    setCurrentChatId(newChat.id);
    setSuggestions([]);
    setIsLoading(false);
  };
  
  const handleSelectChat = (id: string) => {
      setCurrentChatId(id);
      const newChatSession = createChatSession();
      setSession(newChatSession);
      setSuggestions([]); // Clear suggestions when switching chats
  }

  const handleSendMessage = async (userInput: string) => {
    if (!currentChatId || !session) return;
    
    setIsLoading(true);
    setSuggestions([]);
    
    const userMessage: Message = { role: 'user', parts: [{ text: userInput }] };
    
    const loadingMessage: Message = { role: 'model', parts: [{text: ''}] };

    // Update history immediately with user message and a placeholder for bot response
    const updatedHistory = history.map(chat =>
      chat.id === currentChatId
        ? {
            ...chat,
            messages: [...chat.messages, userMessage, loadingMessage],
            title: chat.messages.length <= 1 ? userInput.substring(0, 30) + '...' : chat.title,
            updatedAt: new Date().toISOString(),
          }
        : chat
    );
    saveHistory(updatedHistory);
    
    // Handle commands locally
    if (userInput.startsWith('/') || userInput.startsWith('@')) {
        const responseText = userInput.startsWith('/') ? handleSlashCommand(userInput) : handleAtCommand(userInput);
        const botMessage: Message = { role: 'model', parts: [{ text: responseText }] };
        const finalHistory = updatedHistory.map(chat => chat.id === currentChatId ? { ...chat, messages: [...chat.messages.slice(0, -1), botMessage] } : chat);
        saveHistory(finalHistory);
        setIsLoading(false);
        return;
    }

    try {
        const result = await session.sendMessageStream({ message: userInput });
        
        let accumulatedText = '';
        
        for await (const chunk of result) {
            const chunkText = chunk.text;
            if (chunkText) {
                accumulatedText += chunkText;
            }
        }
        
        let responseText = "Sorry, an error occurred. Please try again.";
        let finalSuggestions: string[] = [];
        try {
            // Sanitize JSON string
            const sanitizedJson = accumulatedText.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(sanitizedJson);
            responseText = parsed.response || responseText;
            finalSuggestions = parsed.suggestions || [];
        } catch (e) {
            console.error("JSON parsing error:", e);
            if (accumulatedText.trim()) {
                responseText = accumulatedText;
            }
        }

        const botMessage: Message = { role: 'model', parts: [{ text: responseText }] };
        const finalHistory = history.map(chat =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages.slice(0, -1), botMessage] }
              : chat
        );
        saveHistory(finalHistory);
        setSuggestions(finalSuggestions);

    } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: Message = { role: 'model', parts: [{ text: 'Sorry, an error occurred. Please try again.' }] };
        const finalHistory = history.map(chat =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages.slice(0, -1), errorMessage] }
              : chat
        );
        saveHistory(finalHistory);
    } finally {
        setIsLoading(false);
    }
  };

    const handleSetTheme = (themeName: string) => {
        setTheme(themeName);
        localStorage.setItem('barishalChatTheme', themeName);
    }
    
    const handleSetHeaderColor = (color: string) => {
        setHeaderColor(color);
        localStorage.setItem('barishalChatHeaderColor', color);
    }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-lg h-[90vh] max-h-[700px] bg-white/50 backdrop-blur-lg rounded-xl shadow-2xl flex flex-col overflow-hidden relative border border-gray-200/50">
            {isThemePanelOpen && <ThemePanel onSetTheme={handleSetTheme} onSetColor={handleSetHeaderColor} />}
            {isHistoryPanelOpen && <HistoryPanel history={history} onSelectChat={handleSelectChat} currentChatId={currentChatId} onClose={() => setIsHistoryPanelOpen(false)} />}
            
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
                style={{ backgroundImage: `url(${themeImages[theme]})`, opacity: theme === 'default' ? 0 : 1 }}
            />
            
            <div className="relative z-10 flex flex-col h-full" onClick={() => setIsThemePanelOpen(false)}>
                <Header 
                    headerColor={headerColor} 
                    onNewChat={() => { if(confirm('Start a new chat?')) handleNewChat() }}
                    onToggleHistoryPanel={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                    onToggleThemePanel={(e) => { e.stopPropagation(); setIsThemePanelOpen(!isThemePanelOpen) }}
                />
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!user ? (
                        <RegistrationForm onRegister={handleRegister} />
                    ) : (
                        currentMessages.length > 0 ? (
                            <>
                                {currentMessages.map((msg, index) => (
                                    <ChatMessage key={index} message={msg} isLoading={isLoading && index === currentMessages.length - 1} />
                                ))}
                                 {suggestions.length > 0 && !isLoading && (
                                    <Suggestions suggestions={suggestions} onSelectSuggestion={handleSendMessage} />
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        ) : (
                           <div className="text-center text-gray-500 pt-10">No messages yet. Start the conversation!</div>
                        )
                    )}
                </div>
                
                {user && (
                    <ChatInput 
                        onSendMessage={handleSendMessage} 
                        isLoading={isLoading}
                        slashCommands={slashCommands}
                        atCommands={atCommands}
                    />
                )}
            </div>
        </div>
    </main>
  );
};

export default App;
