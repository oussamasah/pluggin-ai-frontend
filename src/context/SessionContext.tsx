'use client'

import React, { createContext, useContext } from 'react'
import { SearchSession, SessionContextType } from '@/types'

// Import hooks and types
import { useSessionState } from './hooks/useSessionState'
import { useWebSocketHandlers } from './hooks/useWebSocketHandlers'
import { useICPConfig } from './hooks/useICPConfig'
import { useSessionUpdater } from './hooks/useSessionUpdater'

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Use custom hooks for different concerns
  const sessionState = useSessionState()
  const webSocketHandlers = useWebSocketHandlers(sessionState)
  const icpConfig = useICPConfig(sessionState)
  const sessionUpdater = useSessionUpdater(sessionState)

  // Combine all context values
  const contextValue: SessionContextType = {
    // Session state
    ...sessionState,
    
    // WebSocket handlers
    ...webSocketHandlers,
    
    // ICP Configuration
    ...icpConfig,
    
    // Session Updater (new)
    ...sessionUpdater,
    
    // Combined loading state
    isLoading: sessionState.isLoading || icpConfig.isICPConfigLoading
  }

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

// Specialized hook for session updates only
export function useSessionUpdate() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSessionUpdate must be used within a SessionProvider')
  }
  
  return {
    updateSession: context.updateSession,
    updateMultipleSessions: context.updateMultipleSessions,
    updateAllSessions: context.updateAllSessions,
    bulkUpdateSessions: context.bulkUpdateSessions,
    refreshSessions: context.refreshSessions,
    updateSessionStatus: context.updateSessionStatus,
    updateSessionQuery: context.updateSessionQuery
  }
}