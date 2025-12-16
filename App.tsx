import React, { useState, useCallback, useEffect } from 'react';
import { MessageList } from './components/MessageList';
import { InputArea } from './components/InputArea';
import { Sidebar } from './components/Sidebar';
import { AuthScreen } from './components/AuthScreen';
import { HelpModal } from './components/HelpModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Message, Sender, ChatSession, Itinerary } from './types';
import { sendMessageStream } from './services/gemini';
import { GenerateContentResponse } from "@google/genai";
import { Compass, Camera, Map, LogOut, Menu, SquarePen, Plane } from 'lucide-react';
import { api } from './lib/supabase';

interface UserData {
  name: string;
  email: string;
  id: string;
}

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    }
    return 'dark';
  });

  // Auth State
  const [user, setUser] = useState<UserData | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  
  // App State
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- AUTH INITIALIZATION (SUPABASE) ---
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await api.getCurrentUser();
        if (storedUser) {
          initializeUser(storedUser);
        }
      } catch (e) {
        console.error("Auth check error:", e);
      } finally {
        setAuthChecking(false);
      }
    };

    checkUser();
  }, []);

  const initializeUser = (dbUser: any) => {
    let displayName = 'Traveler';
    
    // STRICT: Use name from database.
    if (dbUser.first_name && dbUser.first_name.trim() !== '') {
        displayName = `${dbUser.first_name} ${dbUser.last_name || ''}`.trim();
    } else if (dbUser.email) {
         // Fallback ONLY if name is completely missing in DB
         displayName = dbUser.email.split('@')[0];
    }

    const userData = {
        name: displayName,
        email: dbUser.email,
        id: dbUser.id
    };
    setUser(userData);
    fetchSessions(dbUser.id);
  };

  const handleManualLogin = (userData: UserData) => {
    setUser(userData);
    fetchSessions(userData.id);
  };

  const fetchSessions = async (userId: string) => {
    const data = await api.getSessions(userId);
    setSessions(data || []);
  };

  const fetchMessagesForSession = async (sessionId: string) => {
    setIsLoading(true);
    const data = await api.getMessages(sessionId);
    
    if (data) {
        const mapped: Message[] = data.map((row: any) => {
            // Check if content is JSON itinerary or plain text
            let itineraryData: Itinerary | undefined;
            let textContent = row.content;

            // Simple heuristic to check if stored content was an itinerary JSON blob
            if (row.role === 'ai' && row.content.trim().startsWith('{') && row.content.includes('"trip_title"')) {
                try {
                    itineraryData = JSON.parse(row.content);
                    textContent = ''; // Hide raw JSON text
                } catch (e) {
                    // Not valid JSON, treat as text
                }
            }

            return {
                id: row.id,
                text: textContent,
                sender: row.role === 'user' ? Sender.USER : Sender.AI,
                timestamp: new Date(row.created_at).getTime(),
                isStreaming: false,
                itinerary: itineraryData
            };
        });
        setMessages(mapped);
    }
    setIsLoading(false);
  };

  const createSession = async (title: string): Promise<string | null> => {
      if (!user) return null;
      try {
        const newChat = await api.createSession(user.id, title);
        setSessions(prev => [newChat, ...prev]);
        return newChat.id;
      } catch (e) {
        console.error("Create session error", e);
        return null;
      }
  };

  const saveMessage = async (sessionId: string, text: string, role: 'user' | 'ai') => {
      await api.saveMessage(sessionId, text, role);
  };

  const handleSessionSelect = (id: string) => {
      setCurrentSessionId(id);
      fetchMessagesForSession(id);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    await api.signOut();
    setUser(null);
    setMessages([]);
    setSessions([]);
    setCurrentSessionId(null);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- HANDLE SEND WITH FUNCTION CALLING SUPPORT ---
  const handleSend = useCallback(async (text: string, image?: string) => {
    if (!user) return;
    setIsLoading(true);

    let activeSessionId = currentSessionId;

    if (!activeSessionId) {
        const title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
        activeSessionId = await createSession(title);
        if (activeSessionId) setCurrentSessionId(activeSessionId);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: text,
      sender: Sender.USER,
      timestamp: Date.now(),
      image: image 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    if (activeSessionId) saveMessage(activeSessionId, text, 'user');

    try {
      const streamResult = await sendMessageStream(text, image);
      
      const botMessageId = crypto.randomUUID();
      const botMessage: Message = {
        id: botMessageId,
        text: '',
        sender: Sender.AI,
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, botMessage]);

      let fullText = '';
      let functionCallFound: Itinerary | null = null;
      let finalResponseCandidates: any = null;

      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        
        // 1. Accumulate text if any
        if (c.text) {
             fullText += c.text;
             setMessages((prev) => 
               prev.map((msg) => msg.id === botMessageId ? { ...msg, text: fullText } : msg)
             );
        }

        // 2. Check for candidates
        if (c.candidates && c.candidates.length > 0) {
            finalResponseCandidates = c.candidates[0];
        }
      }
      
      // 3. Process Function Call after stream ends
      if (finalResponseCandidates?.content?.parts) {
          for (const part of finalResponseCandidates.content.parts) {
              if (part.functionCall && part.functionCall.name === 'propose_itinerary') {
                   functionCallFound = part.functionCall.args as Itinerary;
              }
          }
      }

      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId ? { 
              ...msg, 
              isStreaming: false, 
              itinerary: functionCallFound || undefined 
          } : msg
        )
      );

      // Save to DB
      if (activeSessionId) {
          const contentToSave = functionCallFound ? JSON.stringify(functionCallFound) : fullText;
          saveMessage(activeSessionId, contentToSave, 'ai');
      }

    } catch (error) {
      console.error('Error generating plan:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "I'm sorry, I encountered an issue while connecting to the travel network. Please try again.",
        sender: Sender.AI,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentSessionId]); 

  // --- REGENERATE ---
  const handleRegenerate = useCallback(async (messageId: string) => {
    if (!user) return;
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const prevMsg = messages[msgIndex - 1];
    if (!prevMsg || prevMsg.sender !== Sender.USER) return;

    setIsLoading(true);

    setMessages((prev) => 
      prev.map((msg) => msg.id === messageId ? { ...msg, text: '', itinerary: undefined, isStreaming: true } : msg)
    );

    try {
      const streamResult = await sendMessageStream(prevMsg.text, prevMsg.image);
      let fullText = '';
      let functionCallFound: Itinerary | null = null;
      let finalResponseCandidates: any = null;

      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
             fullText += c.text;
             setMessages((prev) => 
               prev.map((msg) => msg.id === messageId ? { ...msg, text: fullText } : msg)
             );
        }
        if (c.candidates && c.candidates.length > 0) {
            finalResponseCandidates = c.candidates[0];
        }
      }

      if (finalResponseCandidates?.content?.parts) {
        for (const part of finalResponseCandidates.content.parts) {
            if (part.functionCall && part.functionCall.name === 'propose_itinerary') {
                 functionCallFound = part.functionCall.args as Itinerary;
            }
        }
      }

      setMessages((prev) => 
        prev.map((msg) => msg.id === messageId ? { ...msg, isStreaming: false, itinerary: functionCallFound || undefined } : msg)
      );
      
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, user]);

  if (authChecking) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#020617]">
             <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-[#1e293b] rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-[#1e293b] rounded"></div>
             </div>
          </div>
      );
  }

  if (!user) {
    return <AuthScreen onLogin={handleManualLogin} />;
  }

  if (user.email === 'amar.workdesk@gmail.com') {
      return <AdminDashboard onLogout={handleLogout} />;
  }

  const hasStarted = messages.length > 0;
  
  // Get First Name for Display
  const firstName = user.name.split(' ')[0];

  return (
    // Update: Added 'travel-bg' class and removed background colors to allow pattern to show
    <div className="flex h-full w-full travel-bg text-gray-900 dark:text-[#E3E3E3] transition-colors duration-300 overflow-hidden">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        onNewChat={handleNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSessionSelect}
        onOpenHelp={() => setIsHelpOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 flex flex-col relative min-w-0 transition-all duration-300 h-full">
        
        {/* Header - Minimalist, Seamless, No Box */}
        <header className="flex items-center justify-between px-6 py-5 flex-shrink-0 z-10 bg-transparent">
           <div className="flex items-center gap-3 min-w-0">
             <button 
                onClick={toggleSidebar} 
                className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors md:hidden flex-shrink-0"
                aria-label="Open menu"
             >
                  <Menu size={24} />
             </button>
             
             <div className="flex items-center gap-3 min-w-0 group cursor-pointer" onClick={handleNewChat}>
                {/* Logo Icon - No Box, Just Icon */}
                <Plane className="text-teal-500 dark:text-teal-400 transition-transform group-hover:-rotate-12" size={26} strokeWidth={2.5} />
                
                {/* Logo Text - Sleek & Modern */}
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white leading-none tracking-tight">Agentic</span>
                    <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em] leading-none mt-0.5">Travel Planner</span>
                </div>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                 onClick={handleNewChat}
                 className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                 title="New Chat"
              >
                  <SquarePen size={20} />
              </button>

              <div className="flex items-center gap-3 group relative flex-shrink-0 ml-1">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Premium Member</div>
                  </div>
                  
                  <button className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#2a2b2e] dark:to-[#1a1b1e] text-gray-700 dark:text-gray-200 flex items-center justify-center text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-colors shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </button>

                  <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746]/50 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#28292a] rounded-lg transition-colors">
                        <LogOut size={14} />
                        Logout
                      </button>
                  </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        {!hasStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full animate-in fade-in duration-500 overflow-y-auto">
            <div className="text-left w-full max-w-3xl mb-6 md:mb-10 px-2 mt-auto md:mt-0">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-tight mb-2 break-words">
                <span className="text-gradient block mb-2 leading-tight pb-1">Hello, {firstName}</span>
                <span className="text-slate-600 dark:text-slate-400 text-2xl sm:text-3xl md:text-5xl block">Where are we flying today?</span>
              </h1>
            </div>

            <InputArea onSend={handleSend} disabled={isLoading} variant="centered" />

            <div className="flex gap-3 overflow-x-auto w-full max-w-3xl px-2 pb-8 md:pb-4 scrollbar-hide snap-x snap-mandatory mb-auto md:mb-0">
               <SuggestionCard 
                  icon={<Compass size={20} className="text-teal-500 dark:text-teal-400" />} 
                  text="Weekend in Kyoto" 
                  onClick={() => handleSend("Plan a relaxing weekend trip to Kyoto with a focus on tea ceremonies and nature.")} 
                />
               <SuggestionCard 
                  icon={<Camera size={20} className="text-emerald-500 dark:text-emerald-400" />} 
                  text="Analyze My Vibe" 
                  onClick={() => handleSend("I'm uploading an image of a cabin. Plan a trip with this exact cozy vibe.")} 
                />
               <SuggestionCard 
                  icon={<Map size={20} className="text-cyan-500 dark:text-cyan-400" />} 
                  text="Backpacking Europe" 
                  onClick={() => handleSend("Create a budget backpacking itinerary for Western Europe for 14 days.")} 
                />
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} onRegenerate={handleRegenerate} />
            <InputArea onSend={handleSend} disabled={isLoading} variant="bottom" />
          </>
        )}
      </main>
    </div>
  );
};

const SuggestionCard: React.FC<{ icon: React.ReactNode, text: string, onClick: () => void }> = ({ icon, text, onClick }) => (
  <button 
    onClick={onClick}
    className="flex-shrink-0 snap-start flex items-center gap-3 bg-white/80 dark:bg-[#1e293b]/60 backdrop-blur-sm hover:bg-white dark:hover:bg-[#334155]/80 px-4 md:px-5 py-3 rounded-full transition-colors border border-gray-200 dark:border-white/5 hover:border-teal-200 dark:hover:border-teal-800/50 shadow-sm"
  >
    <div className="p-1 rounded-full bg-gray-100 dark:bg-[#0f172a]">{icon}</div>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{text}</span>
  </button>
);

export default App;