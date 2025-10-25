// components/PremiumChatInterface.tsx
'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
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
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ProcessingWorkflow from './ProcessingWorkflow'
import EnhancedResponse from './EnhancedResponse'
import { useTypingText } from '@/context/hooks/useTypingText'
import { searchModeTexts } from '@/types'
import { formatAIText } from '@/context/hooks/formatAIText'
import { webSocketService } from '@/lib/services/WebSocketService'
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

export function PremiumChatInterface() {
  // ✅ ALL HOOKS AT TOP LEVEL - IN SAME ORDER EVERY RENDER
  
  // 1. State hooks
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchType, setSearchType] = useState<string>(
    localStorage.getItem("searchType") ?? "search"
  )
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [showUploadAnimation, setShowUploadAnimation] = useState(false)
  const [activeCommandCategory, setActiveCommandCategory] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false) // ✅ New state for typing animation

  // 2. Context hooks
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

  // 3. Ref hooks
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 4. Custom hooks
  const searchModeText = searchModeTexts[searchType] || searchModeTexts.default
  const typedText = useTypingText(searchModeText, 100)

  // ✅ FIXED CONVERSATION MANAGEMENT FUNCTIONS
  const getCurrentQuery = useCallback((session: any): string => {
    if (!session?.query) return ''
    if (Array.isArray(session.query)) {
      return session.query[session.query.length - 1] || ''
    }
    return session.query || ''
  }, [])

  // ✅ FIXED: Use local state to track conversation to avoid race conditions
  const [localConversation, setLocalConversation] = useState<{role: 'user' | 'assistant', content: string}[]>([]);

  const conversationRef = useRef(localConversation);

  // Keep ref in sync with state
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
    
    // Update local state
    setLocalConversation(allMessages);
    
    // Update backend with the complete conversation
    const updatedQueries = allMessages.map(msg => 
      `CHAT_${msg.role.toUpperCase()}: ${msg.content}`
    );
    
    console.log('💬 Sending to backend:', updatedQueries);
    updateSessionQuery(currentSession.id, updatedQueries);
    
  }, [currentSession, updateSessionQuery]);

  // ✅ Load conversation from session when it changes
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
  }, [currentSession?.id]); // Only reload when session ID changes

  const updateConversationContext = useCallback((classification: any) => {
    if (currentSession?.id) {
      localStorage.setItem(`conversation-context-${currentSession.id}`, JSON.stringify(classification));
    }
  }, [currentSession?.id])

  // ✅ FIXED CHAT MESSAGES - Use local conversation state
  const chatMessages: ChatMessage[] = useMemo(() => {
    return localConversation.map((msg, index) => ({
      id: `chat-${currentSession?.id || 'no-session'}-${index}-${Date.now()}`,
      content: msg.content,
      role: msg.role,
      timestamp: new Date()
    }));
  }, [localConversation, currentSession?.id])

  // ✅ DERIVED VALUES
  const hasMessages = chatMessages.length > 0
  const placeholderText = hasMessages ? "CONTINUE CONVERSATION..." : "DESCRIBE THE COMPANIES YOU WANT TO FIND..."

  // ✅ EFFECT HOOKS
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, currentSession?.searchStatus, scrollToBottom])

  // ✅ Focus input after response
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // ✅ LOAD CONVERSATION CONTEXT ON MOUNT
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

  // ✅ ACTION EXECUTION FUNCTION
  const executeAction = useCallback(async (action: any, classification: any, sessionId: string) => {
    if (!action) return

    try {
      switch (action.type) {
        case 'start_search':
          await startSearch(sessionId, action.query, primaryModel?.id)
          break
          
        case 'refine_search':
          if (typeof refineSearch === 'function') {
            await refineSearch(sessionId, action.query, action.previous_query)
          } else {
            console.warn('refineSearch function not available, using startSearch instead')
            await startSearch(sessionId, action.query, primaryModel?.id)
          }
          break
          
        case 'analyze_signals':
          if (typeof analyzeSignals === 'function') {
            await analyzeSignals(sessionId, action.scope)
          } else {
            console.warn('analyzeSignals function not available')
          }
          break
          
        case 'handle_results':
          if (typeof handleResultsAction === 'function') {
            await handleResultsAction(sessionId, action.action_type)
          } else {
            console.warn('handleResultsAction function not available')
          }
          break
          
        case 'respond_only':
          console.log('Response only action completed')
          break
          
        default:
          console.warn('Unknown action type:', action.type)
      }
    } catch (error) {
      console.error('Error executing action:', error)
    }
  }, [startSearch, refineSearch, analyzeSignals, handleResultsAction, primaryModel?.id])

  // ✅ FIXED MAIN MESSAGE HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !currentSession || isLoading) return

    const userMessage = message.trim();
    setMessage(''); // ✅ Clear input immediately
    setIsLoading(true)
    
    try {
      // 1. Add user message to chat immediately
      console.log('👤 Adding user message:', userMessage);
      addMessageToChat('user', userMessage)
      
      // 2. Prepare conversation context for backend
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

      // 3. CALL BACKEND API FOR INTENT CLASSIFICATION
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
      
      // ✅ Add typing animation before AI response
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate typing delay
      setIsTyping(false);
      
      // 4. Add AI response to chat
      addMessageToChat('assistant', aiResponse)
      
      // 5. Update conversation context
      updateConversationContext(classification)
      
      // 6. Execute the appropriate action
      await executeAction(action, classification, currentSession.id)
      
    } catch (error) {
      console.error('Error processing message:', error)
      // Add error message to chat
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
      
      // Handle horizontal rule
      if (trimmedLine === '---') {
        elements.push(<hr key={`hr-${lineIndex}`} className="my-4 border-gray-600" />);
        return;
      }
      
      // Handle bullet points
      if (trimmedLine.startsWith('* ')) {
        const text = trimmedLine.substring(2);
        elements.push(
          <div key={`bullet-${lineIndex}`} className="flex items-start ml-4">
            <span className="mr-2">•</span>
            <span>{formatBoldText(text)}</span>
          </div>
        );
        return;
      }
      
      // Handle regular paragraphs
      elements.push(
        <p key={`p-${lineIndex}`} className="mb-2 leading-relaxed">
          {formatBoldText(trimmedLine)}
        </p>
      );
    });
    
    return <div className={className}>{elements}</div>;
  }
  
  function formatBoldText(text: string): React.ReactNode {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  }
  
  // ✅ EVENT HANDLERS
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

  // ✅ IMPROVED DEBUG COMPONENT
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
    // Define a wrapper callback to pass the event data to your function
    const handleSearchComplete = async(data: any) => {
      const { sessionId, companies, resultsCount, summary } = data;
   
     
      console.log('✅ Search complete:', { sessionId, resultsCount })
      addMessageToChat('assistant', summary);
    };
  
    webSocketService.on('search-complete', handleSearchComplete);
  
    return () => {
      webSocketService.off('search-complete', handleSearchComplete);
    };
  }, [addMessageToChat]);
  
  // ✅ RENDER LOGIC
  return (
    <div className="flex-1 flex flex-col h-full bg-black/80 h-screen relative overflow-hidden">
      <ConversationDebug />
      
      {/* Conversation Header */}
      {hasMessages && (
        <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-[#00FA64]" />
            <span className="text-white font-medium tracking-wide">CONVERSATION</span>
            <span className="bg-[#00FA64]/10 text-[#00FA64] px-2 py-1 rounded-full text-xs font-medium">
              {chatMessages.filter(m => m.role === 'user').length} messages
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        hasMessages ? "flex-1" : "flex-1 flex items-center justify-center"
      )}>
        <div className={cn(
          "h-full overflow-y-auto",
          hasMessages ? "p-8" : "w-full"
        )}>
          <div className={cn(
            "mx-auto space-y-6",
            hasMessages ? "max-w-5xl" : "w-full max-w-4xl px-8"
          )}>
            <AnimatePresence initial={false} mode="wait">
              {/* Chat Messages */}
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className={cn(
                    "flex gap-4 max-w-2xl",
                    msg.role === 'user' ? "justify-end ml-auto" : "justify-start"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-2xl flex items-center justify-center shadow-lg shadow-[#67F227]/20 flex-shrink-0">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                  )}
                  
                  <div className="flex gap-3 items-start group">
  <div className={cn(
    "rounded-2xl px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-md",
    msg.role === 'user' 
      ? "bg-gradient-to-r from-[#67F227] to-[#A7F205] text-black rounded-br-md" 
      : "bg-black/10 text-white rounded-bl-md border border-[#27272a]"
  )}>
    <div className="text-sm font-medium tracking-wide prose prose-invert">
      {parseContent(msg.content)}
    </div>
  </div>
</div>
                  {msg.role === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(0,250,100,0.3)]">
                      <User className="w-5 h-5 text-black" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Animation */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-4 max-w-2xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-2xl flex items-center justify-center shadow-lg shadow-[#67F227]/20">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                    <div className="bg-black/10 rounded-2xl rounded-bl-md px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex-1 border border-[#27272a]">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-[#00FA64] rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-[#00FA64] rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-[#00FA64] rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Current Processing Status */}
              {currentSession?.searchStatus?.stage=="searching" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-4 max-w-2xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-2xl flex items-center justify-center shadow-lg shadow-[#67F227]/20">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                    <div className="bg-black/10 rounded-2xl rounded-bl-md px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex-1 border border-[#27272a]">
                      <div className="flex items-center gap-3 mb-3">
                        {!isConnected && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-medium tracking-wide">
                            CONNECTING...
                          </span>
                        )}
                      </div>

                      <ProcessingWorkflow /> 
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Response for Completed Search */}
             {/* {currentSession?.searchStatus?.stage === 'complete' && currentSession.searchStatus.details && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-4 max-w-2xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-2xl flex items-center justify-center shadow-lg shadow-[#67F227]/20">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                    <div className="bg-black/10 rounded-2xl rounded-bl-md px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex-1 border border-[#27272a]">
                      <EnhancedResponse
                        content={currentSession.searchStatus.details}
                      />
                    </div>
                  </div>
                </motion.div>
              )}*/}

              {/* Centered Empty State */}
              {!hasMessages && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center w-full pt-10"
                >
                  <div className="flex gap-4 max-w-2xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-2xl flex items-center justify-center shadow-lg shadow-[#67F227]/20">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                    <div className="bg-black/10 rounded-2xl rounded-bl-md px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex-1 border border-[#27272a]">
                      <p 
                        className='text-left text-white'  
                        dangerouslySetInnerHTML={{ __html: formatAIText(typedText) }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className={cn(
        "transition-all duration-300",
        hasMessages ? "p-6" : "p-8"
      )}>
        <div className={cn(
          "mx-auto",
          hasMessages ? "max-w-5xl" : "max-w-5xl"
        )}>
          {/* Main Input Area */}
          <div className={cn(
            "bg-black/40 backdrop-blur-xl rounded-xl border border-[#27272a] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 w-full",
            hasMessages ? "" : "max-w-2xl mx-auto"
          )}>
            <div className="p-4">
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholderText}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-transparent text-white text-base outline-none placeholder:text-[#A1A1AA] font-light tracking-wide"
                disabled={!isConnected || isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-[#00FA64]/10 py-1 px-3 rounded-lg border border-[#00FA64]/20"
                    >
                      <FileText className="w-3 h-3 text-[#00FA64]" />
                      <span className="text-xs text-[#A1A1AA] font-medium">{file}</span>
                      <button
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}
                        className="text-[#666666] hover:text-[#A1A1AA] transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Function Buttons and Actions */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSearchTypeChange("search")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border",
                    searchType === "search"
                      ? "bg-[#00FA64]/10 text-[#00FA64] border-[#00FA64]/30 shadow-[0_0_15px_rgba(0,250,100,0.2)]"
                      : "bg-[#27272a] text-[#A1A1AA] border-[#363636] hover:border-[#00FA64]/30"
                  )}
                >
                  <Search className="w-4 h-4" />
                  <span>SEARCH</span>
                </button>
                <button
                  onClick={() => handleSearchTypeChange("deepResearch")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border",
                    searchType === "deepResearch"
                      ? "bg-[#00FA64]/10 text-[#00FA64] border-[#00FA64]/30 shadow-[0_0_15px_rgba(0,250,100,0.2)]"
                      : "bg-[#27272a] text-[#A1A1AA] border-[#363636] hover:border-[#00FA64]/30"
                  )}
                >
                  <Target className="w-4 h-4" />
                  <span>DEEP RESEARCH</span>
                </button>
                <button
                  onClick={() => handleSearchTypeChange("reasoning")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border",
                    searchType === "reasoning"
                      ? "bg-[#00FA64]/10 text-[#00FA64] border-[#00FA64]/30 shadow-[0_0_15px_rgba(0,250,100,0.2)]"
                      : "bg-[#27272a] text-[#A1A1AA] border-[#363636] hover:border-[#00FA64]/30"
                  )}
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>REASONING</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-[#A1A1AA] hover:text-white transition-colors duration-300">
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={handleUploadFile}
                  className="p-2 text-[#A1A1AA] hover:text-white transition-colors duration-300"
                >
                  {showUploadAnimation ? (
                    <motion.div
                      className="flex space-x-1"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: {
                          transition: {
                            staggerChildren: 0.1,
                          },
                        },
                      }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 bg-[#00FA64] rounded-full"
                          variants={{
                            hidden: { opacity: 0, y: 5 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: {
                                duration: 0.4,
                                repeat: Infinity,
                                repeatType: "mirror",
                                delay: i * 0.1,
                              },
                            },
                          }}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || !isConnected || isLoading}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                    message.trim() && isConnected && !isLoading
                      ? "bg-gradient-to-r from-[#00FA64] to-[#00FF80] text-black hover:from-[#00FF80] hover:to-[#80FFC2] hover:shadow-[0_12px_40px_rgba(0,250,100,0.4)] hover:scale-105 border border-[#00FA64]/30"
                      : "bg-[#27272a] text-[#666666] cursor-not-allowed border border-[#363636]"
                  )}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Active ICP Model Badge */}
          {primaryModel && isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-sm mt-4 justify-center"
            >
              <span className="text-[#A1A1AA] font-light tracking-wide">ACTIVE ICP MODEL:</span>
              <span className="bg-[#00FA64]/10 text-[#00FA64] px-3 py-1.5 rounded-full font-medium tracking-wide border border-[#00FA64]/30">
                {primaryModel.name}
              </span>
            </motion.div>
          )}

          {/* Connection Warning */}
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-sm mt-4 justify-center"
            >
              <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                <WifiOff className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-yellow-400 font-medium tracking-wide">
                NOT CONNECTED TO BACKEND. ENSURE SERVER IS RUNNING ON PORT 3001.
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}