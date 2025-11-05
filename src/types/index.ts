// types/index.ts
// frontend/types/company.ts
export interface Company  {
  employees: any[];
  business_model: any;
  location: any;
  company_id: string;            // uuid
  session_id: string;            // uuid
  icp_model_id: string;          // uuid
  name: string;
  domain: string;
  website: string;
  logo_url: string;
  description: string;
  founded_year?: number;         // integer, optional
  city: string;
  country: string;
  country_code: string;
  contact_email: string;
  contact_phone: string;
  linkedin_url: string;
  twitter_url: string;
  facebook_url: string;
  instagram_url: string;
  crunchbase_url: string;
  industry: string[];            // text[]
  target_market: string;
  ownership_type: string;
  employee_count?: number;       // integer, optional
  annual_revenue?: number;       // numeric, optional
  annual_revenue_currency: string;
  funding_stage: string;
  technologies: string[];        // text[]
  intent_signals: any;           // jsonb
  relationships: any;            // jsonb
  created_at: string;            // timestamp
  updated_at: string;            // timestamp
  scoring_metrics: any;          // jsonb
  total_funding?: number;        // numeric, optional
};

export interface Firmographic {
  industry?: string;
  employees?: number;
  revenue?: string;
  location?: string;
  foundedYear?: number;
}
// Add these to your types/index.ts

// Query Refinement Types
export interface QueryRefinementState {
  stage: 'idle' | 'refining-query' | 'awaiting-clarification' | 'searching' | 'enriching' | 'scoring' | 'analyzing' | 'complete' | 'error' | 'no-results';
  conversation: Array<{role: 'user' | 'assistant', content: string}>;
  suggestedQueries: string[];
  currentRefinedQuery?: string;
  confidence?: number;
  issues?: string[];
}

// Update SearchStatus to include refinement stages
export interface SearchStatus {
  stage:  string;
  message: string;
  progress: number;
  currentStep: number;
  totalSteps: number;
  substeps?: Substep[];
  details?: string;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'workflow-status' | 'workflow-substep' | 'search-progress' | 'companies-found' | 'search-complete' | 'search-error' | 'query-refinement' | 'connected' | 'error';
  sessionId: string;
  data?: any;
}

// Specific refinement message types
export interface QueryRefinementMessage {
  type: 'query-issues-found' | 'need-clarification' | 'query-ready' | 'refinement-error';
  message: string;
  issues?: string[];
  suggestions?: string[];
  refinedQuery?: string;
  confidence?: number;
  conversation?: Array<{role: string, content: string}>;
  fallbackQuery?: string;
}
export interface Enrichment {
  id: string;
  company_id: string;
  session_id: string;
  enrichment_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description: string;
  format: 'text' | 'date' | 'number' | 'options' | 'email' | 'phone' | 'url';
  result_data?: any;
  error_message?: string;
  exa_enrichment_id?: string;
  created_at: string;
  updated_at: string;
}

// Frontend component usage examples
  export interface SearchSession {
    id: string
    name: string
    createdAt: Date
    query: string[]
    resultsCount: number
    companies?: Company[]
    searchStatus?: SearchStatus
    icpModelId?: string
  }
  
 
  // types/index.ts - Ensure your SearchSession type is complete
export interface SearchSession {
  id: string;
  name: string;
  createdAt: Date;
  query: string[];
  resultsCount: number;
  companies?: Company[];
  searchStatus?: SearchStatus;
  icpModelId?: string;
}
export interface SessionContextType {
  // Existing state
  sessions: SearchSession[]
  currentSession: SearchSession | null
  icpModels: ICPModel[]
  primaryModel: ICPModel | null
  isConnected: boolean
  isLoading: boolean

  // Session methods
  setCurrentSession: (sessionId: string) => void
  createNewSession: (name: string) => Promise<void>
  updateSessionQuery: (sessionId: string, query: string | string[]) => void
  deleteSession: (sessionId: string) => void
  startSearch: (sessionId: string, query: string, icpModelId?: string) => Promise<void>
  refineSearch: (sessionId: string, newQuery: string, previousQuery?: string) => Promise<void>
  analyzeSignals: (sessionId: string, scope?: string) => Promise<void>
  handleResultsAction: (sessionId: string, actionType: string) => Promise<void>

