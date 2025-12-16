import React from 'react';
import { Menu, Plus, MessageSquare, HelpCircle, SquarePen, Sun, Moon, X, Plane, Map } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onOpenHelp: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar, 
  onNewChat, 
  sessions, 
  currentSessionId, 
  onSelectSession,
  onOpenHelp,
  theme,
  toggleTheme
}) => {
  
  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3]">
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between p-4 flex-shrink-0 ${!mobile && !isOpen ? 'justify-center py-6' : ''}`}>
             {(mobile || isOpen) && (
                 <div className="flex items-center gap-2.5 animate-in fade-in duration-200">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                        <Plane size={16} />
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Travel Agent</span>
                 </div>
             )}
             
             <button 
                onClick={toggleSidebar} 
                className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#28292a] transition-colors ${!mobile && !isOpen ? '' : 'ml-auto'}`}
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
             >
                {(mobile || isOpen) ? <X size={20} /> : <Menu size={24} />}
             </button>
        </div>

        {/* New Chat Button */}
        <div className={`px-4 mb-2 flex-shrink-0 ${!mobile && !isOpen ? 'flex justify-center px-2' : ''}`}>
            <button 
                onClick={onNewChat}
                className={`
                flex items-center gap-3 rounded-xl transition-all duration-200 group
                ${mobile || isOpen 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 py-3 px-4 w-full shadow-lg shadow-gray-200 dark:shadow-none' 
                    : 'bg-gray-100 dark:bg-[#28292a] hover:bg-gray-200 dark:hover:bg-[#333537] text-gray-900 dark:text-white p-3 justify-center'
                }
                `}
                title="New chat"
            >
            {mobile || isOpen ? (
                <>
                <Plus size={18} />
                <span className="text-sm font-medium">New Trip</span>
                </>
            ) : (
                <SquarePen size={20} />
            )}
            </button>
        </div>

        {/* Recent Chats Label */}
        {(mobile || isOpen) && (
             <div className="px-6 pt-4 pb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Recent Itineraries
             </div>
        )}

        {/* Chat List */}
        <div className={`flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar ${!mobile && !isOpen ? 'hidden' : ''}`}>
            {sessions.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-center px-4">
                    <Map size={24} className="mb-2 opacity-50" />
                    <p className="text-sm">No trips yet</p>
                 </div>
            ) : (
                sessions.map((session) => (
                <button 
                    key={session.id} 
                    onClick={() => onSelectSession(session.id)}
                    className={`
                        w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group relative overflow-hidden
                        ${currentSessionId === session.id 
                            ? 'bg-gray-100 dark:bg-[#28292a] text-gray-900 dark:text-white font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#28292a]/50 hover:text-gray-900 dark:hover:text-gray-200'}
                    `}
                >
                    <MessageSquare size={16} className={`flex-shrink-0 ${currentSessionId === session.id ? 'text-teal-500 dark:text-teal-400' : 'text-gray-400'}`} />
                    <span className="truncate flex-1 z-10 relative">{session.title || 'Untitled Trip'}</span>
                    
                    {currentSessionId === session.id && (
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-500 rounded-r-full" />
                    )}
                </button>
                ))
            )}
        </div>

        {/* Footer */}
        <div className={`mt-auto p-4 border-t border-gray-100 dark:border-[#28292a] space-y-2 ${!mobile && !isOpen ? 'items-center flex flex-col' : ''}`}>
            <button 
            onClick={toggleTheme}
            className={`
            flex items-center gap-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#28292a] text-gray-600 dark:text-gray-400 transition-colors
            ${mobile || isOpen ? 'w-full px-4 py-3 text-sm' : 'p-3 justify-center'}
            `} title="Toggle Theme">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                {(mobile || isOpen) && <span className="font-medium">Theme</span>}
            </button>

            <button 
            onClick={onOpenHelp}
            className={`
            flex items-center gap-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#28292a] text-gray-600 dark:text-gray-400 transition-colors
            ${mobile || isOpen ? 'w-full px-4 py-3 text-sm' : 'p-3 justify-center'}
            `} title="Help">
                <HelpCircle size={20} />
                {(mobile || isOpen) && <span className="font-medium">Help & FAQ</span>}
            </button>
        </div>
    </div>
  );

  return (
    <>
      {/* --- MOBILE LAYOUT (<768px) --- */}
      {/* Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-gray-900/50 z-30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
      
      {/* Mobile Drawer (Fixed Overlay) */}
      <div 
        className={`
          md:hidden fixed inset-y-0 left-0 z-40 h-[100dvh] w-[85%] max-w-[320px]
          bg-white dark:bg-[#1E1F20] 
          shadow-2xl transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
         <SidebarContent mobile={true} />
      </div>

      {/* --- DESKTOP LAYOUT (>=768px) --- */}
      {/* Relative Sidebar (In Flow) */}
      <div 
        className={`
          hidden md:flex flex-col h-full flex-shrink-0
          bg-white dark:bg-[#1E1F20] 
          border-r border-gray-200 dark:border-[#444746]/50 
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-[280px]' : 'w-[80px]'}
        `}
      >
        <SidebarContent mobile={false} />
      </div>
    </>
  );
};