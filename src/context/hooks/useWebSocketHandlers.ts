import { useEffect, useCallback, useRef } from 'react'
import { SearchStatus, Substep } from '@/types'
import { webSocketService } from '@/lib/services/WebSocketService'
import { toast } from 'sonner'
import { useSessionState } from './useSessionState'
import { useSession } from '../SessionContext'

import { useUser } from '@clerk/nextjs'

export function useWebSocketHandlers(sessionState: any, userId: string) {
  const {
    sessions,
    setSessions,
    setIsLoading,
    setIsConnected,
    currentSession,
    updateSessionQuery
  } = sessionState

  // Add this ref to track previous session ID
  const previousSessionId = useRef<string | null>(null)
 const refreshSessions = useCallback(async () => {
   try {
     console.log('🔄 Refreshing sessions from backend websocket...',userId);
    
     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
       headers: {
         'x-user-id': userId || ''
       }
     });
 
     if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`Failed to refresh sessions: ${errorText}`);
     }
 
     const { sessions: refreshedSessions } = await response.json();
     setSessions(refreshedSessions || []);
     
     console.log('✅ Sessions refreshed:', refreshedSessions.length);
     return refreshedSessions;
   } catch (error) {
     console.error('❌ Error refreshing sessions:', error);
     throw error;
   }
 }, [setSessions,userId]);
  // Session switching logic
  const switchSession = useCallback(async (sessionId: string) => {
    if (!webSocketService.isConnected) {
      console.log('⏸️ WebSocket not connected, cannot switch session');
      return;
    }

    // Leave previous session if it exists and is different
    if (previousSessionId.current && previousSessionId.current !== sessionId) {
      console.log('🚪 Leaving previous session:', previousSessionId.current)
      webSocketService.send({
        type: 'leave-session',
        sessionId: previousSessionId.current
      })
    }
    
    // Join new session
    console.log('🔗 Switching to session:', sessionId)
    webSocketService.send({
      type: 'join-session',
      sessionId: sessionId,
      token: userId
    })
    
    previousSessionId.current = sessionId
  }, [userId])

  // WebSocket connection and session joining
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await webSocketService.connect(currentSession?.id || 'anonymous')
        setIsConnected(true)
        
        // Join the session after connecting
        if (currentSession?.id) {
          await switchSession(currentSession.id)
        }
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        setIsConnected(false)
      }
    }

    connectWebSocket()

    // Cleanup: leave session when component unmounts
    return () => {
      if (currentSession?.id) {
        console.log('🚪 Leaving session (cleanup):', currentSession.id)
        webSocketService.send({
          type: 'leave-session',
          sessionId: currentSession.id
        })
      }
    }
  }, [currentSession?.id, setIsConnected, switchSession])

  // Handle session switching when currentSession changes
  useEffect(() => {
    if (currentSession?.id && webSocketService.isConnected) {
      switchSession(currentSession.id)
    }
  }, [currentSession?.id, switchSession])

  const handleWorkflowStatusUpdate = useCallback((data: any) => {
    const { sessionId, data: statusData } = data;
    
    console.log('📊 Workflow status update for session:', sessionId, 'current session:', currentSession?.id);
    
    // CRITICAL: Only update if this is the current active session
    if (currentSession?.id !== sessionId) {
      console.log('⏭️ Ignoring update for inactive session:', sessionId);
      return;
    }
    
    setSessions((prev: any[]) => prev.map((session: { id: any; searchStatus: SearchStatus }) => {
      if (session.id !== sessionId) return session;
  
      return {
        ...session,
        searchStatus: {
          ...session.searchStatus,
          ...statusData,
          substeps: statusData.substeps || session.searchStatus?.substeps || []
        } as SearchStatus
      };
    }));
  }, [currentSession?.id, setSessions]);
  
  const handleSubstepUpdate = useCallback((data: any) => {
    const { sessionId, data: substepData } = data;
    
    console.log('📝 Substep update for session:', sessionId, 'current session:', currentSession?.id);
    
    // CRITICAL: Only update if this is the current active session
    if (currentSession?.id !== sessionId) {
      console.log('⏭️ Ignoring substep update for inactive session:', sessionId);
      return;
    }
    
    // Update only the searchStatus locally instead of refreshing all sessions
    // This prevents unnecessary re-renders of the entire component tree
    setSessions((prev: any[]) => prev.map((session: { id: any; searchStatus: SearchStatus }) => {
      if (session.id !== sessionId) return session;
      
      // Merge substep data into existing searchStatus
      const currentSubsteps = session.searchStatus?.substeps || [];
      const updatedSubsteps = substepData?.substeps 
        ? substepData.substeps 
        : currentSubsteps.map((step: any) => {
            // If this substep update contains a specific step, update it
            if (substepData?.id && step.id === substepData.id) {
              return { ...step, ...substepData };
            }
            return step;
          });
      
      return {
        ...session,
        searchStatus: {
          ...session.searchStatus,
          ...substepData,
          substeps: updatedSubsteps
        } as SearchStatus
      };
    }));
  }, [currentSession?.id, setSessions]);
  
  const handleSearchComplete = useCallback(async(data: any) => {
    const { sessionId, companies, resultsCount, summary } = data;
    
    console.log('✅ Search complete for session:', sessionId, 'current session:', currentSession?.id);
    
    // CRITICAL: Only update if this is the current active session
    if (currentSession?.id !== sessionId) {
      console.log('⏭️ Ignoring search complete for inactive session:', sessionId);
      return;
    }
    refreshSessions()

  
    setIsLoading(false);
    toast.success(`Search completed! Found ${resultsCount} companies.`)
  }, [currentSession?.id, setSessions, setIsLoading]);
  const handleSessionJoined = useCallback((data: any) => {
    console.log('✅ Session joined:', data.sessionId)
    toast.success('Connected to session')
  }, [])

  const handleConnected = useCallback(() => {
    console.log('✅ WebSocket connected')
    setIsConnected(true)
  }, [setIsConnected])

  const handleError = useCallback((data: any) => {
    console.error('❌ WebSocket error:', data)
    toast.error(`WebSocket error: ${data.message || data.error}`)
  }, [])

  // Handle WebSocket reconnection - refresh sessions and re-join current session
  const handleReconnect = useCallback(async () => {
    console.log('🔄 WebSocket reconnected, refreshing sessions and re-joining...');
    
    // Refresh sessions to get latest state
    try {
      await refreshSessions();
      
      // Re-join the current session if it exists
      if (currentSession?.id && webSocketService.isConnected) {
        console.log('🔗 Re-joining session after reconnect:', currentSession.id);
        await switchSession(currentSession.id);
      }
    } catch (error) {
      console.error('❌ Error refreshing sessions after reconnect:', error);
    }
  }, [currentSession?.id, refreshSessions, switchSession]);

  // Subscribe to WebSocket events
  useEffect(() => {
    webSocketService.on('workflow-status', handleWorkflowStatusUpdate)
    webSocketService.on('workflow-substep', handleSubstepUpdate)
    webSocketService.on('search-complete', handleSearchComplete)
    webSocketService.on('session-joined', handleSessionJoined)
    webSocketService.on('connected', handleConnected)
    webSocketService.on('error', handleError)
    // Subscribe to reconnect event
    webSocketService.onReconnect(handleReconnect)

    return () => {
      webSocketService.off('workflow-status', handleWorkflowStatusUpdate)
      webSocketService.off('workflow-substep', handleSubstepUpdate)
      webSocketService.off('search-complete', handleSearchComplete)
      webSocketService.off('session-joined', handleSessionJoined)
      webSocketService.off('connected', handleConnected)
      webSocketService.off('error', handleError)
      webSocketService.offReconnect(handleReconnect)
    }
  }, [
    handleWorkflowStatusUpdate, 
    handleSubstepUpdate, 
    handleSearchComplete,
    handleSessionJoined,
    handleConnected,
    handleError,
    handleReconnect
  ])

  const startSearch = useCallback(async (sessionId: string, query: string, icpModelId?: string) => {
    if (!sessionState.isConnected) {
      toast.error('Not connected to server. Please try again.')
      return
    }

    sessionState.setIsLoading(true)
    
    // Update query first
    await sessionState.updateSessionQuery(sessionId, query)
    
    const initialStatus: SearchStatus = {
      stage: 'searching',
      message: 'Starting intelligent search...',
      progress: 10,
      currentStep: 1,
      totalSteps: 4
    }

    sessionState.setSessions((prev: any[]) => prev.map(session => {
      if (session.id !== sessionId) return session

      return {
        ...session,
        searchStatus: initialStatus,
        icpModelId
      }
    }))
    let count = localStorage.getItem("searchcount") ?? "1";
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search-companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id':`${userId}`
        },
        body: JSON.stringify({
          sessionId,
          query,
          icpModelId,
          count,
          searchType: localStorage.getItem("searchType") ?? "search"
        })
      })

      if (!response.ok) throw new Error('Search failed')

      const result = await response.json()
      console.log('🚀 Search started:', result)
      toast.success('Search started successfully')
    } catch (error) {
      console.error('❌ Search error:', error)
      sessionState.setSessions((prev: any[]) => prev.map(session => {
        if (session.id !== sessionId) return session

        return {
          ...session,
          searchStatus: {
            stage: 'error',
            message: 'Search failed. Please try again.',
            progress: 0
          } as SearchStatus
        }
      }))
      sessionState.setIsLoading(false)
      toast.error('Search failed. Please try again.')
    }
  }, [sessionState])

  return {
    startSearch
  }
}