  // ICP Model methods
  saveIcpModel: (model: Omit<ICPModel, 'id' | 'createdAt' | 'updatedAt'>) => void
  setPrimaryModel: (modelId: string) => void
  deleteIcpModel: (modelId: string) => void

  // ICP Config specific
  icpConfigConversation: { role: 'user' | 'bot'; content: string }[]
  isICPConfigLoading: boolean
  sendICPConfigMessage: (message: string) => Promise<void>
  currentICPSuggestion: {
    isComplete: boolean
    config: {
      industries?: string[]
      employeeRange?: string
      geographies?: string[]
    }
    confidence: number
  } | null
  applyICPSuggestion: () => void

  // ICP chat controls
  openICPConfigChat: () => void
  closeICPConfigChat: () => void
  isICPConfigChatOpen: boolean
}

export interface Substep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  category?: string; // 'search', 'enrichment', 'scoring', 'analysis', etc.
  priority?: 'low' | 'medium' | 'high';
  tools?: string[];
  metadata?: Record<string, any>;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}
  export interface ICPModel {
    id: string
    name: string
    isPrimary: boolean
    createdAt: Date
    updatedAt: Date
    config: ICPConfig
  }
  
  export interface ICPConfig {
    modelName: string
    industries: string[]
    geographies: string[]
    employeeRange: string
    acvRange: string
    mustHaveTech: string[]
    mustHaveCompliance: string[]
    mustHaveMotion: string
    excludedIndustries: string[]
    excludedGeographies: string[]
    excludedTechnologies: string[]
    excludedSizeRange: string
    buyingTriggers: string[]
    targetPersonas: string[]
    scoringWeights: {
      firmographic: number
      technographic: number
      intent: number
      behavioral: number
    }
  }
  
  export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }
  export const searchModeTexts: Record<string, string> = {
    // Standard Search
    search: `🔍 **Standard Search Activated**
    
  I'll help you quickly identify companies that match your basic criteria. Perfect for:
  - Initial market scanning
  - Quick company discovery  
  - Broad industry overview
  - Basic firmographic matching
  
  *I'll focus on surface-level company data and immediate matches to your ICP criteria.*`,
  
    // Deep Research Mode
    deepResearch: `🌊 **Deep Research Mode Engaged**
    
  I'm now conducting comprehensive company intelligence gathering. This includes:
  
  **📊 Multi-Source Analysis**
  - Cross-referencing company data across 20+ sources
  - Validating firmographic information from primary sources
  - Analyzing technographic footprints and stack evolution
  - Examining funding history and investor relationships
  
  **🎯 Advanced Signal Detection** 
  - Buying intent signals from job postings and hiring patterns
  - Growth indicators from news, partnerships, and expansions
  - Technology migration and digital transformation signals
  - Competitive positioning and market movement
  
  **🔍 Detailed Company Profiling**
  - Executive team background and movement
  - Product launches and feature developments
  - Customer case studies and success metrics
  - Market positioning and competitive analysis
  
  *This deep dive typically takes 2-3 minutes and provides enterprise-grade intelligence.*`,
  
    // Reasoning Mode
    reasoning: `🤔 **Analytical Reasoning Mode Active**
    
  I'm now thinking through your search strategy with strategic analysis:
  
  **🧠 Strategic Framework Application**
  - Applying Porter's Five Forces to market positioning
  - Using SWOT analysis for company evaluation
  - Implementing RFM scoring for target prioritization
  - Applying market segmentation theory
  
  **📈 Opportunity Assessment**
  - Market gap analysis and whitespace identification
  - Competitive landscape mapping
  - Growth potential evaluation
  - Risk factor analysis and mitigation strategies
  
  **🎯 ICP Alignment Reasoning**
  - Scoring companies against your ICP with weighted criteria
  - Identifying pattern matches and anomalies
  - Evaluating fit confidence with probabilistic modeling
  - Strategic prioritization based on multiple dimensions
  
  **💡 Strategic Recommendations**
  - Most promising target segments
  - Optimal outreach timing and messaging
  - Competitive differentiation opportunities
  - Risk assessment and mitigation strategies
  
  *I'll provide my complete reasoning chain and strategic recommendations.*`
  }