import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Sender, Itinerary, DayPlan, Activity } from '../types';
import { Copy, Check, Sparkles, RotateCw, Map, Plane, Calendar, DollarSign, MapPin, Clock, Sun, Moon, Sunset } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  onRegenerate: (messageId: string) => void;
}

// --- ITINERARY CARD COMPONENT ---
const ItineraryCard: React.FC<{ data: Itinerary }> = ({ data }) => {
  return (
    <div className="w-full max-w-2xl bg-white dark:bg-[#1a1b1e] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#444746]/50 shadow-lg mt-4 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Image / Vibe Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
            <Plane size={100} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-teal-100 text-sm font-medium uppercase tracking-wider">
                <Sparkles size={14} />
                {data.vibe} Vibes
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{data.trip_title}</h2>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <MapPin size={14} /> {data.destination}
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <Clock size={14} /> {data.duration}
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <DollarSign size={14} /> {data.budget_estimate}
                </div>
            </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 border-b border-gray-100 dark:border-[#2c2d30]">
        <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">"{data.summary}"</p>
      </div>

      {/* Timeline */}
      <div className="p-6 space-y-8">
        {data.days.map((day) => (
            <div key={day.day_number} className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 last:border-0 pb-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-teal-500 border-4 border-white dark:border-[#1a1b1e]" />
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Day {day.day_number}: {day.theme}</h3>
                
                <div className="mt-4 space-y-4">
                    {day.activities.map((act, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-[#252628] rounded-xl p-4 border border-gray-100 dark:border-[#333537] hover:border-teal-200 dark:hover:border-teal-900/50 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded text-white
                                    ${act.time_of_day === 'Morning' ? 'bg-orange-400' : 
                                      act.time_of_day === 'Afternoon' ? 'bg-blue-400' : 'bg-indigo-500'}
                                `}>
                                    {act.time_of_day}
                                </span>
                                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <MapPin size={10} /> {act.location}
                                </span>
                            </div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">{act.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{act.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

// Standard 3-dot Typing Indicator
const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 p-3 w-fit bg-gray-100 dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746]/50 rounded-[1.25rem] rounded-tl-sm animate-in fade-in duration-200">
    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.32s]" />
    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.16s]" />
    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
  </div>
);

const MessageBubble: React.FC<{ message: Message; onRegenerate: (id: string) => void }> = ({ message, onRegenerate }) => {
  const isUser = message.sender === Sender.USER;
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  
  // Typewriter effect state
  useEffect(() => {
    if (isUser || !message.isStreaming || message.itinerary) {
      setDisplayedText(message.text);
      return;
    }

    // Only typewrite if there is text and no itinerary yet
    if (displayedText.length < message.text.length) {
      const delta = message.text.length - displayedText.length;
      const chunkSize = delta > 50 ? 5 : delta > 20 ? 3 : 1;
      const delay = delta > 50 ? 5 : 15;

      const timeoutId = setTimeout(() => {
        setDisplayedText(message.text.slice(0, displayedText.length + chunkSize));
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [message.text, displayedText, message.isStreaming, isUser, message.itinerary]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showCursor = !isUser && (message.isStreaming || displayedText.length < message.text.length) && !message.itinerary;
  const contentToDisplay = isUser ? message.text : displayedText + (showCursor ? ' ▍' : '');

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 group`}>
      <div className={`flex flex-col max-w-full md:max-w-[85%] gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* User Attached Image */}
        {message.image && (
             <div className={`mb-2 ${isUser ? 'mr-1' : 'ml-10'}`}>
                 <img 
                    src={message.image} 
                    alt="Travel Inspiration" 
                    className="w-48 h-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                 />
             </div>
        )}

        <div className={`flex gap-4 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1`}>
            {isUser ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2d3135] text-gray-600 dark:text-white flex items-center justify-center text-xs font-medium border border-gray-300 dark:border-gray-700">
                    U
                </div>
            ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <Plane size={16} className="text-white transform -rotate-45" />
                </div>
            )}
            </div>

            {/* Content */}
            <div className={`flex flex-col flex-1 min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
            <div className="text-[15px] leading-relaxed w-full">
                {isUser ? (
                <p className="whitespace-pre-wrap bg-white dark:bg-[#1E1F20] text-gray-800 dark:text-[#E3E3E3] border border-gray-200 dark:border-transparent px-5 py-3 rounded-[1.25rem] rounded-tr-sm inline-block shadow-sm dark:shadow-none">
                    {message.text}
                </p>
                ) : (
                <div className="space-y-4 w-full text-gray-800 dark:text-[#E3E3E3]">
                    {/* Render Text Content if any */}
                    {message.text && (
                        <div className="markdown-content">
                            <ReactMarkdown>{contentToDisplay}</ReactMarkdown>
                        </div>
                    )}

                    {/* Render Itinerary Card if Data Exists */}
                    {message.itinerary && <ItineraryCard data={message.itinerary} />}
                    
                    {/* Loading State */}
                    {message.text === '' && !message.itinerary && message.isStreaming && (
                         <TypingIndicator />
                    )}
                </div>
                )}
            </div>
            
            {/* Action Tools (Footer) */}
            {!isUser && !message.isStreaming && (message.text || message.itinerary) && (
                <div className="mt-3 flex items-center gap-2 animate-in fade-in duration-500">
                    <button 
                    onClick={handleCopy}
                    className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#333537] rounded-full transition-colors"
                    title="Copy Text"
                    >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                    <button 
                    onClick={() => onRegenerate(message.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#333537] rounded-full transition-colors"
                    title="Regenerate"
                    >
                    <RotateCw size={18} />
                    </button>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export const MessageList: React.FC<MessageListProps> = ({ messages, onRegenerate }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages.length, messages[messages.length - 1]?.text, messages[messages.length - 1]?.itinerary]);

  if (messages.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
      <div className="max-w-3xl mx-auto pt-4">
        {messages.map((msg) => <MessageBubble key={msg.id} message={msg} onRegenerate={onRegenerate} />)}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};