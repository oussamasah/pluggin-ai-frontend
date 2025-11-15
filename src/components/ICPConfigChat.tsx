// components/ICPConfigChat.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User,
  Sparkles,
  CheckCircle,
  Loader,
  Target,
  Zap,
  BrainCircuit,
  ArrowUp,
  Crown
} from 'lucide-react'
import { useSession } from '@/context/SessionContext'
import { cn } from '@/lib/utils'

// Brand Colors
const ACCENT_GREEN = '#006239'
const ACTIVE_GREEN = '#006239'

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
    <div className="w-full h-[100vh] bg-white dark:bg-[#0F0F0F] flex flex-col">
      {/* Header - UPDATED STYLING */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#006239] rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED] text-lg">
              ICP Configuration Assistant
            </h3>
            <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
              AI-powered configuration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#006239] animate-pulse" />
          <span className="text-sm text-gray-600 dark:text-[#9CA3AF] font-medium">Live</span>
        </div>
      </div>

      {/* Messages - UPDATED STYLING */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-[#0F0F0F]">
        {icpConfigConversation.length === 0 && !isICPConfigLoading && (
          <div className="text-center text-gray-600 dark:text-[#9CA3AF] mt-8">
            <div className="w-16 h-16 bg-[#006239] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm font-medium">Start configuring your ICP...</p>
          </div>
        )}

        {icpConfigConversation.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-4",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'bot' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600 dark:text-[#9CA3AF]" />
              </div>
            )}
            
            <div className={cn(
              "flex flex-col gap-2 max-w-[85%]",
              message.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-3 rounded-2xl",
                message.role === 'user'
                  ? "bg-[#006239] text-white rounded-br-md"
                  : "bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[#EDEDED] border border-gray-200 dark:border-[#2A2A2A] rounded-bl-md"
              )}>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
              </div>
              <div className={cn(
                "text-xs px-1",
                message.role === 'user' 
                  ? "text-gray-500 dark:text-[#9CA3AF] text-right" 
                  : "text-gray-500 dark:text-[#9CA3AF] text-left"
              )}>
                {message.role === 'user' ? 'You' : 'Assistant'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Quick Starters - UPDATED STYLING */}
        {icpConfigConversation.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mt-6"
          >
            <p className="text-xs text-gray-500 dark:text-[#6A6A6A] font-medium text-center">QUICK START</p>
            {quickStarters.map((starter, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(starter)}
                className="w-full text-left p-4 text-sm text-gray-700 dark:text-[#EDEDED] bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2A2A2A] hover:border-[#006239] hover:shadow-sm transition-all duration-200"
              >
                {starter}
              </button>
            ))}
          </motion.div>
        )}

        {/* Suggestion Preview - UPDATED STYLING */}
        {currentICPSuggestion && !isConfigReady && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-4 mt-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#006239]" />
              <span className="text-sm font-medium text-gray-900 dark:text-[#EDEDED]">Draft Configuration</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-[#9CA3AF] space-y-2">
              <div><strong>Industries:</strong> {currentICPSuggestion.config.industries?.join(', ') || 'Not set'}</div>
              <div><strong>Size:</strong> {currentICPSuggestion.config.employeeRange || 'Not set'}</div>
              <div><strong>Geography:</strong> {currentICPSuggestion.config.geographies?.join(', ') || 'Not set'}</div>
              <div className="text-gray-500 dark:text-[#6A6A6A] text-xs mt-2">
                Confidence: {Math.round(currentICPSuggestion.confidence * 100)}%
              </div>
            </div>
          </motion.div>
        )}

        {/* Ready to Apply - UPDATED STYLING */}
        {isConfigReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-4 mt-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-[#006239]" />
              <span className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED]">Configuration Ready</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-[#9CA3AF] mb-4">
              Your ICP configuration is complete and ready to apply.
            </p>
            <button
              onClick={applyICPSuggestion}
              className="w-full bg-[#006239] text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-[#006239] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Apply ICP Configuration
            </button>
          </motion.div>
        )}

        {/* Loading Indicator - UPDATED STYLING */}
        {isICPConfigLoading && (
          <div className="flex justify-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600 dark:text-[#9CA3AF]" />
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                  Analyzing your requirements...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - UPDATED STYLING */}
      <div className="p-6 border-t border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Describe your ideal customers..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isICPConfigLoading}
              className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#3A3A3A] rounded-xl px-4 py-3 text-gray-900 dark:text-[#EDEDED] placeholder-gray-500 dark:placeholder-[#9CA3AF] text-sm focus:outline-none focus:ring-2 focus:ring-[#006239] focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isICPConfigLoading}
              className={cn(
                "absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                inputMessage.trim() && !isICPConfigLoading
                  ? "bg-[#006239] text-white hover:bg-[#006239] hover:shadow-md"
                  : "bg-gray-200 dark:bg-[#2A2A2A] text-gray-400 dark:text-[#6A6A6A] cursor-not-allowed"
              )}
            >
              {isICPConfigLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}