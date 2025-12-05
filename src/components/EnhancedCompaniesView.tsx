// components/EnhancedCompaniesView.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from '@/context/SessionContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Filter,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Target,
  Star,
  ChevronRight,
  Download,
  Sliders,
  ArrowLeft,
  X,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileDown,
  Edit3,
  Eye,
  EyeOff,
  Grid,
  List,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Zap,
  Crown,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Company } from '@/types'
import { EnhancedSearchResults } from './EnhancedSearchResults'
import { CompanyDetail } from './CompanyDetail'

import { useUser } from '@clerk/nextjs'

// Brand Colors
const ACCENT_GREEN = '#006239'
const ACTIVE_GREEN = '#006239'

interface CompanyStats {
  totalCompanies: number;
  highFitCount: number;
  averageEmployees: number;
  recentAdditions: number;
  byIndustry: Record<string, number>;
  byCountry: Record<string, number>;
}

export  function EnhancedCompaniesView() {
  const { user } = useUser();

  const userId = user?.id;
  const { currentSession, icpModels } = useSession()
  
  // Data State
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<CompanyStats | null>(null)
  
  // UI & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedICP, setSelectedICP] = useState<string>('all')
  const [filters, setFilters] = useState({
    industry: 'all',
    country: 'all',
    minEmployees: 0,
    maxEmployees: 10000,
    fundingStage: 'all',
    targetMarket: 'all'
  })
  const [sortConfig, setSortConfig] = useState({
    field: 'created_at' as keyof Company,
    direction: 'desc' as 'asc' | 'desc'
  })
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [availableFilters, setAvailableFilters] = useState({
    industries: [] as string[],
    countries: [] as string[],
    technologies: [] as string[]
  })

  // Use session companies or fetch if needed
  const displayCompanies = useMemo(() => {
    return currentSession?.companies || companies
  }, [currentSession?.companies, companies])

  // Fetch companies if no session data
  const fetchCompanies = useCallback(async () => {
    if (currentSession?.companies) {
      setCompanies(currentSession.companies)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction,
        limit: '1000' // Get all companies for this view
      })

      if (searchQuery) params.append('search', searchQuery)
      if (selectedICP !== 'all') params.append('icpModelId', selectedICP)
      if (filters.industry !== 'all') params.append('industry', filters.industry)
      if (filters.country !== 'all') params.append('country', filters.country)
      if (filters.minEmployees > 0) params.append('minEmployees', filters.minEmployees.toString())
      if (filters.maxEmployees < 10000) params.append('maxEmployees', filters.maxEmployees.toString())

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': `${userId}`
        },
      })

      if (!response.ok) throw new Error('Failed to fetch companies')

      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.companies)
        if (data.filters) {
          setAvailableFilters({
            industries: data.filters.availableIndustries || [],
            countries: data.filters.availableCountries || [],
            technologies: data.filters.availableTechnologies || []
          })
        }
      } else {
        throw new Error(data?.error || 'Failed to fetch companies')
      }
    } catch (err) {
      console.error('Error fetching companies:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch companies')
    } finally {
      setLoading(false)
    }
  }, [currentSession, searchQuery, selectedICP, filters, sortConfig, userId])

  // Calculate statistics
  useEffect(() => {
    if (displayCompanies.length > 0) {
      const highFitCount = displayCompanies.filter(company => 
        company.scoring_metrics?.fit_score?.score >= 80
      ).length

      const avgEmployees = Math.round(
        displayCompanies.reduce((acc, company) => acc + (company.employee_count || 0), 0) / displayCompanies.length
      )

      const recentAdditions = displayCompanies.filter(company => {
        const created = new Date(company.created_at)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return created > thirtyDaysAgo
      }).length

      // Industry distribution
      const byIndustry: Record<string, number> = {}
      displayCompanies.forEach(company => {
        if (company.industry) {
          const industries = Array.isArray(company.industry) ? company.industry : [company.industry]
          industries.forEach(industry => {
            byIndustry[industry] = (byIndustry[industry] || 0) + 1
          })
        }
      })

      // Country distribution
      const byCountry: Record<string, number> = {}
      displayCompanies.forEach(company => {
        const country = company.location?.country
        if (country) {
          byCountry[country] = (byCountry[country] || 0) + 1
        }
      })

      setStats({
        totalCompanies: displayCompanies.length,
        highFitCount,
        averageEmployees: avgEmployees,
        recentAdditions,
        byIndustry,
        byCountry
      })
    }
  }, [displayCompanies])

  // Initial data fetch
  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchCompanies])

  // Handle filter changes
  useEffect(() => {
    fetchCompanies()
  }, [selectedICP, filters, sortConfig, fetchCompanies])

  // Handle sort
  const handleSort = (field: keyof Company) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  // Export companies
  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filters.industry !== 'all') params.append('industry', filters.industry)
      if (filters.country !== 'all') params.append('country', filters.country)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/export?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': `${userId}`
        }
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'companies.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error('Error exporting companies:', err)
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedICP('all')
    setFilters({
      industry: 'all',
      country: 'all',
      minEmployees: 0,
      maxEmployees: 10000,
      fundingStage: 'all',
      targetMarket: 'all'
    })
    setSortConfig({ field: 'created_at', direction: 'desc' })
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-[#006239]";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  }

  // Loading state
  if (loading && displayCompanies.length === 0) {
    return (
      <div className="h-full flex bg-white dark:bg-[#0F0F0F]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-600 dark:text-[#9CA3AF] animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-[#9CA3AF]">Loading companies...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && displayCompanies.length === 0) {
    return (
      <div className="h-full flex bg-white dark:bg-[#0F0F0F]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED] mb-2">Error Loading Companies</h3>
            <p className="text-gray-600 dark:text-[#9CA3AF] mb-4">{error}</p>
            <button
              onClick={() => fetchCompanies()}
              className="bg-[#006239] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#006239] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-white dark:bg-[#0F0F0F]">
      {/* Companies Sidebar - Always Visible */}
      <div className={cn(
        "bg-white dark:bg-[#1A1A1A] border-r border-gray-200 dark:border-[#2A2A2A] flex flex-col transition-all duration-300",
        selectedCompany ? "w-96" : "w-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#006239] rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED]">Companies</h1>
                <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                  {displayCompanies.length.toLocaleString()} companies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="p-2 text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors rounded-xl"
                title="Export to CSV"
              >
                <FileDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchCompanies()}
                className="p-2 text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors rounded-xl"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search and Quick Actions */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] placeholder-gray-500 dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#006239] focus:border-transparent rounded-xl"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-2 transition-colors rounded-xl",
                  viewMode === 'table' 
                    ? "bg-[#006239] text-white" 
                    : "text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 transition-colors rounded-xl",
                  viewMode === 'grid' 
                    ? "bg-[#006239] text-white" 
                    : "text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-[#2A2A2A] rounded-xl border border-gray-300 dark:border-[#3A3A3A]">
                <div className="text-lg font-semibold text-[#006239]">{stats.highFitCount}</div>
                <div className="text-xs text-gray-600 dark:text-[#9CA3AF]">High Fit</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-[#2A2A2A] rounded-xl border border-gray-300 dark:border-[#3A3A3A]">
                <div className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED]">{stats.averageEmployees}</div>
                <div className="text-xs text-gray-600 dark:text-[#9CA3AF]">Avg Employees</div>
              </div>
            </div>
          )}

          {/* Quick Filters */}
          <div className="space-y-3">
            <select
              value={selectedICP}
              onChange={(e) => setSelectedICP(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] text-sm focus:outline-none focus:ring-2 focus:ring-[#006239] rounded-xl"
            >
              <option value="all">All ICP Models</option>
              {icpModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} {model.isPrimary && '⭐'}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-xl transition-colors text-sm",
                showFilters 
                  ? "bg-[#006239] text-white border-[#006239]" 
                  : "bg-gray-50 dark:bg-[#2A2A2A] border-gray-300 dark:border-[#3A3A3A] text-gray-700 dark:text-[#9CA3AF] hover:bg-gray-100 dark:hover:bg-[#3A3A3A]"
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-4 bg-gray-50 dark:bg-[#2A2A2A] rounded-xl border border-gray-300 dark:border-[#3A3A3A] space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-[#9CA3AF] mb-1">Industry</label>
                      <select
                        value={filters.industry}
                        onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full px-2 py-1 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] text-xs focus:outline-none focus:ring-1 focus:ring-[#006239] rounded-lg"
                      >
                        <option value="all">All Industries</option>
                        {availableFilters.industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-[#9CA3AF] mb-1">Country</label>
                      <select
                        value={filters.country}
                        onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-2 py-1 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] text-xs focus:outline-none focus:ring-1 focus:ring-[#006239] rounded-lg"
                      >
                        <option value="all">All Countries</option>
                        {availableFilters.countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-[#9CA3AF] mb-1">
                      Employees: {filters.minEmployees} - {filters.maxEmployees}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minEmployees}
                        onChange={(e) => setFilters(prev => ({ ...prev, minEmployees: parseInt(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] text-xs focus:outline-none focus:ring-1 focus:ring-[#006239] rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxEmployees}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxEmployees: parseInt(e.target.value) || 10000 }))}
                        className="w-full px-2 py-1 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] text-xs focus:outline-none focus:ring-1 focus:ring-[#006239] rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#3A3A3A] text-gray-700 dark:text-[#9CA3AF] text-sm hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors rounded-xl"
                  >
                    Reset All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Companies List */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'table' ? (
            <TableView 
              companies={displayCompanies}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          ) : (
            <GridView 
              companies={displayCompanies}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
            />
          )}

          {displayCompanies.length === 0 && !loading && (
            <EmptyState 
              totalCompanies={0}
              onStartSearch={() => window.location.href = '/'}
            />
          )}
        </div>
      </div>

      {/* Company Detail Panel */}
      <AnimatePresence>
        {selectedCompany && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25 }}
            className="flex-1 flex flex-col min-w-0"
          >
            <CompanyDetail 
              company={selectedCompany}
              onClose={() => setSelectedCompany(null)}
              onRefresh={() => fetchCompanies()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Table View Component
function TableView({ 
  companies, 
  selectedCompany, 
  onSelectCompany,
  sortConfig,
  onSort 
}: { 
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
  sortConfig: { field: keyof Company; direction: 'asc' | 'desc' };
  onSort: (field: keyof Company) => void;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-[#006239]";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#2A2A2A]">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-[#9CA3AF]">
                <button
                  onClick={() => onSort('name')}
                  className="flex items-center gap-1 hover:text-[#006239] transition-colors"
                >
                  Company
                  {sortConfig.field === 'name' && (
                    sortConfig.direction === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-[#9CA3AF]">Industry</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-[#9CA3AF]">
                <button
                  onClick={() => onSort('employee_count')}
                  className="flex items-center gap-1 hover:text-[#006239] transition-colors"
                >
                  Employees
                  {sortConfig.field === 'employee_count' && (
                    sortConfig.direction === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-[#9CA3AF]">Revenue</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-[#9CA3AF]">Location</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-[#9CA3AF]">ICP Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#2A2A2A]">
            {companies.map((company) => (
              <tr
                key={company.company_id}
                className={cn(
                  "group cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#2A2A2A]",
                  selectedCompany?.company_id === company.company_id && "bg-[#006239]/5 dark:bg-[#006239]/10"
                )}
                onClick={() => onSelectCompany(company)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {company.logo_url ? (
                      <img 
                        src={company.logo_url} 
                        alt={company.name}
                        className="w-8 h-8 rounded-lg border border-gray-300 dark:border-[#3A3A3A]"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#006239] rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-[#EDEDED] group-hover:text-[#006239] transition-colors">
                        {company.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#9CA3AF]">
                        {company.domain}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-[#EDEDED]">
                  {Array.isArray(company.industry) ? company.industry[0] : company.industry}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-[#EDEDED]">
                  {company.employee_count ? company.employee_count.toLocaleString() : '-'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-[#EDEDED]">
                  {company.annual_revenue ? formatCurrency(company.annual_revenue, company.annual_revenue_currency) : '-'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-[#EDEDED]">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#006239]" />
                    {company.location?.country}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {company.scoring_metrics?.fit_score?.score ? (
                    <div className={cn(
                      "text-sm font-semibold",
                      getScoreColor(company.scoring_metrics.fit_score.score)
                    )}>
                      {company.scoring_metrics.fit_score.score}%
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-[#6A6A6A]">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Grid View Component
function GridView({ 
  companies, 
  selectedCompany, 
  onSelectCompany 
}: { 
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
}) {
  return (
    <div className="p-4 grid grid-cols-1 gap-3">
      <AnimatePresence mode="popLayout">
        {companies.map((company, index) => (
          <motion.div
            key={company.company_id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05, type: "spring" }}
            className={cn(
              "p-4 border rounded-2xl cursor-pointer transition-all duration-200 group",
              "bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2A2A2A]",
              "hover:border-[#006239] hover:shadow-md",
              selectedCompany?.company_id === company.company_id && "border-[#006239] bg-[#006239]/5 dark:bg-[#006239]/10"
            )}
            onClick={() => onSelectCompany(company)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={company.name}
                    className="w-10 h-10 rounded-xl border border-gray-300 dark:border-[#3A3A3A]"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[#006239] rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED] group-hover:text-[#006239] transition-colors">
                    {company.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">{company.domain}</p>
                </div>
              </div>
              {company.scoring_metrics?.fit_score?.score && (
                <div className={cn(
                  "px-2 py-1 text-xs font-medium rounded-lg",
                  company.scoring_metrics.fit_score.score >= 80
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : company.scoring_metrics.fit_score.score >= 60
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                )}>
                  {company.scoring_metrics.fit_score.score}%
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-[#9CA3AF]">
              {company.industry && (
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-[#006239]" />
                  <span>{Array.isArray(company.industry) ? company.industry[0] : company.industry}</span>
                </div>
              )}
              {company.employee_count && (
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-[#006239]" />
                  <span>{company.employee_count.toLocaleString()} employees</span>
                </div>
              )}
              {company.location?.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-[#006239]" />
                  <span>{company.location.country}</span>
                </div>
              )}
            </div>

            {company.technologies && company.technologies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {company.technologies.slice(0, 3).map((tech, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
                {company.technologies.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-[#9CA3AF]">
                    +{company.technologies.length - 3}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function EmptyState({ totalCompanies, onStartSearch }: { totalCompanies: number; onStartSearch: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gray-100 dark:bg-[#2A2A2A] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-gray-600 dark:text-[#9CA3AF]" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#EDEDED] mb-3">
          {totalCompanies === 0 ? "No Companies Yet" : "No Results Found"}
        </h2>
        <p className="text-gray-600 dark:text-[#9CA3AF] mb-6">
          {totalCompanies === 0 
            ? "Start your first search to discover companies that match your investment criteria."
            : "Try adjusting your search terms or filters to find matching companies."
          }
        </p>
        {totalCompanies === 0 && (
          <button
            onClick={onStartSearch}
            className="bg-[#006239] text-white px-6 py-3 font-semibold hover:bg-[#006239] transition-all duration-300 inline-flex items-center gap-2 rounded-xl shadow-sm hover:shadow-md"
          >
            <Sparkles className="w-5 h-5" />
            Start Your First Search
          </button>
        )}
      </div>
    </div>
  )
}