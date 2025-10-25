// components/ICPConfigChat.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Send, 
  Bot, 
  User,
  Sparkles,
  CheckCircle,
  Loader,
  Target,
  Zap,
  BrainCircuit
} from 'lucide-react'
import { useSession } from '@/context/SessionContext'
import { cn } from '@/lib/utils'

export function ICPConfigChat() {
  const {
    icpConfigConversation,
    isICPConfigLoading,
    sendICPConfigMessage,
    currentICPSuggestion,
    applyICPSuggestion,

  } = useSession()

  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [icpConfigConversation])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isICPConfigLoading) return

    await sendICPConfigMessage(inputMessage)
    setInputMessage('')
  }

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
  }

  const quickStarters = [
    "I sell SaaS to marketing teams",
    "Help me target manufacturing companies",
    "I need an ICP for enterprise software",
    "Define my ideal customer profile",
    "I sell to tech startups"
  ]

  const isConfigReady = currentICPSuggestion?.isComplete

  return (
    <AnimatePresence>
      
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="w-full h-screen bg-gradient-to-b from-gray-900/80 to-black border-l border-green-500/20 shadow-2xl z-50 flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-green-500/20 bg-black/50 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Target className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-wide">
                  ICP CONFIG ASSISTANT
                </h3>
                <p className="text-xs text-green-400 font-medium">
                  AI-POWERED CONFIGURATION
                </p>
              </div>
            </div>
    
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {icpConfigConversation.length === 0 && !isICPConfigLoading && (
              <div className="text-center text-green-400 mt-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-light">Start configuring your ICP...</p>
              </div>
            )}

            {icpConfigConversation.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
                    message.role === 'user' 
                      ? 'bg-blue-500 shadow-blue-500/30' 
                      : 'bg-gradient-to-br from-green-500 to-emerald-400 shadow-green-500/30'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-black" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 backdrop-blur-sm border",
                    message.role === 'user'
                      ? "bg-blue-500/20 text-blue-100 border-blue-500/30 rounded-br-md"
                      : "bg-green-500/10 text-green-100 border-green-500/30 rounded-bl-md"
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Starters */}
            {icpConfigConversation.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 mt-4"
              >
                <p className="text-xs text-green-400/70 font-medium text-center">QUICK START</p>
                {quickStarters.map((starter, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(starter)}
                    className="w-full text-left p-3 text-sm text-green-300/80 bg-green-500/5 rounded-xl border border-green-500/20 hover:bg-green-500/10 hover:border-green-500/30 transition-all duration-200"
                  >
                    {starter}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Suggestion Preview */}
            {currentICPSuggestion && !isConfigReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 mt-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">DRAFT CONFIGURATION</span>
                </div>
                <div className="text-xs text-green-300/80 space-y-1">
                  <div><strong>Industries:</strong> {currentICPSuggestion.config.industries?.join(', ') || 'Not set'}</div>
                  <div><strong>Size:</strong> {currentICPSuggestion.config.employeeRange || 'Not set'}</div>
                  <div><strong>Geography:</strong> {currentICPSuggestion.config.geographies?.join(', ') || 'Not set'}</div>
                  <div className="text-green-400/60 text-xs mt-2">
                    Confidence: {Math.round(currentICPSuggestion.confidence * 100)}%
                  </div>
                </div>
              </motion.div>
            )}

            {/* Ready to Apply */}
            {isConfigReady && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mt-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-green-400">CONFIGURATION READY</span>
                </div>
                <p className="text-xs text-green-300/80 mb-3">
                  Your ICP configuration is complete and ready to apply.
                </p>
                <button
                  onClick={applyICPSuggestion}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-400 text-black py-2 px-4 rounded-lg font-bold text-sm hover:from-green-400 hover:to-emerald-300 transition-all duration-200 shadow-lg shadow-green-500/25"
                >
                  APPLY ICP CONFIGURATION
                </button>
              </motion.div>
            )}

            {/* Loading Indicator */}
            {isICPConfigLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-green-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-green-500/20 bg-black/50 backdrop-blur-xl">
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Describe your ideal customers..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isICPConfigLoading}
                  className="w-full bg-black/40 border border-green-500/30 rounded-xl px-4 py-3 text-green-100 placeholder-green-400/50 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 backdrop-blur-sm"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isICPConfigLoading}
                  className={cn(
                    "absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                    inputMessage.trim() && !isICPConfigLoading
                      ? "bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/25"
                      : "bg-green-500/20 text-green-400/50 cursor-not-allowed"
                  )}
                >
                  {isICPConfigLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Quick Action Buttons */}
            
            </form>
          </div>
        </motion.div>
      
    </AnimatePresence>
  )
}