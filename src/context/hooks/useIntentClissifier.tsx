import { useCallback } from "react";
import { useSession } from "../SessionContext";
import { useSessionState } from "./useSessionState";
const { sessions  }=useSessionState()

// In your useSessionState hook or SessionContext
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userID
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
      setSessions(prev => prev.map((session: { id: string; }) =>
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
          'Content-Type': 'application/json',
          'x-user-id': userID
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
      setSessions(prev => prev.map((session: { id: string; searchStatus: any; }) =>
        session.id === sessionId ? {
          ...session,
          searchStatus: {
            ...session.searchStatus,
            stage: 'complete',
            message: 'Signals analysis completed',
            details: signalsData.analysis
          }
        } : session
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
      const currentSession = sessions.find((s: { id: string; companies?: any[] }) => s.id === sessionId);
      if (!currentSession) return;
  
      const companies = currentSession.companies || []; // default to empty array
  
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
        'Content-Type': 'application/json',
        'x-user-id': userID
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
    setSessions(prev => prev.map((session: { id: string; searchStatus: any; }) =>
      session.id === sessionId ? {
        ...session,
        searchStatus: {
          ...session.searchStatus,
          stage: 'complete',
          message: 'Company comparison completed',
          details: comparisonData.analysis
        }
      } : session
    ));
  };
  
  const analyzeResults = async (sessionId: string, companies: any[]) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userID
      },
      body: JSON.stringify({
        sessionId,
        companies,
        analysisType: 'detailed_analysis'
      })
    });
  
    if (!response.ok) throw new Error('Detailed analysis failed');
    
    const analysisData = await response.json();
    
    // Update session with analysis
    setSessions(prev => prev.map((session: { id: string; searchStatus: any; }) =>
      session.id === sessionId ? {
        ...session,
        searchStatus: {
          ...session.searchStatus,
          stage: 'complete',
          message: 'Detailed analysis completed',
          details: analysisData.analysis
        }
      } : session
    ));
  };
  
  // Helper function to merge queries
  const mergeQueries = async (previousQuery: string, newQuery: string): Promise<string> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/merge-queries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userID
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

function updateSessionQuery(sessionId: string, updatedQueries: any[]) {
  throw new Error("Function not implemented.");
}
function setSessions(arg0: (prev: any) => any) {
  throw new Error("Function not implemented.");
}

function setIsLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}

