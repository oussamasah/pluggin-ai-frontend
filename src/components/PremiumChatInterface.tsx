// components/PremiumChatInterface.tsx
'use client'

import { useState, useRef, useEffect, useMemo, useCallback, SetStateAction } from 'react'
import { useSession } from '@/context/SessionContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  User,
  WifiOff,
  Target,
  Cpu,
  Search,
  Mic,
  ArrowUp,
  Plus,
  FileText,
  BrainCircuit,
  MessageCircle,
  Zap,
  Crown,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ProcessingWorkflow from './ProcessingWorkflow'
import EnhancedResponse from './EnhancedResponse'
import { useTypingText } from '@/context/hooks/useTypingText'
import { searchModeTexts } from '@/types'
import { formatAIText } from '@/context/hooks/formatAIText'
import { webSocketService } from '@/lib/services/WebSocketService'
import { useTheme } from '@/context/ThemeContext'

interface FormattingOptions {
  preserveLineBreaks?: boolean;
  className?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Brand Colors
const ACCENT_GREEN = '#006239' // Primary brand green
const ACTIVE_GREEN = '#006239' // User chat bubbles & active states

export function PremiumChatInterface() {
  // State hooks - KEEP ALL ORIGINAL FEATURES
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchType, setSearchType] = useState<string>(
    localStorage.getItem("searchType") ?? "search"
  )
  const [searchCount, setSearchCount] = useState(  localStorage.getItem("searchcount") ?? "1"); // Default to 10


 
// Add this handler function
const handleSearchCountChange = (count: SetStateAction<string>) => {
  localStorage.setItem(`searchcount`, count.toString());

  setSearchCount(count);
};
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [showUploadAnimation, setShowUploadAnimation] = useState(false)
  const [activeCommandCategory, setActiveCommandCategory] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
 const { theme } = useTheme()
 const { refreshSessions } = useSession()
  // Context hooks - KEEP ALL ORIGINAL FUNCTIONALITY
  const { 
    currentSession, 
    startSearch, 
    icpModels, 
    primaryModel, 
    isConnected,
    updateSessionQuery,
    refineSearch,
    analyzeSignals,
    handleResultsAction
  } = useSession()

  // Ref hooks
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Custom hooks
  const searchModeText = searchModeTexts[searchType] || searchModeTexts.default
  const typedText = useTypingText(searchModeText, 100)

  // Conversation management - KEEP ORIGINAL LOGIC
  const getCurrentQuery = useCallback((session: any): string => {
    if (!session?.query) return ''
    if (Array.isArray(session.query)) {
      return session.query[session.query.length - 1] || ''
    }
    return session.query || ''
  }, [])

  const [localConversation, setLocalConversation] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const conversationRef = useRef(localConversation);

  useEffect(() => {
    conversationRef.current = localConversation;
  }, [localConversation]);
  
  const addMessageToChat = useCallback((role: 'user' | 'assistant', content: string) => {
    if (!currentSession) {
      console.log('❌ No current session available');
      return;
    }
    
    const newMessage = { role, content };
    const allMessages = [...conversationRef.current, newMessage];
    
    setLocalConversation(allMessages);
    
    const updatedQueries = allMessages.map(msg => 
      `CHAT_${msg.role.toUpperCase()}: ${msg.content}`
    );
    
    console.log('💬 Sending to backend:', updatedQueries);
    updateSessionQuery(currentSession.id, updatedQueries);
  }, [currentSession, updateSessionQuery]);
  useEffect(() => {
    refreshSessions()
  }, [refreshSessions])
  useEffect(() => {
   
    
    if (currentSession?.query) {
      const queries = Array.isArray(currentSession.query) 
        ? currentSession.query 
        : [currentSession.query];
      
      const messages = queries.map(query => {
        if (query.startsWith('CHAT_USER: ')) {
          return { role: 'user' as const, content: query.replace('CHAT_USER: ', '') };
        } else if (query.startsWith('CHAT_ASSISTANT: ')) {
          return { role: 'assistant' as const, content: query.replace('CHAT_ASSISTANT: ', '') };
        }
        return { role: 'user' as const, content: query };
      });
      
      setLocalConversation(messages);
    }
  }, [currentSession?.id,currentSession?.query]);

  const updateConversationContext = useCallback((classification: any) => {
    if (currentSession?.id) {
      localStorage.setItem(`conversation-context-${currentSession.id}`, JSON.stringify(classification));
    }
  }, [currentSession?.id])

