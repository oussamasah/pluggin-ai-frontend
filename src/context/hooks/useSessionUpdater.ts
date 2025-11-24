// contexts/hooks/useSessionUpdater.ts
import { useCallback } from 'react'
import { SearchSession, SearchStatus } from '@/types'

const userID = process.env.NEXT_PUBLIC_MOCK_USER_ID

interface SessionStateProps {
  setSessions: React.Dispatch<React.SetStateAction<SearchSession[]>>
  sessions: SearchSession[]
}

export function useSessionUpdater(sessionState: SessionStateProps) {
  const { setSessions, sessions } = sessionState

  // Update a single session
  const updateSession = useCallback(async (sessionId: string, updates: Partial<SearchSession>) => {
    try {
      console.log('🔄 Updating session:', sessionId, updates)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'x-user-id': userID || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update session: ${errorText}`)
      }

      const { session } = await response.json()
      
      // Update local state with backend response
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, ...session } : s
      ))
      
      console.log('✅ Session updated successfully:', sessionId)
      return session
    } catch (error) {
      console.error('❌ Error updating session:', error)
      
      // Fallback: update local state only
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, ...updates } : s
      ))
      
      throw error
    }
  }, [setSessions])

  // Update session status only
  const updateSessionStatus = useCallback((sessionId: string, status: Partial<SearchStatus>) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      
      return {
        ...session,
        searchStatus: {
          ...(session.searchStatus || {}),
          ...status
        } as SearchStatus
      }
    }))
  }, [setSessions])

  // Update multiple specific sessions with different updates
  const updateMultipleSessions = useCallback(async (
    updates: Array<{ sessionId: string; updates: Partial<SearchSession> }>
  ) => {
    try {
      console.log('🔄 Updating multiple sessions:', updates.length)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/bulk-update`, {
        method: 'PATCH',
        headers: {
          'x-user-id': userID || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update multiple sessions: ${errorText}`)
      }

      const { sessions: updatedSessions } = await response.json()
      
      // Update local state with backend response
      setSessions(prev => prev.map(session => {
        const serverSession = updatedSessions.find((s: SearchSession) => s.id === session.id)
        return serverSession ? { ...session, ...serverSession } : session
      }))
      
      console.log('✅ Multiple sessions updated:', updates.length)
      return updatedSessions
    } catch (error) {
      console.error('❌ Error updating multiple sessions:', error)
      
      // Fallback: update local state only
      setSessions(prev => prev.map(session => {
        const update = updates.find(u => u.sessionId === session.id)
        return update ? { ...session, ...update.updates } : session
      }))
      
      throw error
    }
  }, [setSessions])

  // Update ALL sessions with the same updates
  const updateAllSessions = useCallback(async (updates: Partial<SearchSession>) => {
    try {
      console.log('🔄 Updating all sessions with:', updates)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/update-all`, {
        method: 'PATCH',
        headers: {
          'x-user-id': userID || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update all sessions: ${errorText}`)
      }

      // Update local state
      setSessions(prev => prev.map(session => ({
        ...session,
        ...updates
      })))
      
      console.log('✅ All sessions updated successfully')
    } catch (error) {
      console.error('❌ Error updating all sessions:', error)
      
      // Fallback: update local state only
      setSessions(prev => prev.map(session => ({
        ...session,
        ...updates
      })))
      
      throw error
    }
  }, [setSessions])

  // Bulk update specific sessions by IDs with same updates
  const bulkUpdateSessions = useCallback(async (
    sessionIds: string[], 
    updates: Partial<SearchSession>
  ) => {
    try {
      console.log('🔄 Bulk updating sessions:', sessionIds.length)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/bulk-update-ids`, {
        method: 'PATCH',
        headers: {
          'x-user-id': userID || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionIds, updates })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to bulk update sessions: ${errorText}`)
      }

      const { sessions: updatedSessions } = await response.json()
      
      // Update local state
      setSessions(prev => prev.map(session => {
        const serverSession = updatedSessions.find((s: SearchSession) => s.id === session.id)
        return serverSession ? { ...session, ...serverSession } : session
      }))
      
      console.log('✅ Bulk sessions updated:', sessionIds.length)
      return updatedSessions
    } catch (error) {
      console.error('❌ Error bulk updating sessions:', error)
      
      // Fallback: update local state only
      setSessions(prev => prev.map(session =>
        sessionIds.includes(session.id) ? { ...session, ...updates } : session
      ))
      
      throw error
    }
  }, [setSessions])

  // Refresh all sessions from backend
  const refreshSessions = useCallback(async () => {
    try {
      console.log('🔄 Refreshing sessions from backend...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
        headers: {
          'x-user-id': userID || ''
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to refresh sessions: ${errorText}`)
      }

      const { sessions: refreshedSessions } = await response.json()
      setSessions(refreshedSessions || [])
      
      console.log('✅ Sessions refreshed:', refreshedSessions.length)
      return refreshedSessions
    } catch (error) {
      console.error('❌ Error refreshing sessions:', error)
      throw error
    }
  }, [setSessions])

  // Optimistic update - updates local state immediately without waiting for backend
  const optimisticUpdate = useCallback((
    sessionId: string, 
    updates: Partial<SearchSession>
  ) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, ...updates } : s
    ))
  }, [setSessions])

  // Batch update with optimistic UI
  const optimisticBatchUpdate = useCallback((
    sessionIds: string[],
    updates: Partial<SearchSession>
  ) => {
    setSessions(prev => prev.map(s =>
      sessionIds.includes(s.id) ? { ...s, ...updates } : s
    ))
  }, [setSessions])

  return {
    // Single session updates
    updateSession,
    updateSessionStatus,
    
    // Multiple session updates
    updateMultipleSessions,
    updateAllSessions,
    bulkUpdateSessions,
    
    // Refresh
    refreshSessions,
    
    // Optimistic updates (instant UI updates)
    optimisticUpdate,
    optimisticBatchUpdate
  }
}