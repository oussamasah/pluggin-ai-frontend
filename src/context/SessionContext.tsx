'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { SearchSession, Company, SearchStatus, ICPModel, Substep, QueryRefinementState, ICPConfig, SessionContextType } from '@/types'
import { toast } from 'sonner'
import { WebSocketMessage, webSocketService } from '@/lib/services/WebSocketService'

// Import hooks and types
import { useSessionState } from './hooks/useSessionState'
import { useWebSocketHandlers } from './hooks/useWebSocketHandlers'
import { useICPConfig } from './hooks/useICPConfig'


const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Use custom hooks for different concerns
  const sessionState = useSessionState()
  const webSocketHandlers = useWebSocketHandlers(sessionState)
  const icpConfig = useICPConfig(sessionState)

  // Combine all context values
  const contextValue: SessionContextType = {
    // Session state

    ...sessionState,
    
    // WebSocket handlers
    ...webSocketHandlers,
    
    // ICP Configuration
    ...icpConfig,
    
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