  const chatMessages: ChatMessage[] = useMemo(() => {
    return localConversation.map((msg, index) => ({
      id: `chat-${currentSession?.id || 'no-session'}-${index}-${Date.now()}`,
      content: msg.content,
      role: msg.role,
      timestamp: new Date()
    }));
  }, [localConversation, currentSession?.id])

  const hasMessages = chatMessages.length > 0
  const placeholderText = hasMessages ? "Continue conversation..." : "Describe your ideal investment targets..."

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, scrollToBottom])

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    if (currentSession?.id) {
      const savedContext = localStorage.getItem(`conversation-context-${currentSession.id}`);
      if (savedContext) {
        try {
          const classification = JSON.parse(savedContext);
          console.log('✅ Loaded conversation context:', classification);
        } catch (error) {
          console.error('Error loading conversation context:', error);
        }
      }
    }
  }, [currentSession?.id])

  const executeAction = useCallback(async (action: any, classification: any, sessionId: string) => {
    if (!action) return

    try {
      switch (action.type) {
        case 'start_search':
          await startSearch(sessionId, action.query, primaryModel?.id)
          break;
        case 'refine_search':
          if (typeof refineSearch === 'function') {
          //  await refineSearch(sessionId, action.query, action.previous_query)
          await startSearch(sessionId, action.query, primaryModel?.id)

          } else {
            console.warn('refineSearch function not available, using startSearch instead')
            await startSearch(sessionId, action.query, primaryModel?.id)
          }
          break;
        case 'analyze_signals':
          if (typeof analyzeSignals === 'function') {
            await analyzeSignals(sessionId, action.scope)
          } else {
            console.warn('analyzeSignals function not available')
          }
          break;
        case 'handle_results':
          if (typeof handleResultsAction === 'function') {
            await handleResultsAction(sessionId, action.action_type)
          } else {
            console.warn('handleResultsAction function not available')
          }
          break;
        case 'respond_only':
          console.log('Response only action completed')
          break;
        default:
          console.warn('Unknown action type:', action.type)
      }
    
      await refreshSessions()
    
    } catch (error) {
      console.error('Error executing action:', error)
    }
  }, [startSearch, refineSearch, analyzeSignals, handleResultsAction, primaryModel?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !currentSession || isLoading) return

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true)
    
    try {
      console.log('👤 Adding user message:', userMessage);
      addMessageToChat('user', userMessage)
      
      const lastClassification = currentSession.id ? 
        localStorage.getItem(`conversation-context-${currentSession.id}`) : null
      
      const context = {
        history: localConversation.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date()
        })),
        lastIntent: lastClassification ? JSON.parse(lastClassification) : null,
        searchContext: currentSession ? {
          currentQuery: getCurrentQuery(currentSession),
          resultsCount: currentSession.resultsCount || 0,
          activeFilters: {}
        } : null
      }

      console.log('📤 Sending to backend with context:', context);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classify-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: currentSession.id,
          icpModelId: primaryModel?.id,
          context
        })
      })

      if (!response.ok) throw new Error('Intent classification failed')
      
      const classificationResponse = await response.json()
      const { classification, response: aiResponse, action } = classificationResponse
      
      console.log('🤖 AI Response received:', aiResponse);
      
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);
      
      await addMessageToChat('assistant', aiResponse)
      await updateConversationContext(classification)
      await executeAction(action, classification, currentSession.id)
      
    } catch (error) {
      console.error('Error processing message:', error)
      addMessageToChat('assistant', 'Sorry, I encountered an error processing your request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function parseContent(
    content: string, 
    options: FormattingOptions = {}
  ): React.ReactElement {
    const { preserveLineBreaks = false, className = '' } = options;
    
    if (!content) return <></>;
    
    const elements: React.ReactNode[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        if (preserveLineBreaks) {
          elements.push(<br key={`br-${lineIndex}`} />);
        }
        return;
      }
      
      if (trimmedLine === '---') {
        elements.push(
          <hr 
            key={`hr-${lineIndex}`} 
            className="my-6 border-gray-200 dark:border-[#2A2A2A]" 
          />
        );
        return;
      }
      
      if (trimmedLine.startsWith('* ')) {
        const text = trimmedLine.substring(2);
        elements.push(
          <div key={`bullet-${lineIndex}`} className="flex items-start mb-2">
            <span 
              className="w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0" 
              style={{ backgroundColor: ACTIVE_GREEN }}
            />
            <span className="text-gray-700 dark:text-[#9CA3AF] leading-relaxed">
              {formatBoldText(text)}
            </span>
          </div>
        );
        return;
      }
      
      elements.push(
        <p key={`p-${lineIndex}`} className="mb-3 leading-relaxed text-gray-700 dark:text-[#9CA3AF] last:mb-0">
          {formatBoldText(trimmedLine)}
        </p>
      );
    });
    
    return <div className={cn("space-y-2", className)}>{elements}</div>;
  }
  
  function formatBoldText(text: string): React.ReactNode {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-gray-900 dark:text-[#EDEDED]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  }
  
  const handleUploadFile = () => {
    setShowUploadAnimation(true)
    setTimeout(() => {
      const newFile = `Company_Data_${Date.now()}.csv`
      setUploadedFiles((prev) => [...prev, newFile])
      setShowUploadAnimation(false)
    }, 1500)
  }

  const handleSearchTypeChange = (type: string) => {
    localStorage.setItem("searchType", type)
    setSearchType(type)
  }

  const ConversationDebug = () => {
    useEffect(() => {
      console.log('=== CONVERSATION DEBUG ===');
      console.log('🔍 Current Session ID:', currentSession?.id);
      console.log('🔍 Session Query:', currentSession?.query);
      console.log('🔍 Local Conversation:', localConversation);
      console.log('🔍 Chat Messages:', chatMessages);
      console.log('🔍 Has Messages:', hasMessages);
      console.log('=== END DEBUG ===');
    }, [currentSession, localConversation, chatMessages, hasMessages]);
    
    return null;
  }

  useEffect(() => {
    const handleSearchComplete = async(data: any) => {
    
      const { sessionId, companies, resultsCount, summary } = data;
      console.log('✅ Search complete:', { sessionId, resultsCount })
      addMessageToChat('assistant', summary);
      await refreshSessions()
    };
  
    webSocketService.on('search-complete', handleSearchComplete);
  
    return () => {
      webSocketService.off('search-complete', handleSearchComplete);
    };
  }, [addMessageToChat]);
  
  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0F0F0F] min-h-screen">
      <ConversationDebug />
   
      {JSON.stringify(currentSession)}
      {hasMessages && (
        <div className={cn(
          "px-6 py-4 border-b backdrop-blur-sm",
          "bg-white/80 dark:bg-[#0F0F0F]/80",
          "border-gray-200 dark:border-[#2A2A2A]"
        )}>
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                
              >
             
             {theme=="dark"?<img 
  src="/plauging-ai-dark.png" 
  alt="Crown" 
  className=""
/>:<img 
  src="/plauging-ai-light.png" 
  alt="Crown" 
  className=""
/>}   
      
              </div>
              <div>
                <h1 className="text-sm font-medium text-gray-900 dark:text-[#EDEDED]">
                  GTM Intelligence
                </h1>
                <p className="text-xs text-gray-500 dark:text-[#9CA3AF] font-light">
                  {chatMessages.filter(m => m.role === 'user').length} messages • Active session
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: ACTIVE_GREEN }}
              />
              <span className="text-xs text-gray-600 dark:text-[#9CA3AF] font-medium">Live</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area - UPDATED STYLE */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        "bg-white dark:bg-[#0F0F0F]",
        hasMessages ? "flex-1" : "flex-1 flex items-center justify-center"
      )}>
        <div className={cn(
          "h-full overflow-y-auto",
          hasMessages ? "px-4 py-6" : "w-full"
        )}>
          <div className={cn(
            "mx-auto space-y-6",
            hasMessages ? "max-w-3xl" : "w-full max-w-3xl px-6"
          )}>
            <AnimatePresence initial={false} mode="wait">
              {/* Chat Messages - UPDATED STYLE */}
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={currentSession?.id+"-"+msg.id+"-"+msg.timestamp}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={cn(
                    "flex gap-4",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-[#1E1E1E] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex flex-col gap-2 max-w-[85%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl",
                      msg.role === 'user' 
                        ? cn(
                            "bg-[#F3F4F6] dark:bg-[#1E1E1E] text-white text-gray-900 dark:text-[#EDEDED]  rounded-br-md"
                          )
                        : cn(
                            "bg-[#F3F4F6] dark:bg-[#1E1E1E] text-gray-900 dark:text-[#EDEDED] rounded-bl-md"
                          )
                    )}
                    style={{
                    
                    }}
                    >
                      <div className="text-sm leading-6 font-light">
                        {parseContent(msg.content)}
                      </div>
                    </div>
                    <div className={cn(
                      "text-xs font-light tracking-wide px-1",
                      msg.role === 'user' 
                        ? "text-gray-500 dark:text-[#9CA3AF] text-right" 
                        : "text-gray-500 dark:text-[#9CA3AF] text-left"
                    )}>
                      {msg.role === 'user' ? 'You' : 'Analyst'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Animation - UPDATED STYLE */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-[#1E1E1E] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl rounded-bl-md",
                    "bg-[#F3F4F6] dark:bg-[#1E1E1E]"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-gray-400"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-gray-400"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-gray-400"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-[#9CA3AF] font-light">
                        Analyzing your request...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Current Processing Status - KEEP ORIGINAL */}
              {(currentSession?.searchStatus?.stage === "searching" || 
  currentSession?.searchStatus?.stage === "refine_search") && (
  <motion.div
    key={`workflow-${currentSession?.id}`}  // Changed: Force complete re-render on session change
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-start gap-4"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-[#1E1E1E] flex items-center justify-center">
      <Bot className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    </div>
    <div className="px-4 py-2">
      <div className="flex items-center gap-3 mb-4">
        {!isConnected && (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-3 py-1 font-medium tracking-wide">
            Connecting...
          </span>
        )}
      </div>
      <ProcessingWorkflow key={currentSession?.id} /> {/* Keep this key too */}
    </div>
  </motion.div>
)}

              {/* Centered Empty State - UPDATED STYLE */}
              {!hasMessages && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center w-full"
                >
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div 
                        className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                        style={{ backgroundColor: ACCENT_GREEN }}
                      >
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-light text-gray-900 dark:text-[#EDEDED] tracking-tight">
                        GTM Intelligence Platform
                      </h2>
                      <p className="text-gray-600 dark:text-[#9CA3AF] text-lg font-light leading-relaxed max-w-2xl mx-auto">
                        Describe the companies, markets, or investment opportunities you want to explore. 
                        I'll help you find the most promising targets with detailed analysis and insights.
                      </p>
                    </div>
                    
                    <div className={cn(
                      "rounded-2xl p-6 text-left max-w-2xl mx-auto",
                      "bg-[#F9FAFB] dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A]"
                    )}>
                      <div className="text-gray-700 dark:text-[#9CA3AF] text-sm leading-6 font-light">
                        {typedText}
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-gray-500 dark:text-[#6B7280] text-xs font-light">
                        <Zap className="w-3 h-3" />
                        Start by describing your investment thesis or target criteria
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - UPDATED STYLE */}
      <div className={cn(
        "border-0 bg-white dark:bg-[#0F0F0F] sticky bottom-0 z-50",
        "border-gray-200 dark:border-0",
        hasMessages ? "pt-4 pb-6" : "pt-8 pb-8"
      )}>
        <div className="max-w-3xl mx-auto px-4">
          {/* Search Type Selector - KEEP ORIGINAL FEATURE */}
        

          {/* Uploaded Files - KEEP ORIGINAL */}
          {uploadedFiles.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                      "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
                      "border border-green-200 dark:border-green-800"
                    )}
                  >
                    <FileText className="w-3 h-3" />
                    <span className="font-light">{file}</span>
                    <button
                      onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}
                      className="text-green-600 dark:text-[#006239] hover:text-green-700 dark:hover:text-green-300 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Container - UPDATED STYLE */}
          <div className={cn(
            "rounded-2xl border shadow-sm overflow-hidden",
            "bg-[#F9FAFB] dark:bg-[#1A1A1A]",
            "border-gray-200 dark:border-[#2A2A2A]",
            "focus-within:ring-1 focus-within:ring-[#006239] focus-within:border-transparent",
            "transition-all duration-200"
          )}>
            <div className="px-4 py-3">
              <textarea
                ref={textareaRef}
                placeholder={placeholderText}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={1}
                className={cn(
                  "w-full resize-none bg-transparent outline-none placeholder:font-light",
                  "text-gray-900 dark:text-[#EDEDED] placeholder:text-gray-500 dark:placeholder:text-[#9CA3AF]",
                  "text-sm leading-5 max-h-32"
                )}
                disabled={!isConnected || isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            {/* Action Bar - KEEP ALL ORIGINAL BUTTONS */}
            <div className={cn(
              "px-4 py-3 flex items-center justify-between border-t",
              "border-gray-200 dark:border-[#2A2A2A]",
              "bg-white/50 dark:bg-[#0F0F0F]/50"
            )}>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleUploadFile}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    "text-gray-500 dark:text-[#9CA3AF] hover:text-gray-700 dark:hover:text-[#EDEDED]",
                    "hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                  )}
                  disabled={!isConnected}
                >
                  {showUploadAnimation ? (
                    <motion.div
                      className="flex space-x-1"
                      initial="hidden"
                      animate="visible"
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#006239]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>

                <button
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    "text-gray-500 dark:text-[#9CA3AF] hover:text-gray-700 dark:hover:text-[#EDEDED]",
                    "hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                  )}
                  disabled={!isConnected}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!message.trim() || !isConnected || isLoading}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  "flex items-center justify-center",
                  message.trim() && isConnected && !isLoading && primaryModel
                    ? cn(
                        "text-white",
                        "hover:shadow-lg transform hover:scale-105"
                      )
                    : cn(
                        "text-gray-400 dark:text-[#6B7280]",
                        "cursor-not-allowed"
                      )
                )}
                style={{
                  backgroundColor: message.trim() && isConnected && !isLoading ? ACTIVE_GREEN : undefined
                }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
<div className='flex justify-between items-center'>
          {/* Active ICP Model Badge - KEEP ORIGINAL */}
          {primaryModel && isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 text-sm  justify-center"
            >
              <span className="text-gray-500 dark:text-[#9CA3AF] font-light tracking-wide">
                ACTIVE MODEL:
              </span>
              <span className={cn(
                "bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-[#9CA3AF]",
                "border-gray-300 dark:border-[#2A2A2A] hover:border-green-300 hover:text-green-600 dark:hover:text-[#006239]"
        )}>
                {primaryModel.name}
              </span>
            </motion.div>
          )}
            <div className="flex items-center gap-2 justify-center">
    <span className="text-xs text-gray-600 dark:text-[#9CA3AF] font-medium">Results:</span>
    <select
      value={searchCount}
      onChange={(e) => handleSearchCountChange(e.target.value)}
      className={cn(
        "px-2 py-1 text-xs font-medium tracking-wide transition-all duration-300 rounded-lg border",
        "bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-[#9CA3AF]",
        "border-gray-300 dark:border-[#2A2A2A] focus:border-green-300 focus:ring-1 focus:ring-green-300",
        "focus:outline-none"
      )}
    >
      <option value={"1"}>1</option>
      <option value={"10"}>10</option>
      <option value={"25"}>25</option>
      <option value={"50"}>50</option>
      <option value={"70"}>70</option>
      <option value={"100"}>100</option>
      <option value={"200"}>200</option>
      <option value={"500"}>500</option>
      <option value={"1000"}>1000</option>
    </select>
  </div>
  <div className="flex items-center gap-2 mt-2 justify-center">
            <button
              onClick={() => handleSearchTypeChange("search")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-300 rounded-lg border",
                searchType === "search"
                  ? cn(
                      "text-white border-transparent"
                    )
                  : cn(
                      "bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-[#9CA3AF]",
                      "border-gray-300 dark:border-[#2A2A2A] hover:border-green-300 hover:text-green-600 dark:hover:text-[#006239]"
                    )
              )}
              style={{
                backgroundColor: searchType === "search" ? ACTIVE_GREEN : undefined
              }}
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </button>
            <button
              onClick={() => handleSearchTypeChange("deepResearch")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-300 rounded-lg border",
                searchType === "deepResearch"
                  ? cn(
                      "text-white border-transparent"
                    )
                  : cn(
                      "bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-[#9CA3AF]",
                      "border-gray-300 dark:border-[#2A2A2A] hover:border-green-300 hover:text-green-600 dark:hover:text-[#006239]"
                    )
              )}
              style={{
                backgroundColor: searchType === "deepResearch" ? ACTIVE_GREEN : undefined
              }}
            >
              <Target className="w-3 h-3" />
              <span>Deep</span>
            </button>
            <button
              onClick={() => handleSearchTypeChange("reasoning")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-300 rounded-lg border",
                searchType === "reasoning"
                  ? cn(
                      "text-white border-transparent"
                    )
                  : cn(
                      "bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-[#9CA3AF]",
                      "border-gray-300 dark:border-[#2A2A2A] hover:border-green-300 hover:text-green-600 dark:hover:text-[#006239]"
                    )
              )}
              style={{
                backgroundColor: searchType === "reasoning" ? ACTIVE_GREEN : undefined
              }}
            >
              <BrainCircuit className="w-3 h-3" />
              <span>Reasoning</span>
            </button>
          </div>
          </div>
          {/* Connection Warning - KEEP ORIGINAL */}
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 text-sm mt-6 justify-center"
            >
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900">
                <WifiOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-yellow-700 dark:text-yellow-300 font-medium tracking-wide">
                Establishing secure connection to analysis engine...
              </span>
            </motion.div>
          )}


        </div>
      </div>
    </div>
  );
}