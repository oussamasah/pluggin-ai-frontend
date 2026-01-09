import { useState, useEffect, useCallback, useMemo } from 'react'
import { SearchSession, ICPModel, SearchStatus } from '@/types'

import { useUser } from '@clerk/nextjs';
import { count } from 'console';


export function useSessionState(userId?: string) {
  if(!userId) {
    const { user } =  useUser()
    userId = user?.id
  }

  const [sessions, setSessions] = useState<SearchSession[]>([])
  const [icpModels, setIcpModels] = useState<ICPModel[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Memoize currentSession to prevent unnecessary re-renders when sessions array reference changes
  // but the actual session data hasn't changed
  const currentSession = useMemo(() => {
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);
  const primaryModel = icpModels.find(model => model.isPrimary) || null

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
       
        // Load sessions
        const sessionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
          headers: {
            'x-user-id': userId || ''
          }
        })
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json()
          setSessions(sessionsData.sessions || [])
        }

        // Load ICP models
        const modelsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/icp-models`, {
          headers: {
            'x-user-id': userId || ''
          }
        })
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json()
          setIcpModels(modelsData.models || [])
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
        loadFromLocalStorage()
      }
    }

    loadInitialData()
  }, [userId])
  const updateSessionStatus = useCallback((sessionId: string, status: Partial<SearchStatus>) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;

      return {
        ...session,
        searchStatus: {
          ...(session.searchStatus || {}),
          ...status
        } as SearchStatus
      };
    }));
  }, []);
  const loadFromLocalStorage = useCallback(() => {
    const savedSessions = localStorage.getItem('icp-scout-sessions');
    const savedModels = localStorage.getItem('icp-scout-models');

    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions, (key, value) => {
          if (key === 'createdAt') return new Date(value);
          if (key === 'query') {
            // Handle migration from string to array
            if (typeof value === 'string') {
              return value ? [value] : []; // Convert old string to array
            }
            return value || []; // Ensure it's always an array
          }
          return value;
        }))
      } catch (error) {
        console.error('Error loading sessions from localStorage:', error);
      }
    }

    if (savedModels) {
      try {
        setIcpModels(JSON.parse(savedModels, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt') return new Date(value)
          return value
        }))
      } catch (error) {
        console.error('Error loading ICP models from localStorage:', error)
      }
    }
  }, [])

  // Session management methods
  const createNewSession = useCallback(async (name: string) => {
    try {
      
      if(!userId) return;
      console.log("createe session for userId")
      console.log(userId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'x-user-id': userId || '', // fallback to empty string if undefined
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({ name })
      })

      if (!response.ok) throw new Error('Failed to create session')

      const { session } = await response.json()
      setSessions(prev => [session, ...prev])
      setCurrentSessionId(session.id)

    } catch (error) {
      console.error('Error creating session:', error)
      // Fallback to local storage
      const newSession: SearchSession = {
        id: Date.now().toString(),
        name,
        createdAt: new Date(),
        query: [],
        resultsCount: 0,
        refinementState: undefined
      }
      setSessions(prev => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
    }
  }, [userId])

  const setCurrentSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId)
  }, [])

  // In your useSessionState hook - FIXED VERSION
  const updateSessionQuery = useCallback(async (sessionId: string, query: string | string[]) => {
    try {
      const currentSession = sessions.find(s => s.id === sessionId);
      const currentQueries = currentSession?.query || [];

      console.log('🔄 updateSessionQuery called:', { sessionId, query, currentQueries });

      let newQueries: string[];
      if (Array.isArray(query)) {
        // If query is an array, use it directly (this should be the case for chat)
        newQueries = query;
      } else {
        // If query is a string, append it (for backward compatibility)
        newQueries = [...currentQueries, query];
      }

      console.log('🔄 Final newQueries:', newQueries);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}/query`, {
        method: 'PATCH',
        headers: {
          'x-user-id': userId || '', // fallback to empty string if undefined
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({ query: newQueries })
      });

      if (!response.ok) throw new Error('Failed to update query');

      // Update local state
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, query: newQueries } : s
      ));

      console.log('✅ Successfully updated session queries');

    } catch (error) {
      console.error('Error updating query:', error);

      // Fallback: update local state only
      const currentSession = sessions.find(s => s.id === sessionId);
      const currentQueries = currentSession?.query || [];

      let newQueries: string[];
      if (Array.isArray(query)) {
        newQueries = query;
      } else {
        newQueries = [...currentQueries, query];
      }

      setSessions(prev => prev.map(session =>
        session.id === sessionId ? { ...session, query: newQueries } : session
      ));

      console.log('🔄 Fallback: Updated local state only');
    }
  }, [sessions]);

  // Add a function to clear the conversation
  const clearSessionQuery = useCallback(async (sessionId: string) => {
    await updateSessionQuery(sessionId, []);
  }, [updateSessionQuery]);

  // Add a function to remove a specific message from conversation
  const removeQueryMessage = useCallback(async (sessionId: string, index: number) => {
    const currentSession = sessions.find(s => s.id === sessionId);
    if (!currentSession) return;

    const newQueries = currentSession.query.filter((_, i) => i !== index);
    await updateSessionQuery(sessionId, newQueries);
  }, [sessions, updateSessionQuery]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId || '', // fallback to empty string if undefined
          'Content-Type': 'application/json'
        },

      })

      if (!response.ok) throw new Error('Failed to delete session')

      setSessions(prev => prev.filter(session => session.id !== sessionId))
      if (currentSessionId === sessionId) {
        setCurrentSessionId(sessions[0]?.id || null)
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      setSessions(prev => prev.filter(session => session.id !== sessionId))
      if (currentSessionId === sessionId) {
        setCurrentSessionId(sessions[0]?.id || null)
      }
    }
  }, [currentSessionId, sessions])

  // ICP Model management
  const saveIcpModel = useCallback(async (modelData: Omit<ICPModel, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/icp-models`, {
        method: 'POST',
        headers: {
          'x-user-id': userId || '', // fallback to empty string if undefined
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(modelData)
      })

      if (!response.ok) throw new Error('Failed to save ICP model')

      const { model } = await response.json()
      setIcpModels(prev => {
        const updatedModels = modelData.isPrimary
          ? prev.map(m => ({ ...m, isPrimary: false }))
          : prev
        return [...updatedModels, model]
      })
    } catch (error) {
      console.error('Error saving ICP model:', error)
      const now = new Date()
      const newModel: ICPModel = {
        ...modelData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now
      }
      setIcpModels(prev => {
        const updatedModels = modelData.isPrimary
          ? prev.map(model => ({ ...model, isPrimary: false }))
          : prev
        return [...updatedModels, newModel]
      })
    }
  }, [])

  const setPrimaryModel = useCallback(async (modelId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/icp-models/${modelId}/primary`, {
        headers: {
          'x-user-id': userId || '', // fallback to empty string if undefined

        },

        method: 'PATCH'
      })

      if (!response.ok) throw new Error('Failed to set primary model')

      setIcpModels(prev =>
        prev.map(model => ({
          ...model,
          isPrimary: model.id === modelId
        }))
      )
    } catch (error) {
      console.error('Error setting primary model:', error)
      setIcpModels(prev =>
        prev.map(model => ({
          ...model,
          isPrimary: model.id === modelId
        }))
      )
    }
  }, [])

  const deleteIcpModel = useCallback(async (modelId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/icp-models/${modelId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete ICP model')

      setIcpModels(prev => prev.filter(model => model.id !== modelId))
    } catch (error) {
      console.error('Error deleting ICP model:', error)
      setIcpModels(prev => prev.filter(model => model.id !== modelId))
    }
  }, [])

  // ADD MISSING startSearch FUNCTION
  const startSearch = useCallback(async (sessionId: string, query: string, icpModelId?: string) => {
    try {
      setIsLoading(true);

      // Update session query first
      const currentSession = sessions.find(s => s.id === sessionId);
      const currentQueries = currentSession?.query || [];
      const updatedQueries = [...currentQueries, query];

      await updateSessionQuery(sessionId, updatedQueries);

      // Start the search
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search-companies`, {
        method: 'POST',
        headers: {
          'x-user-id': userId || '', // fallback to empty string if undefined
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          sessionId,
          query,
          icpModelId,
          count: localStorage.getItem("searchcount") ?? "1",
          searchType: localStorage.getItem("searchType") ?? "search"
        })
      });

      if (!response.ok) throw new Error('Search failed');

      const searchResults = await response.json();

      // Update sessions with search results
      setSessions(prev => prev.map(session =>
        session.id === sessionId ? {
          ...session,
          query: updatedQueries,
          resultsCount: searchResults.companies?.length || 0,
          companies: searchResults.companies || [],
          searchStatus: searchResults.searchStatus || {
            stage: 'complete',
            message: 'Search completed',
            progress: 100
          }
        } : session
      ));

    } catch (error) {
      console.error('Error starting search:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sessions, updateSessionQuery]);

  // ADD THE NEW FUNCTIONS
  const refineSearch = useCallback(async (sessionId: string, newQuery: string, previousQuery?: string) => {
    try {
      setIsLoading(true);

      // Merge with previous query if provided
      const finalQuery = previousQuery ?
        await mergeQueries(previousQuery, newQuery) :
        newQuery;

      // Update session query
      const currentSession = sessions.find(s => s.id === sessionId);
      const currentQueries = currentSession?.query || [];
      const updatedQueries = [...currentQueries, finalQuery];

      await updateSessionQuery(sessionId, updatedQueries);

      // Start the refined search
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search`, {
        headers: {
          'x-user-id': userId || '', // fallback to empty string if undefined
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          sessionId,
          query: finalQuery,
          isRefinement: true,
          previousQuery
        })
      });

      if (!response.ok) throw new Error('Search refinement failed');

      const searchResults = await response.json();

      // Update sessions with new results
      setSessions(prev => prev.map(session =>
        session.id === sessionId ? {
          ...session,
          query: updatedQueries,
          resultsCount: searchResults.companies?.length || 0,
          companies: searchResults.companies || []
        } : session
      ));

    } catch (error) {
      console.error('Error refining search:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sessions, updateSessionQuery]);

  const analyzeSignals = useCallback(async (sessionId: string, scope: string = 'general') => {
    try {
      setIsLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-signals`, {
        method: 'POST',
        headers: {
          'x-user-id': userId || '', // fallback to empty string if undefined
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          sessionId,
          scope,
          analysisType: 'signals'
        })
      });

      if (!response.ok) throw new Error('Signals analysis failed');

      const signalsData = await response.json();

      // Update session with signals analysis
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? {
            ...session,
            searchStatus: {
              ...(session.searchStatus ?? {}), // default to empty object if undefined
              stage: 'complete',
              message: 'Signals analysis completed',
              details: signalsData.analysis,
              progress: session.searchStatus?.progress ?? 0,
              currentStep: session.searchStatus?.currentStep ?? 0,
              totalSteps: session.searchStatus?.totalSteps ?? 0,
              substeps: session.searchStatus?.substeps ?? []
            }
          }
          : session
      ));


    } catch (error) {
      console.error('Error analyzing signals:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResultsAction = useCallback(async (sessionId: string, actionType: string) => {
    try {
      const currentSession = sessions.find(s => s.id === sessionId);
      if (!currentSession) return;

      const companies = currentSession.companies ?? []; // default to empty array

      switch (actionType) {
        case 'export':
          await exportResults(sessionId, companies);
          break;

        case 'compare':
          await compareCompanies(sessionId, companies);
          break;

        case 'analyze':
          await analyzeResults(sessionId, companies);
          break;

        default:
          console.log('Unknown results action:', actionType);
      }

    } catch (error) {
      console.error('Error handling results action:', error);
      throw error;
    }
  }, [sessions]);


  // Helper functions for results actions
  const exportResults = async (sessionId: string, companies: any[]) => {
    // Convert companies to CSV
    const csvContent = convertToCSV(companies);

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `companies-${sessionId}-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const compareCompanies = async (sessionId: string, companies: any[]) => {
    // Get top companies for comparison
    const topCompanies = companies
      .sort((a, b) => (b.icpScore || 0) - (a.icpScore || 0))
      .slice(0, 5);

    // Generate comparison analysis
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-comparison`, {
      method: 'POST',
      headers: {
        'x-user-id': userId || '', // fallback to empty string if undefined
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        companies: topCompanies,
        analysisType: 'comparison'
      })
    });

    if (!response.ok) throw new Error('Comparison analysis failed');

    const comparisonData = await response.json();

    // Update session with comparison results
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? {
          ...session,
          searchStatus: {
            ...(session.searchStatus ?? {}), // default to empty object if undefined
            stage: 'complete',
            message: 'Company comparison completed',
            details: comparisonData.analysis,
            progress: session.searchStatus?.progress ?? 0,
            currentStep: session.searchStatus?.currentStep ?? 0,
            totalSteps: session.searchStatus?.totalSteps ?? 0,
            substeps: session.searchStatus?.substeps ?? []
          }
        }
        : session
    ));
  }

  const analyzeResults = async (sessionId: string, companies: any[]) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-results`, {
      method: 'POST',
      headers: {
        'x-user-id': userId || '', // fallback to empty string if undefined
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        companies,
        analysisType: 'detailed_analysis'
      })
    });

    if (!response.ok) throw new Error('Detailed analysis failed');

    const analysisData = await response.json();

    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? {
          ...session,
          searchStatus: {
            ...(session.searchStatus ?? {}), // default to empty object if undefined
            stage: 'complete',
            message: 'Detailed analysis completed',
            details: analysisData.analysis,
            progress: session.searchStatus?.progress ?? 0,
            currentStep: session.searchStatus?.currentStep ?? 0,
            totalSteps: session.searchStatus?.totalSteps ?? 0,
            substeps: session.searchStatus?.substeps ?? []
          }
        }
        : session
    ));

  };

  // Helper function to merge queries
  const mergeQueries = async (previousQuery: string, newQuery: string): Promise<string> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/merge-queries`, {
        method: 'POST',
        headers: {
          'x-user-id': userId || '', // fallback to empty string if undefined
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          previousQuery,
          newQuery
        })
      });

      if (!response.ok) throw new Error('Query merge failed');

      const { mergedQuery } = await response.json();
      return mergedQuery;
    } catch (error) {
      // Fallback: simple concatenation
      return `${previousQuery} ${newQuery}`;
    }
  };

  // Helper to convert companies to CSV
  const convertToCSV = (companies: any[]): string => {
    const headers = ['Name', 'Industry', 'Employees', 'Location', 'ICP Score', 'Intent Score', 'Website'];
    const rows = companies.map(company => [
      company.name || '',
      company.industry || '',
      company.employees || '',
      company.location || '',
      company.icpScore || '',
      company.intentScore || '',
      company.website || ''
    ]);

    return [headers, ...rows].map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  };

  // In your SessionContext or useSession hook
  const refreshSessions = useCallback(async () => {
    console.log('🔄 Refreshing sessions from backend...>userId:',userId);

   
    try {

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

  // RETURN ALL FUNCTIONS
  return {
    // State
    sessions,
    currentSession,
    icpModels,
    primaryModel,
    isConnected,
    isLoading,
    setIsLoading,
    setSessions,
    setIcpModels,
    setIsConnected,
    refreshSessions,
    // Session methods
    setCurrentSession,
    createNewSession,
    updateSessionQuery,
    deleteSession,
    startSearch, // ADDED

    // Query management
    clearSessionQuery,
    removeQueryMessage,

    // Search actions
    refineSearch,
    analyzeSignals,
    handleResultsAction,

    // ICP Model methods
    saveIcpModel,
    setPrimaryModel,
    deleteIcpModel
  }
}