import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square, Loader2, AlertCircle, Image as ImageIcon, X } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, image?: string) => void;
  disabled: boolean;
  variant: 'centered' | 'bottom';
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled, variant }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Adjust height limit based on variant
      const maxHeight = variant === 'centered' ? 200 : 150;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [input, variant]);

  // Clear mic error after 5 seconds
  useEffect(() => {
    if (micError) {
        const timer = setTimeout(() => setMicError(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [micError]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || disabled) return;
    
    onSend(input, selectedImage || undefined);
    
    setInput('');
    setSelectedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleListening = async () => {
    // 1. Stop if already listening
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    // 2. Check Browser Support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        setMicError("Voice input is not supported in this browser.");
        return;
    }

    setIsRequestingMic(true);
    setMicError(null);

    // 3. Explicitly request permission to trigger the browser prompt
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Got permission! Stop this stream immediately as SpeechRecognition creates its own.
        stream.getTracks().forEach(track => track.stop());
    } catch (err) {
        // This block catches if the user clicks "Block" or if permission was previously blocked
        setIsRequestingMic(false);
        console.error("Mic permission denied:", err);
        setMicError("Please enable microphone permissions in your browser address bar.");
        return;
    }

    // 4. Start Recognition
    try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        const initialText = input;

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                let chunk = event.results[i][0].transcript;
                transcript += chunk; 
            }
            
            let newText = transcript;
            if (initialText) {
                 const needsSpace = initialText.length > 0 && !initialText.endsWith(' ');
                 newText = initialText + (needsSpace ? ' ' : '') + transcript;
            }
            setInput(newText);
        };

        recognition.onstart = () => {
            setIsRequestingMic(false);
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
            setIsRequestingMic(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            setIsRequestingMic(false);
            
            if (event.error === 'not-allowed') {
                setMicError("Microphone permissions are needed to speak.");
            } else if (event.error === 'no-speech') {
                // Ignore no-speech
            } else {
                setMicError(`Voice error: ${event.error}`);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();

    } catch (e) {
        console.error(e);
        setIsRequestingMic(false);
        setMicError("Unable to start voice input.");
    }
  };

  // Styles based on variant
  const containerClasses = variant === 'centered' 
    ? 'w-full max-w-3xl mx-auto' 
    : 'w-full max-w-4xl mx-auto';
    
  const wrapperClasses = variant === 'centered'
    ? `bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-transparent rounded-[2rem] p-3 md:p-4 min-h-[120px] md:min-h-[160px] flex flex-col relative transition-all duration-200 shadow-sm dark:shadow-none ${isListening ? 'ring-2 ring-indigo-500/30' : ''}`
    : `bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-transparent rounded-[1.5rem] px-3 md:px-4 py-2 flex items-end gap-2 relative transition-all duration-200 shadow-sm dark:shadow-none ${isListening ? 'ring-1 ring-indigo-500/50' : ''}`;

  return (
    <div className={`w-full px-2 md:px-4 ${variant === 'bottom' ? 'pb-2 md:pb-4 pt-2 bg-gray-50 dark:bg-[#131314]' : ''}`}>
      <div className={containerClasses}>
        
        {/* Error Toast */}
        {micError && (
             <div className="mb-2 px-3 py-2 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-200 text-sm animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={14} />
                <span>{micError}</span>
             </div>
        )}

        <form onSubmit={handleSubmit} className={wrapperClasses}>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            className="hidden" 
          />

          {/* Image Preview Area - different based on variant */}
          {selectedImage && (
             <div className={variant === 'centered' ? "absolute top-4 left-4 z-10" : "relative mb-1"}>
                <div className="relative group">
                    <img 
                        src={selectedImage} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                    />
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 bg-gray-900 text-white rounded-full p-0.5 shadow-md hover:bg-gray-700 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
             </div>
          )}

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : (variant === 'centered' ? "Describe your dream trip..." : "Message Agent...")}
            disabled={disabled}
            className={`bg-transparent border-none resize-none focus:ring-0 text-gray-800 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[16px] leading-relaxed w-full 
              ${variant === 'centered' 
                  ? `mt-2 md:mt-4 mb-8 md:mb-8 px-2 max-h-[120px] ${(selectedImage) ? 'pl-20' : ''}` 
                  : 'py-3 px-2 max-h-[150px] flex-1'
              }
            `}
            rows={1}
            style={{ minHeight: variant === 'centered' ? '56px' : '24px' }}
          />

          {/* Trailing Icons */}
          <div className={`flex items-center gap-2 ${variant === 'centered' ? 'absolute bottom-3 right-4 w-full justify-between pl-4 pr-0' : 'mb-1.5'}`}>
             
             {/* Spacer for Centered Layout */}
             {variant === 'centered' && <div className="flex-1"></div>}

             <div className="flex items-center gap-2 ml-auto">
               
               {/* Image Upload Button */}
               <button
                 type="button"
                 onClick={triggerFileSelect}
                 disabled={disabled}
                 className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#333537] rounded-full transition-colors"
                 title="Attach image"
               >
                 <ImageIcon size={20} />
               </button>

               <button 
                 type="button" 
                 onClick={toggleListening}
                 disabled={isRequestingMic}
                 className={`p-2 rounded-full transition-all duration-200 ${
                   isListening 
                     ? 'bg-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/30 animate-pulse' 
                     : isRequestingMic 
                        ? 'bg-gray-100 dark:bg-[#333537] text-gray-400 cursor-wait'
                        : 'text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#333537]'
                 }`}
                 title={isListening ? "Stop listening" : "Voice input"}
               >
                  {isRequestingMic ? (
                      <Loader2 size={20} className="animate-spin" />
                  ) : isListening ? (
                      <Square size={18} fill="currentColor" />
                  ) : (
                      <Mic size={20} />
                  )}
               </button>
               
               {(input.trim() || selectedImage) && (
                 <button
                    type="submit"
                    disabled={disabled}
                    className="p-2 rounded-full bg-black dark:bg-[#E3E3E3] text-white dark:text-black hover:opacity-90 transition-opacity animate-in fade-in zoom-in duration-200"
                  >
                    <Send size={18} />
                  </button>
               )}
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};