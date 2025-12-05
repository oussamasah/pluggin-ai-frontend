// app/page.tsx
"use client"

import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { useSession } from '@/context/SessionContext'
import { PremiumChatInterface } from '@/components/PremiumChatInterface'
import { EnhancedSearchResults } from '@/components/EnhancedSearchResults'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import ShaderBackground from '@/components/ui/web-gl-shader'
import PremiumLogoBackground from '@/components/ui/PremiumLogoBackground'

export default function Home() {
  const { currentSession, sessions, isConnected } = useSession()
  useEffect(() => {
 

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
    <SignedIn>
      <div className="flex-1 flex flex-col ">
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
                className="w-100 border-l  border-gray-200 dark:border-[#2A2A2A]"
              >
                <EnhancedSearchResults />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SignedIn>

    <SignedOut>
      <div className="flex flex-1 flex-col items-center justify-center py-12 px-4">
        <div className="max-w-lg rounded-3xl border border-gray-200 bg-white/80 p-10 text-center shadow-xl backdrop-blur dark:border-[#2A2A2A] dark:bg-[#0F0F0F]/80">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
            GTM Intelligence Workspace
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
            Sign in to collaborate with your organization
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            Authenticate with Clerk, create a workspace, and invite your teammates to manage ICP sessions,
            company research, and premium limits from one shared hub.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <SignInButton mode="modal">
              <button className="rounded-full bg-[#006239] px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/30 transition hover:bg-[#034427]">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full border border-gray-200 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-gray-900 transition hover:border-gray-300 dark:border-gray-700 dark:text-white">
                Create Account
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </SignedOut>
  )
}