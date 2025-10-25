// app/page.tsx
'use client'

import { useSession } from '@/context/SessionContext'
import { PremiumChatInterface } from '@/components/PremiumChatInterface'
import { EnhancedSearchResults } from '@/components/EnhancedSearchResults'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import ShaderBackground from '@/components/ui/web-gl-shader'

export default function Home() {
  const { currentSession, sessions, isConnected } = useSession()
  useEffect(() => {
    console.log("----------------",currentSession)

  }, [currentSession])
  useEffect(() => {
    console.log("🔍 Session Context Debug:", {
      currentSession,
      sessionsCount: sessions.length,
      isConnected,
      currentSessionId: currentSession?.id
    });
  }, [currentSession, sessions, isConnected]);
  return (
    <div className="flex-1 flex flex-col ">
         <ShaderBackground />
      
      {/* Search Status Bar */}
      

      <div className=" flex-1 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            {!currentSession ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <WelcomeScreen />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <PremiumChatInterface />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Panel */}
        <AnimatePresence>
          {currentSession?.companies && currentSession.companies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-96 border-l  bg-black/20"
            >
              <EnhancedSearchResults />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}