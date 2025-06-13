import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Mic, MicOff, Send, X, Volume2, VolumeX, Zap, Sparkles, MessageCircle, Loader2, MapPin, BadgeHelp } from 'lucide-react';
import { WhispaSpeechManager } from '@/engines/WhispaSpeechManager';
import { useWhispaAIMutation } from '@/hooks/api-hooks';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

// Memoized Message Component
const Message = React.memo(({ message, isStreaming }: { message: { type: string; content: string }; isStreaming?: boolean }) => (
  <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${message.type === 'user'
        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
        : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-orange-500/20'
        }`}
    >
      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
        {message.content}
        {isStreaming && <span className="animate-pulse">|</span>}
      </p>
    </div>
  </div>
));

Message.displayName = 'Message';

// Memoized Messages Container
const MessagesContainer = React.memo(({ 
  messages, 
  isStreaming, 
  currentStreamMessage 
}: { 
  messages: Array<{ type: string; content: string; timestamp: Date }>;
  isStreaming: boolean;
  currentStreamMessage: string;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamMessage]);

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-none scroll-mt-16 overscroll-none">
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}

      {isStreaming && currentStreamMessage && (
        <Message message={{ type: 'ai', content: currentStreamMessage }} isStreaming />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
});

MessagesContainer.displayName = 'MessagesContainer';

const Greetings = [
  `Hey! It's ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}. How's your day going? 😊`,
  "Ready to help you find what you need! What can I do for you today? ✨",
  "Welcome back! I'm here to make your shopping experience better. How can I assist? 🛍️",
  "Hello! I'm your shopping buddy. What would you like to explore today? 🌟",
  "Hi there! Need help finding something special? I'm here to help! 🎯"
];

const _suggestedActions = [
  { icon: Sparkles, text: "Find nearby sellers", action: "find-nearby-sellers" },
  { icon: MessageCircle, text: "Browse popular products", action: "browse-popular-products" },
]

const NextGreeting = Greetings[Math.floor(Math.random() * Greetings.length)];

const Whispa = ({ isInNav = false }: { isInNav?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Array<{ type: string; content: string; timestamp: Date }>>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentStreamMessage, setCurrentStreamMessage] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState(_suggestedActions);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const { profile } = useAuth();
  
  const { detectLocation: requestLocationPermissions, isLocationServicesAllowed, isDetecting } = useLocation();

  const { mutateAsync: whisperAI, isPending: isWhisperAIPending, error } = useWhispaAIMutation();

  const speechManagerRef = useRef<WhispaSpeechManager | null>(null);

  // Memoize mobile detection
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  }, []);

  // Initialize SpeechManager
  useEffect(() => {
    speechManagerRef.current = new WhispaSpeechManager({
      voiceGender: 'female',
      voiceName: 'Aisha',
      rate: 0.9,
      pitch: 1.15,
      volume: 0.85,
      language: 'en-US',
      interimResults: true,
      personality: 'professional',
      responseStyle: 'conversational',
      enthusiasm: 0.8,
      onSpeechStart: () => {
        setIsRecording(true);
        setIsListening(true);
      },
      onSpeechEnd: () => {
        setIsRecording(false);
        setIsListening(false);
      },
      onSpeechResult: (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setTimeout(() => handleSendMessage(transcript), 100);
        }
      },
      onSpeechError: (error) => {
        console.error('Speech error:', error);
        setIsRecording(false);
        setIsListening(false);
        if (error === 'Permission denied') {
          alert('Please allow microphone access to use speech recognition.');
        }
      },
      onSpeakStart: () => setIsSpeaking(true),
      onSpeakEnd: () => setIsSpeaking(false),
    });

    return () => {
      if (speechManagerRef.current) {
        speechManagerRef.current.destroy();
      }
    };
  }, []);

  // Show greeting on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowGreeting(false), 5000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Memoize handlers
  const startListening = useCallback(async () => {
    if (speechManagerRef.current && !isRecording && !isStreaming) {
      // Stop any ongoing AI speech before starting user speech
      if (isSpeaking) {
        speechManagerRef.current.stopSpeaking();
      }
      await speechManagerRef.current.startListening();
    }
  }, [isRecording, isStreaming, isSpeaking]);

  const stopListening = useCallback(() => {
    if (speechManagerRef.current && isRecording) {
      speechManagerRef.current.stopListening();
    }
  }, [isRecording]);

  const stopSpeaking = useCallback(() => {
    if (speechManagerRef.current) {
      speechManagerRef.current.stopSpeaking();
    }
  }, []);

  const simulateAiResponse = useCallback(async (userMessage: string) => {
    // Don't start speaking if user is currently speaking
    if (isRecording) {
      return;
    }

  
    
    let intelligence = await whisperAI({ message: userMessage })


    let fullResponse = intelligence.response.concat("\n\n",intelligence.follow_up_questions?.join("\n") ?? "") || "Sorry, There's an issue processing your request. Pleae try again"
    let actions = intelligence.user_guidance.suggestions;

    setIsStreaming(true);
    setCurrentStreamMessage('');

    const streamResponse = async () => {
      const chunkSize = 3; // Process multiple characters at once for smoother animation
      for (let i = 0; i <= fullResponse.length; i += chunkSize) {
        if (isRecording) {
          setIsStreaming(false);
          setCurrentStreamMessage('');
          return;
        }

        const chunk = fullResponse.substring(0, Math.min(i + chunkSize, fullResponse.length));
        setCurrentStreamMessage(chunk);
        await new Promise(resolve => setTimeout(resolve, 50)); // Slightly faster for better UX
      }
    };

    await streamResponse();

    setIsStreaming(false);

    const aiMessage = {
      type: 'ai',
      content: fullResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setCurrentStreamMessage('');
    setSuggestedActions(actions.map(it => ({
      action: it.replace(" ", "_"),
      icon: Sparkles,
      text: it
    })))
    
    // Only speak if user is not speaking
    if (audioEnabled && speechManagerRef.current && !isRecording) {
      setTimeout(() => speechManagerRef.current?.speak(fullResponse), 500);
    }
  }, [audioEnabled, isRecording, whisperAI]);

  const handleSendMessage = useCallback(async (text = inputText) => {
    if (!text.trim()) return;

    // Stop any ongoing AI speech before sending user message
    if (speechManagerRef.current && isSpeaking) {
      speechManagerRef.current.stopSpeaking();
    }

    const userMessage = {
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSuggestedActions([])

    await simulateAiResponse(text);
  }, [inputText, simulateAiResponse, isSpeaking]);

  const handleSuggestedAction = useCallback((action: string) => {
    const actionText = suggestedActions.find(a => a.action === action)?.text || action;
    handleSendMessage(actionText);
  }, [suggestedActions, handleSendMessage]);

  const checkLocationPermission = useCallback(async () => {
    if (!profile?.location) {
      setShowLocationModal(true);
      return false;
    }
    return true;
  }, [profile?.location]);

  const handleLocationPermission = useCallback(async () => {
    await requestLocationPermissions();
    if (isLocationServicesAllowed) {
      setShowLocationModal(false);
      return true;
    }
    return false;
  }, [requestLocationPermissions, isLocationServicesAllowed]);

  const toggleBubble = useCallback(async () => {
    if (!isOpen) {
      const hasLocation = await checkLocationPermission();
      if (!hasLocation) return;
    }
    
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      setTimeout(() => {
        const welcomeMsg = {
          type: 'ai',
          content: "Welcome! I'm Whispa, your intelligent assistant for all things MeetnMart. Ask me to find sellers, search products, or explore local markets. How can I assist today?",
          timestamp: new Date()
        };
        setMessages([welcomeMsg]);
        if (audioEnabled && speechManagerRef.current) {
          speechManagerRef.current.speak(welcomeMsg.content);
        }
      }, 300);
    }
  }, [isOpen, messages.length, audioEnabled, checkLocationPermission]);

  // Optimized container positioning and sizing
  const containerPositioning = useMemo(() => {
    if (isInNav) {
      return "relative";
    }
    return "fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6";
  }, [isInNav]);

  // Optimized bubble positioning and sizing
  const bubbleStyles = useMemo(() => {
    const baseStyles = "relative group cursor-pointer";
    return baseStyles;
  }, []);

  // Optimized chat container styles with better mobile handling
  const chatContainerStyles = useMemo(() => {
    if (isMobile && !isInNav) {
      return "fixed inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col z-50";
    }
    
    if (isInNav) {
      return cn("fixed bottom-5 right-5 w-[min(96vw,24rem)] max-h-[min(90vh,32rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl sm:rounded-3xl shadow-2xl border border-orange-500/20 backdrop-blur-xl overflow-hidden flex flex-col z-40", "min-h-[98vh] left-1 sm:left-auto w-[98%] bottom-1");
    }
    
    return "fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[min(96vw,24rem)] max-h-[min(85vh,32rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl sm:rounded-3xl shadow-2xl border border-orange-500/20 backdrop-blur-xl overflow-hidden flex flex-col z-40";
  }, [isMobile, isInNav]);

  // Optimized bubble size
  const bubbleSize = useMemo(() => {
    if (isInNav) return "w-14 h-14";
    return "w-12 h-12 sm:w-14 sm:h-14";
  }, [isInNav]);

  // Optimized icon size
  const iconSize = useMemo(() => {
    if (isInNav) return "w-8 h-8";
    return "w-6 h-6 sm:w-7 sm:h-7";
  }, [isInNav]);

  return (
    <div className={containerPositioning}>
      {/* Main AI Bubble Button */}
      {!isOpen && (
        <div
          onClick={toggleBubble}
          className={bubbleStyles}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>

          <div className={`${bubbleSize} bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-12 border-2 border-orange-300/30 relative`}>
            <BadgeHelp className={`${iconSize} text-white animate-pulse`} />

            {!isInNav && (
              <>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-300 rounded-full animate-bounce opacity-60"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-400 rounded-full animate-bounce opacity-80" style={{ animationDelay: '0.5s' }}></div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className={chatContainerStyles}>
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 p-3 sm:p-4 border-b border-orange-500/20 flex-shrink-0 ">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold text-sm sm:text-base truncate">Whispa</h3>
                  <p className="text-orange-300 text-xs hidden sm:block truncate">{NextGreeting}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="p-1.5 sm:p-2 text-orange-300 hover:text-white transition-colors rounded-lg hover:bg-orange-500/10"
                  aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10"
                    aria-label="Stop speaking"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={toggleBubble}
                  className="p-1.5 sm:p-2 text-orange-300 hover:text-white transition-colors rounded-lg hover:bg-orange-500/10"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <MessagesContainer 
            messages={messages}
            isStreaming={isStreaming}
            currentStreamMessage={currentStreamMessage}
          />

          {/* Suggested Actions */}
          {suggestedActions.length > 0 && (
            <div className="px-3 sm:px-4 py-2 flex-shrink-0">
              <p className="text-orange-300 text-xs mb-2 font-medium">Try asking:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {suggestedActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedAction(action.action)}
                    className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-full text-orange-300 text-xs transition-all duration-200 hover:scale-105 hover:text-white"
                  >
                    <action.icon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-orange-500/20 bg-gradient-to-r from-gray-800/50 to-gray-900/50 mt-auto flex-shrink-0">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type or speak your message..."
                  className="scrollbar-none w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-orange-500/30 rounded-xl sm:rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none min-h-[44px] sm:min-h-[48px] max-h-[120px] sm:max-h-[140px] overflow-y-auto text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm overscroll-none"
                  rows={1}
                  disabled={isStreaming}
                />

                {isRecording && (
                  <div className="absolute right-3 top-3">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-x-1.5 sm:gap-x-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isStreaming || isRecording}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-200 flex-shrink-0 ${isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-300 hover:text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isStreaming || isRecording || isWhisperAIPending}
                  className="p-2.5 sm:p-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl sm:rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex-shrink-0"
                  aria-label="Send message"
                >
                  {isWhisperAIPending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Greeting Notification - Hidden on mobile when chat is open */}
      {showGreeting && !isOpen && !isInNav && (
        <div className={`absolute bottom-16 sm:bottom-20 right-0 transform transition-all duration-500 ${showGreeting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-orange-500/30 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg max-w-[280px] sm:max-w-[320px]">
            <div className="flex items-center space-x-2">
              <span className="text-orange-400 font-semibold text-xs sm:text-sm flex-shrink-0">Whispa</span>
              <span className="text-gray-200 text-xs sm:text-sm truncate">{NextGreeting}</span>
            </div>
          </div>
        </div>
      )}

      {/* Location Permission Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[min(95vw,28rem)] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-800 to-gray-900 text-gray-50 border border-orange-500/20 rounded-xl shadow-2xl p-4 sm:p-6 z-[100]">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg flex-shrink-0">
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Location Required
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-300 space-y-4">
              <p className="text-sm sm:text-base leading-relaxed">
                To provide you with the best experience, we need your location to:
              </p>
              <ul className="space-y-2 sm:space-y-3 pl-4">
                <li className="flex items-center gap-2 text-gray-200 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  Find nearby sellers and products
                </li>
                <li className="flex items-center gap-2 text-gray-200 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  Show relevant local markets
                </li>
                <li className="flex items-center gap-2 text-gray-200 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  Enable accurate delivery tracking
                </li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 pt-4 border-t border-gray-700/50">
            <Button
              variant="outline"
              onClick={() => setShowLocationModal(false)}
              className="border-gray-600 hover:bg-gray-700/50 transition-colors w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all hover:scale-105 w-full sm:w-auto order-1 sm:order-2"
              onClick={handleLocationPermission}
              disabled={isDetecting}
            >
              {isDetecting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait...</span>
                </div>
              ) : (
                "Enable Location"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(Whispa);