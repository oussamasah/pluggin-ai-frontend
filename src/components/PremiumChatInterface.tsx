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
import { useUser } from '@clerk/nextjs'
import { ActiveModelSelector } from './ActiveModelSelector'
import { ReasoningVisualization } from './ReasoningVisualization'
import ReasoningWorkflow from './ReasoningWorkflow'

interface FormattingOptions {
  preserveLineBreaks?: boolean;
  className?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    type: 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'none';
    config?: {
      xAxisKey?: string;
      yAxisKey?: string;
      title?: string;
      [key: string]: any; // Allow other config properties
    };
    data: any[];
    [key: string]: any; // Allow other metadata properties
  };
}


// Brand Colors
const ACCENT_GREEN = '#006239' // Primary brand green
const ACTIVE_GREEN = '#006239' // User chat bubbles & active states

export function PremiumChatInterface() {
  const { user, isLoaded, isSignedIn } = useUser();
  const userId = isLoaded && isSignedIn ? user.id : null;
  // State hooks - KEEP ALL ORIGINAL FEATURES
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchType, setSearchType] = useState<string>(
    localStorage.getItem("searchType") ?? "search"
  )
  const [searchCount, setSearchCount] = useState(localStorage.getItem("searchcount") ?? "1"); // Default to 10



  // Add this handler function
  const handleSearchCountChange = (count: SetStateAction<string>) => {
    localStorage.setItem(`searchcount`, count.toString());

    setSearchCount(count);
  };
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [showUploadAnimation, setShowUploadAnimation] = useState(false)
  const [activeCommandCategory, setActiveCommandCategory] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  // Streaming state for reasoning mode
  const [streamingText, setStreamingText] = useState('')
  const [streamingProgress, setStreamingProgress] = useState(0)
  const [streamingStatus, setStreamingStatus] = useState<string>('')
  const [streamingMetadata, setStreamingMetadata] = useState<any>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const streamingMessageIdRef = useRef<string | null>(null)
  const isUpdatingFromStreamRef = useRef(false)
  // Track workflow steps for reasoning mode visualization
  const [workflowSteps, setWorkflowSteps] = useState<Array<{
    id: string
    node: string
    name: string
    description: string
    status: 'pending' | 'in-progress' | 'completed'
    progress?: number
  }>>([])
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

  const [localConversation, setLocalConversation] = useState<{
    metadata: any ,role: 'user' | 'assistant', content: string 
}[]>([]);
  const conversationRef = useRef(localConversation);
  const lastProcessedQueryRef = useRef<string>(''); // Track last processed query to avoid reprocessing

  useEffect(() => {
    conversationRef.current = localConversation;
  }, [localConversation]);

  const addMessageToChat = useCallback(async (role: 'user' | 'assistant', content: string, metadata?: any) => {
    if (!currentSession) {
      console.log('❌ No current session available');
      return;
    }
  
    if (!content || !content.trim()) {
      console.log('⚠️ Attempted to add empty message, skipping');
      return;
    }
  
    const newMessage = {
      role,
      content: content.trim(),
      metadata: metadata || undefined // Ensure it's undefined, not null
    };
  
    const allMessages = [...conversationRef.current, newMessage];
    setLocalConversation(allMessages);
  
    // Store in session query format WITH METADATA
    const updatedQueries = allMessages.map(msg => {
      if (msg.metadata) {
        // Store metadata as a separate JSON string
        return `CHAT_${msg.role.toUpperCase()}_WITH_METADATA: ${msg.content}|||METADATA:${JSON.stringify(msg.metadata)}`;
      }
      return `CHAT_${msg.role.toUpperCase()}: ${msg.content}`;
    });
  
    console.log('💬 Adding message to chat:', {
      role,
      contentLength: content.length,
      hasMetadata: !!metadata,
      totalMessages: allMessages.length,
      updatedQueries: updatedQueries.length
    });
    
    // Mark that we're updating to prevent reload
    isUpdatingFromStreamRef.current = true;
    
    // Await the update to ensure it's saved before continuing
    await updateSessionQuery(currentSession.id, updatedQueries);
    
    // Reset flag after a short delay to allow state to settle
    setTimeout(() => {
      isUpdatingFromStreamRef.current = false;
    }, 100);
  }, [currentSession, updateSessionQuery]);
  useEffect(() => {
    // Don't reload conversation if we're currently streaming or updating from stream - it will overwrite the streaming message
    if (isStreaming || isUpdatingFromStreamRef.current) {
      console.log('⏸️ Skipping conversation reload during streaming');
      return;
    }
    
    // Check if session has query data
    if (currentSession?.query) {
      const queries = Array.isArray(currentSession.query)
        ? currentSession.query
        : [currentSession.query];
  
      // Create a stable string representation of queries to compare
      const queriesString = JSON.stringify(queries);
      
      // Skip if we've already processed this exact query set
      if (queriesString === lastProcessedQueryRef.current) {
        console.log('⏸️ Skipping conversation reload - query unchanged');
        return;
      }
      
      // Only process if we have actual queries (not empty array)
      if (queries.length > 0 && queries.some(q => q && q.trim())) {
        const messages: Array<{ role: 'user' | 'assistant'; content: string; metadata: any }> = [];
        
        for (const query of queries) {
          if (!query || !query.trim()) continue;
          
          // Check for messages with metadata
          if (query.startsWith('CHAT_USER_WITH_METADATA: ')) {
            const [content, metadataStr] = query.replace('CHAT_USER_WITH_METADATA: ', '').split('|||METADATA:');
            let metadata;
            try {
              metadata = JSON.parse(metadataStr);
            } catch (e) {
              metadata = undefined;
            }
            messages.push({ 
              role: 'user' as const, 
              content: content.trim(),
              metadata 
            });
          } else if (query.startsWith('CHAT_ASSISTANT_WITH_METADATA: ')) {
            const [content, metadataStr] = query.replace('CHAT_ASSISTANT_WITH_METADATA: ', '').split('|||METADATA:');
            let metadata;
            try {
              metadata = JSON.parse(metadataStr);
            } catch (e) {
              metadata = undefined;
            }
            messages.push({ 
              role: 'assistant' as const, 
              content: content.trim(),
              metadata 
            });
          } else if (query.startsWith('CHAT_USER: ')) {
            messages.push({ 
              role: 'user' as const, 
              content: query.replace('CHAT_USER: ', '').trim(),
              metadata: undefined as any
            });
          } else if (query.startsWith('CHAT_ASSISTANT: ')) {
            messages.push({ 
              role: 'assistant' as const, 
              content: query.replace('CHAT_ASSISTANT: ', '').trim(),
              metadata: undefined as any
            });
          } else if (query.trim()) {
            // Fallback: treat as user message if it doesn't match any pattern
            messages.push({ 
              role: 'user' as const, 
              content: query.trim(),
              metadata: undefined as any
            });
          }
        }
  
        if (messages.length > 0) {
          // Update the ref to track what we've processed
          lastProcessedQueryRef.current = queriesString;
          setLocalConversation(messages);
          console.log('📱 Loaded messages from session:', {
            sessionId: currentSession.id,
            messageCount: messages.length,
            userMessages: messages.filter(m => m.role === 'user').length,
            assistantMessages: messages.filter(m => m.role === 'assistant').length,
            messages: messages.map(m => ({ role: m.role, contentLength: m.content.length }))
          });
        } else {
          console.log('⚠️ No valid messages found in session query:', queries);
        }
      } else {
        console.log('⚠️ Session query is empty:', currentSession.id);
        // Don't clear existing conversation if query is empty - might be a new session
      }
    } else {
      console.log('⚠️ No query found in session:', currentSession?.id);
      // Don't clear conversation if no query - preserve existing state
    }
  }, [currentSession?.id, currentSession?.query, isStreaming]);
  const updateConversationContext = useCallback((classification: any) => {
    if (currentSession?.id) {
      localStorage.setItem(`conversation-context-${currentSession.id}`, JSON.stringify(classification));
    }
  }, [currentSession?.id])
  // Memoize chatMessages to prevent unnecessary recalculations
  // Only recalculate when conversation or session ID actually changes
  const chatMessages: ChatMessage[] = useMemo(() => {
    return localConversation.map((msg, index) => ({
      id: `chat-${currentSession?.id || 'no-session'}-${index}`,
      content: msg.content,
      role: msg.role,
      timestamp: new Date(),
      metadata: msg.metadata // Make sure this is included
    }));
  }, [localConversation, currentSession?.id]);

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





    } catch (error) {
      console.error('Error executing action:', error)
    }
  }, [startSearch, refineSearch, analyzeSignals, handleResultsAction, primaryModel?.id])

  // Updated handleSubmit for PremiumChatInterface.tsx

  // Streaming handler for reasoning mode
  const handleStreamingQuery = useCallback(async (query: string, sessionId: string) => {
    // Reset streaming state
    setStreamingText('')
    setStreamingProgress(0)
    setStreamingStatus('')
    setStreamingMetadata(null)
    setIsStreaming(true)
    setIsTyping(false) // Don't show typing indicator, we'll show streaming text instead
    setWorkflowSteps([]) // Reset workflow steps

    // Create a temporary message ID for streaming
    const tempMessageId = `streaming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    streamingMessageIdRef.current = tempMessageId

    // Add empty assistant message that we'll update as we stream
    const streamingMessage = {
      role: 'assistant' as const,
      content: '',
      metadata: undefined as any
    }
    const allMessages = [...conversationRef.current, streamingMessage]
    setLocalConversation(allMessages)

    let accumulatedText = ''
    let finalMetadata: any = null
    let lastMessageContent = ''

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_RIO_URL}/query/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId ?? ''
        },
        body: JSON.stringify({
          query,
          sessionId,
          userId: userId,
        })
      })

      if (!response.ok) {
        throw new Error(`Streaming request failed: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let chunkCount = 0
      let lastChunkTime = Date.now()

      if (!reader) {
        throw new Error('No response body reader available')
      }

      console.log('🚀 Starting to read stream...')

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('✅ Stream reading complete. Total chunks processed:', chunkCount)
          break
        }

        // Log when we receive raw data from the stream
        const now = Date.now()
        const timeSinceLastChunk = now - lastChunkTime
        if (timeSinceLastChunk > 100) {
          console.log('⏱️ Time gap detected:', timeSinceLastChunk, 'ms since last chunk')
        }
        lastChunkTime = now

        buffer += decoder.decode(value, { stream: true })
        
        // SSE format: each event is separated by \n\n
        // Each line starting with "data: " contains the JSON
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || '' // Keep incomplete event in buffer

        for (const part of parts) {
          if (!part.trim()) continue
          
          // Find "data: " line in this event block
          const lines = part.split('\n')
          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6).trim()
                if (!jsonStr) continue
                
                const data = JSON.parse(jsonStr)
                
                // Log chunk events more concisely
                if (data.type === 'chunk') {
                  chunkCount++
                  console.log(`📝 Chunk #${chunkCount}:`, data.text?.substring(0, 30) || 'empty', `(total: ${accumulatedText.length + (data.text || '').length} chars)`)
                } else {
                  console.log('📨 SSE Event:', data.type, data.message || data.node || '')
                }
              
                switch (data.type) {
                case 'start':
                  console.log('🚀 Streaming started:', data.message)
                  setStreamingStatus(data.message || 'Processing your query...')
                  break

                case 'progress':
                  console.log(`📊 Progress: ${data.progress}% - ${data.message}`, data)
                  setStreamingProgress(data.progress || 0)
                  setStreamingStatus(data.message || `Processing ${data.node || 'request'}...`)
                  
                  // Update workflow steps for reasoning visualization
                  if (data.node) {
                    setWorkflowSteps(prevSteps => {
                      const nodeNameMap: Record<string, string> = {
                        planner: 'Planning Query',
                        retriever: 'Retrieving Data',
                        analyzer: 'Analyzing Data',
                        responder: 'Generating Response'
                      }
                      
                      const stepName = nodeNameMap[data.node] || data.node.charAt(0).toUpperCase() + data.node.slice(1)
                      
                      // Find existing step
                      const existingIndex = prevSteps.findIndex(s => s.node === data.node)
                      
                      if (existingIndex >= 0) {
                        // Update existing step
                        const updated = [...prevSteps]
                        updated[existingIndex] = {
                          ...updated[existingIndex],
                          description: data.message || updated[existingIndex].description,
                          status: 'in-progress',
                          progress: data.progress
                        }
                        return updated
                      } else {
                        // Mark previous in-progress steps as completed
                        const updated = prevSteps.map(step => 
                          step.status === 'in-progress' 
                            ? { ...step, status: 'completed' as const }
                            : step
                        )
                        
                        // Add new step
                        updated.push({
                          id: `reasoning-${data.node}-${Date.now()}`,
                          node: data.node,
                          name: stepName,
                          description: data.message || `Processing ${data.node}...`,
                          status: 'in-progress',
                          progress: data.progress
                        })
                        
                        return updated
                      }
                    })
                  }
                  break

                case 'chunk':
                  // Append chunk to accumulated text
                  const chunkText = data.text || ''
                  if (chunkText) {
                    accumulatedText += chunkText
                    
                    // Log chunk reception with timestamp for debugging
                    console.log('📝 Chunk received:', {
                      text: chunkText.substring(0, 30),
                      accumulatedLength: accumulatedText.length,
                      timestamp: new Date().toISOString()
                    })
                    
                    // Only update streaming text state - don't update conversation array
                    // This prevents flickering by avoiding full re-renders
                    setStreamingText(accumulatedText)
                    
                    // Smooth scroll to bottom (throttled to avoid excessive scrolling)
                    if (messagesEndRef.current) {
                      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                    }
                  }
                  break

                case 'complete':
                  console.log('✅ Streaming complete:', data)
                  
                  // Use complete event data or accumulated text
                  const finalContent = data.answer || accumulatedText
                  finalMetadata = data.metadata || null
                  
                  setStreamingText(finalContent)
                  setStreamingMetadata(finalMetadata)
                  setStreamingProgress(100)
                  setStreamingStatus('Complete')
                  
                  // Mark all workflow steps as completed
                  setWorkflowSteps(prevSteps => 
                    prevSteps.map(step => ({
                      ...step,
                      status: 'completed' as const,
                      progress: 100
                    }))
                  )
                  
                  // Update the final message with complete content and metadata
                  setLocalConversation(prevMessages => {
                    const lastIndex = prevMessages.length - 1
                    const updated = prevMessages.map((msg, idx) => 
                      idx === lastIndex
                        ? { 
                            ...msg, 
                            content: finalContent,
                            metadata: finalMetadata
                          }
                        : msg
                    )
                    
                    // Update session query with final messages
                    const updatedQueries = updated.map(msg => {
                      if (msg.metadata) {
                        return `CHAT_${msg.role.toUpperCase()}_WITH_METADATA: ${msg.content}|||METADATA:${JSON.stringify(msg.metadata)}`
                      }
                      return `CHAT_${msg.role.toUpperCase()}: ${msg.content}`
                    })
                    
                    // Mark that we're updating from stream to prevent reload
                    isUpdatingFromStreamRef.current = true
                    
                    // Update session query - this will trigger useEffect but isUpdatingFromStreamRef check will prevent reload
                    updateSessionQuery(sessionId, updatedQueries)
                    
                    // Reset flags after a short delay to allow the update to complete
                    setTimeout(() => {
                      isUpdatingFromStreamRef.current = false
                      setIsStreaming(false)
                      streamingMessageIdRef.current = null
                    }, 200)
                    
                    return updated
                  })
                  
                  break

                case 'error':
                  console.error('❌ Streaming error:', data.message)
                  setStreamingStatus(`Error: ${data.message}`)
                  
                  // Update message with error
                  setLocalConversation(prevMessages => {
                    const lastIndex = prevMessages.length - 1
                    return prevMessages.map((msg, idx) => 
                      idx === lastIndex
                        ? { 
                            ...msg, 
                            content: `I encountered an error: ${data.message || 'Unknown error'}. Please try again.`
                          }
                        : msg
                    )
                  })
                  
                  throw new Error(data.message || 'Streaming error occurred')
                }
              } catch (parseError) {
                console.error('❌ Error parsing SSE data:', parseError, 'Line:', trimmedLine)
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Streaming error:', error)
      setStreamingStatus(`Error: ${error.message}`)
      
      // Update message with error
      setLocalConversation(prevMessages => {
        const lastIndex = prevMessages.length - 1
        return prevMessages.map((msg, idx) => 
          idx === lastIndex
            ? { 
                ...msg, 
                content: `I encountered an error: ${error.message}. Please try again.`
              }
            : msg
        )
      })
    } finally {
      // Only reset if we haven't already done so in the complete handler
      if (isStreaming) {
        setIsStreaming(false)
        streamingMessageIdRef.current = null
      }
    }
  }, [userId, updateSessionQuery, isStreaming])

  // Updated handleSubmit function in PremiumChatInterface.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentSession || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      console.log('👤 User message:', userMessage);
      console.log('🔍 Search type:', searchType);

      // Add user message to chat immediately for better UX
      // Await to ensure it's saved before streaming starts
      await addMessageToChat('user', userMessage);

      // Choose API endpoint based on search type
      if (searchType === 'reasoning') {
        // Use Agentic Streaming API for reasoning mode
        console.log('🧠 Using Agentic Streaming API for reasoning mode');
        
        // Use streaming handler
        await handleStreamingQuery(userMessage, currentSession.id);
        
        setIsLoading(false);
        return;

      } else {
        // Use regular refinement API for search and deep research modes
        console.log('🔍 Using regular refinement API');

        // Extract current context from session
        const sessionQueries = Array.isArray(currentSession.query) ? currentSession.query : [];

        // Find the last refinement stage marker
        let stage = 'initial';
        let currentQuery = '';

        for (let i = sessionQueries.length - 1; i >= 0; i--) {
          const query = sessionQueries[i];
          if (query.includes('REFINEMENT_STAGE:')) {
            const match = query.match(/REFINEMENT_STAGE:(\w+):(.*)/);
            if (match) {
              stage = match[1];
              currentQuery = match[2];
              break;
            }
          }
        }

        // Use session's refinementState if available
        if (currentSession.refinementState) {
          stage = currentSession.refinementState.stage;
          currentQuery = currentSession.refinementState.currentQuery || currentQuery;
        }

        console.log('📤 Context:', { stage, currentQuery: currentQuery.substring(0, 50) });

        // Call the refinement endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/refine-with-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId ?? ''
          },
          body: JSON.stringify({
            message: userMessage,
            sessionId: currentSession.id,
            icpModelId: primaryModel?.id,
            context: {
              stage,
              currentQuery
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Refinement failed');
        }

        const refinementResponse = await response.json();
        const { response: aiResponse, action, context: newContext } = refinementResponse;

        console.log('🤖 AI response:', aiResponse.substring(0, 100));
        console.log('🔄 Action:', action);
        console.log('📝 New stage:', newContext?.stage);

        // Remove typing indicator
        setIsTyping(false);

        // Add AI response to chat
        await addMessageToChat('assistant', aiResponse);

        // Handle the action
        if (action?.type === 'start_search' && action.query) {
          console.log('🚀 Starting search with query:', action.query);

          // Show search starting message
          await new Promise(resolve => setTimeout(resolve, 500));

          // Trigger the actual search
          await startSearch(currentSession.id, action.query, primaryModel?.id);

          // Refresh sessions to get updated status
          await refreshSessions();
        }
      }

    } catch (error: any) {
      console.error('❌ Error processing message:', error);
      setIsTyping(false);

      await addMessageToChat('assistant',
        `I encountered an error: ${error.message}. Let's try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };


  // Helper function to extract stage from query array
  function extractStageFromQueries(queries: string[]): {
    stage: string;
    currentQuery: string;
  } {
    for (let i = queries.length - 1; i >= 0; i--) {
      const query = queries[i];
      if (query.includes('REFINEMENT_STAGE:')) {
        const match = query.match(/REFINEMENT_STAGE:(\w+):(.*)/);
        if (match) {
          return {
            stage: match[1],
            currentQuery: match[2]
          };
        }
      }
    }

    return {
      stage: 'initial',
      currentQuery: ''
    };
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
    const handleSearchComplete = async (data: any) => {
      const { sessionId, companies, resultsCount, summary } = data;
      console.log('✅ Search complete:', { sessionId, resultsCount })
      await addMessageToChat('assistant', summary);
    };

    webSocketService.on('search-complete', handleSearchComplete);

    return () => {
      webSocketService.off('search-complete', handleSearchComplete);
    };
  }, [addMessageToChat]);
  
  // Reset lastProcessedQueryRef when session changes
  useEffect(() => {
    lastProcessedQueryRef.current = '';
  }, [currentSession?.id]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0F0F0F] min-h-screen">
      {/***JSON.stringify(currentSession)**/}
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

                {theme == "dark" ? <img
                  src="/plauging-ai-dark.png"
                  alt="Crown"
                  className=""
                /> : <img
                  src="/plauging-ai-light.png"
                  alt="Crown"
                  className=""
                />}

              </div>
              <div>
                <h1 className="text-sm font-medium text-gray-900 dark:text-[#EDEDED]">
-------------------------------------------------------------------
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
                  key={currentSession?.id + "-" + msg.id + "-" + msg.timestamp}
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
                      "px-5 py-4 rounded-2xl",
                      msg.role === 'user'
                        ? cn(
                          "bg-[#F3F4F6] dark:bg-[#1E1E1E] text-white text-gray-900 dark:text-[#EDEDED]  rounded-br-md"
                        )
                        : cn(
                          "bg-[#F3F4F6] dark:bg-[#1E1E1E] text-gray-900 dark:text-[#EDEDED] rounded-bl-md"
                        )
                    )}>
                  
                     <div className="text-sm leading-relaxed font-light tracking-wide">
  {/* Use ReasoningVisualization component for messages with metadata */}
  {/* For streaming messages, use streamingText directly to avoid flickering */}
  {isStreaming && index === chatMessages.length - 1 && msg.role === 'assistant' ? (
    <>
      {/* Show current workflow step as title/description above the content */}
      {searchType === 'reasoning' && workflowSteps.length > 0 && (
        <ReasoningWorkflow 
          steps={workflowSteps} 
          currentProgress={streamingProgress}
          className="mb-4"
        />
      )}
      <ReasoningVisualization 
        content={streamingText || msg.content} 
        metadata={streamingMetadata || msg.metadata}
      />
      {streamingText && (
        <span className="inline-block w-0.5 h-4 ml-1.5 bg-[#006239] animate-pulse rounded-full" />
      )}
    </>
  ) : (
    <ReasoningVisualization 
      content={msg.content} 
      metadata={msg.metadata}
    />
  )}
</div>
                    </div>

                    {/* Message footer */}
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
              {isTyping && !isStreaming && (
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


              {/* Streaming Progress Indicator (fallback for non-reasoning modes) */}
              {isStreaming && streamingStatus && searchType !== 'reasoning' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-4 mb-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-[#1E1E1E] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl rounded-bl-md",
                    "bg-[#F3F4F6] dark:bg-[#1E1E1E] w-full max-w-md"
                  )}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-[#9CA3AF] mb-2">
                        <span className="font-medium">{streamingStatus}</span>
                        {streamingProgress > 0 && (
                          <span className="font-light">{streamingProgress}%</span>
                        )}
                      </div>
                      {streamingProgress > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-[#2A2A2A] rounded-full h-1.5">
                          <motion.div
                            className="h-1.5 rounded-full"
                            style={{ 
                              backgroundColor: ACTIVE_GREEN,
                              width: `${streamingProgress}%`
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${streamingProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
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
              <ActiveModelSelector className="mt-4" />
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