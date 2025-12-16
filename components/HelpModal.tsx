import React from 'react';
import { X, BookOpen, Info, ShieldAlert, Map, Plane, Database, UserCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E1F20] md:border border-gray-200 dark:border-[#444746]/50 w-full h-full md:h-auto md:max-w-2xl md:max-h-[85vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-[#444746]/30 bg-white dark:bg-[#1E1F20] sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-[#E3E3E3]">Travel Agent Guide</h2>
          <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#333537] rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar bg-gray-50 dark:bg-[#1E1F20]">
          
          {/* Section 1: Rulebook */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-teal-500 dark:text-teal-400">
              <BookOpen size={20} />
              <h3 className="text-xs font-bold tracking-widest uppercase">How to Use</h3>
            </div>
            
            <div className="space-y-4">
                {/* Rule 1 */}
                <div className="bg-white dark:bg-[#131314] rounded-xl p-5 border border-gray-200 dark:border-[#444746]/30 shadow-sm dark:shadow-none">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 text-teal-500 dark:text-teal-400"><Plane size={20}/></div>
                        <div>
                            <h4 className="text-gray-900 dark:text-white font-medium mb-1">1. The "Agentic" Workflow</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Provide a simple request like <em>"Plan a 5-day trip to Tokyo."</em> The Agent doesn't just chat; it <strong>executes a function</strong> to build a structured visual itinerary with timeline, costs, and locations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rule 2 */}
                <div className="bg-white dark:bg-[#131314] rounded-xl p-5 border border-gray-200 dark:border-[#444746]/30 shadow-sm dark:shadow-none">
                    <div className="flex items-start gap-3">
                         <div className="mt-1 text-purple-500 dark:text-purple-400"><Map size={20}/></div>
                         <div>
                            <h4 className="text-gray-900 dark:text-white font-medium mb-1">2. Visual Inspiration</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Upload an image of a landscape, a hotel, or a street scene. The Agent will analyze the <strong>Vibe</strong> (e.g., "Rustic", "Neon", "Calm") and tailor the itinerary to match that aesthetic.
                            </p>
                         </div>
                    </div>
                </div>

                {/* Rule 3 */}
                 <div className="bg-white dark:bg-[#131314] rounded-xl p-5 border border-gray-200 dark:border-[#444746]/30 shadow-sm dark:shadow-none">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 text-orange-500 dark:text-orange-400"><Info size={20}/></div>
                        <div>
                            <h4 className="text-gray-900 dark:text-white font-medium mb-1">3. Refining Plans</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Don't like the plan? Just say <em>"Make it cheaper"</em> or <em>"Add more museums"</em>. The Agent will modify the structured data and regenerate the Itinerary Card instantly.
                            </p>
                        </div>
                    </div>
                </div>

                 {/* Rule 4 */}
                 <div className="bg-white dark:bg-[#131314] rounded-xl p-5 border border-gray-200 dark:border-[#444746]/30 shadow-sm dark:shadow-none">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 text-pink-500 dark:text-pink-400"><UserCheck size={20}/></div>
                        <div>
                            <h4 className="text-gray-900 dark:text-white font-medium mb-1">4. Persona Control</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                You can ask the agent to act as a "Luxury Concierge" or a "Budget Backpacker". It will adjust the recommendations and the tone of the itinerary accordingly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#444746]/30 bg-gray-50 dark:bg-[#131314] flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-black dark:bg-[#E3E3E3] hover:opacity-80 text-white dark:text-black font-medium rounded-full transition-colors text-sm"
           >
             Close Guide
           </button>
        </div>
      </div>
    </div>
  );
};