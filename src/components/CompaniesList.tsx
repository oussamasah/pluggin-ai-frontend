// components/CompaniesList.tsx
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
  SortDesc
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Company, ICPModel } from '@/types'
import { format } from 'date-fns'
import Link from 'next/link'
import ShaderBackground from './ui/web-gl-shader'
import { CompanyDetail } from './CompanyDetail'

interface CompaniesResponse {
  error: string
  success: boolean;
  companies: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    availableIndustries: string[];
    availableCountries: string[];
    availableTechnologies: string[];
  };
}

interface CompanyStats {
  totalCompanies: number;
  byIndustry: Record<string, number>;
  byCountry: Record<string, number>;
  byEmployeeRange: Record<string, number>;
  averageRevenue: number;
  averageEmployees: number;
  highIntentCount: number;
  highFitCount: number;
  recentAdditions: number;
}

export function CompaniesList() {
    const userID = process.env.NEXT_PUBLIC_MOCK_USER_ID

  const { icpModels, primaryModel } = useSession()
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<CompanyStats | null>(null)
  
  // UI State
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [availableFilters, setAvailableFilters] = useState({
    industries: [] as string[],
    countries: [] as string[],
    technologies: [] as string[]
  })

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Fetch companies from backend
  const fetchCompanies = useCallback(async (page = 1, resetFilters = false) => {
    try {
      setLoading(true)
      setError(null)
      
      if (resetFilters) {
        setSearchQuery('')
        setFilters({
          industry: 'all',
          country: 'all',
          minEmployees: 0,
          maxEmployees: 10000,
          fundingStage: 'all',
          targetMarket: 'all'
        })
        setSelectedICP('all')
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction
      })

      if (searchQuery) params.append('search', searchQuery)
      if (selectedICP !== 'all') params.append('icpModelId', selectedICP)
      if (filters.industry !== 'all') params.append('industry', filters.industry)
      if (filters.country !== 'all') params.append('country', filters.country)
      if (filters.minEmployees > 0) params.append('minEmployees', filters.minEmployees.toString())
      if (filters.maxEmployees < 10000) params.append('maxEmployees', filters.maxEmployees.toString())
      if (filters.fundingStage !== 'all') params.append('fundingStage', filters.fundingStage)
      if (filters.targetMarket !== 'all') params.append('targetMarket', filters.targetMarket)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies?${params}`, {
        method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id':`${userID}`
      },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }

      const data: CompaniesResponse = await response.json()
      
      if (data.success) {
        setCompanies(data.companies)
        setPagination(data.pagination)
        if (data.filters) {
          setAvailableFilters({
            industries: data.filters.availableIndustries,
            countries: data.filters.availableCountries,
            technologies: data.filters.availableTechnologies
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
  }, [searchQuery, selectedICP, filters, sortConfig, pagination.limit])

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/stats`,{
        headers: {
            'Content-Type': 'application/json',
            'x-user-id':`${userID}`
          }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [])

  // Fetch companies on component mount and when filters change
  useEffect(() => {
    fetchCompanies(1)
    fetchStats()
  }, [fetchCompanies, fetchStats])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, fetchCompanies])

  // Handle filter changes
  useEffect(() => {
    fetchCompanies(1)
  }, [selectedICP, filters, sortConfig, fetchCompanies])

  // Handle sort
  const handleSort = (field: keyof Company) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchCompanies(newPage)
  }

  // Export companies
  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filters.industry !== 'all') params.append('industry', filters.industry)
      if (filters.country !== 'all') params.append('country', filters.country)


      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/export?${params}`,{
            headers: {
        'Content-Type': 'application/json',
        'x-user-id':`${userID}`
      }})
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

  // Loading state
  if (loading && companies.length === 0) {
    return (
      <div className="h-full flex bg-black/80">
        <ShaderBackground />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-[#67F227] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading companies...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && companies.length === 0) {
    return (
      <div className="h-full flex bg-black/80">
        <ShaderBackground />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Companies</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchCompanies(1)}
              className="bg-[#67F227] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#A7F205] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-black/80">
      <ShaderBackground />

      {/* Companies Sidebar */}
      <div className="w-96 bg-slate-900/80 border-r border-gray-200/60 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link 
                href="/"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-xl">
                  <Building2 className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#67F227] to-[#A7F205] bg-clip-text text-transparent">
                    Companies
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {pagination.total.toLocaleString()} companies
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowStats(!showStats)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  showStats 
                    ? "bg-[#67F227] text-gray-900" 
                    : "text-gray-400 hover:text-[#67F227] hover:bg-white/5"
                )}
                title="Show statistics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-gray-400 hover:text-[#67F227] hover:bg-white/5 rounded-xl transition-colors"
                title="Export to CSV"
              >
                <FileDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchCompanies(1, true)}
                className="p-2 text-gray-400 hover:text-[#67F227] hover:bg-white/5 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-200/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#67F227] focus:border-transparent"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  viewMode === 'list' 
                    ? "bg-[#67F227] text-gray-900" 
                    : "text-gray-400 hover:text-[#67F227] hover:bg-white/5"
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  viewMode === 'grid' 
                    ? "bg-[#67F227] text-gray-900" 
                    : "text-gray-400 hover:text-[#67F227] hover:bg-white/5"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <select
              value={selectedICP}
              onChange={(e) => setSelectedICP(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-gray-200/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#67F227]"
            >
              <option value="all">All ICP Models</option>
              {icpModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} {model.isPrimary && '⭐'}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-xl transition-colors text-sm",
                  showFilters 
                    ? "bg-[#67F227] text-gray-900 border-[#67F227]" 
                    : "bg-white/10 border-gray-200/30 text-white hover:bg-white/20"
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
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
                <div className="mt-3 p-4 bg-white/5 rounded-xl border border-gray-200/20 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Industry</label>
                      <select
                        value={filters.industry}
                        onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full px-2 py-1 bg-white/10 border border-gray-200/30 rounded-lg text-white text-xs"
                      >
                        <option value="all">All Industries</option>
                        {availableFilters.industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Country</label>
                      <select
                        value={filters.country}
                        onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-2 py-1 bg-white/10 border border-gray-200/30 rounded-lg text-white text-xs"
                      >
                        <option value="all">All Countries</option>
                        {availableFilters.countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Employees: {filters.minEmployees} - {filters.maxEmployees}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minEmployees}
                        onChange={(e) => setFilters(prev => ({ ...prev, minEmployees: parseInt(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 bg-white/10 border border-gray-200/30 rounded-lg text-white text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxEmployees}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxEmployees: parseInt(e.target.value) || 10000 }))}
                        className="w-full px-2 py-1 bg-white/10 border border-gray-200/30 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-200/30 rounded-lg text-white text-sm hover:bg-white/20 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Statistics Panel */}
        <AnimatePresence>
          {showStats && stats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-gray-200/60"
            >
              <div className="p-4 bg-blue-500/10">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.totalCompanies}</div>
                    <div className="text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.highFitCount}</div>
                    <div className="text-gray-400">High Fit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-400">{stats.averageEmployees}</div>
                    <div className="text-gray-400">Avg Employees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{stats.recentAdditions}</div>
                    <div className="text-gray-400">New (30d)</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort Header */}
        <div className="p-4 border-b border-gray-200/60 bg-white/5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Showing {companies.length} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Sort by:</span>
              <select
                value={sortConfig.field}
                onChange={(e) => handleSort(e.target.value as keyof Company)}
                className="bg-transparent text-white text-xs border-none focus:outline-none"
              >
                <option value="name">Name</option>
                <option value="employee_count">Employees</option>
                <option value="annual_revenue">Revenue</option>
                <option value="created_at">Date Added</option>
              </select>
              <button
                onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                className="text-gray-400 hover:text-[#67F227]"
              >
                {sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Companies List */}
        <div className="flex-1 overflow-y-auto">
          <div className={cn(
            "p-4",
            viewMode === 'grid' ? "grid grid-cols-1 gap-3" : "space-y-3"
          )}>
            <AnimatePresence mode="popLayout">
              {companies.map((company, index) => (
                <motion.div
                  key={company.company_id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05, type: "spring" }}
                  className={cn(
                    "group cursor-pointer transition-all duration-200 border rounded-xl",
                    viewMode === 'grid' 
                      ? "p-4 bg-white dark:bg-gray-800 border-gray-200/60 dark:border-gray-700/60 hover:border-[#67F227] dark:hover:border-[#67F227] hover:shadow-sm"
                      : "p-4 bg-white dark:bg-gray-800 border-gray-200/60 dark:border-gray-700/60 hover:border-[#67F227] dark:hover:border-[#67F227] hover:shadow-sm",
                    selectedCompany?.company_id === company.company_id && "border-[#67F227] dark:border-[#67F227] bg-green-50 dark:bg-green-900/20"
                  )}
                  onClick={() => setSelectedCompany(company)}
                >
                  <CompanyCard company={company} viewMode={viewMode} />
                </motion.div>
              ))}
            </AnimatePresence>

            {companies.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 col-span-full"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Companies Found</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {pagination.total === 0 
                    ? "Start a search to discover companies"
                    : "Try adjusting your filters or search query"
                  }
                </p>
                {pagination.total === 0 && (
                  <Link
                    href="/"
                    className="bg-[#67F227] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#A7F205] transition-colors inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Search
                  </Link>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200/60 bg-white/5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className={cn(
                  "px-3 py-1 rounded-lg text-sm transition-colors",
                  pagination.hasPrev
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-white/5 text-gray-500 cursor-not-allowed"
                )}
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className={cn(
                  "px-3 py-1 rounded-lg text-sm transition-colors",
                  pagination.hasNext
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-white/5 text-gray-500 cursor-not-allowed"
                )}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {selectedCompany ? (
            <motion.div
              key={`detail-${selectedCompany.company_id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col overview-scroll"
            >
              <CompanyDetail 
                company={selectedCompany}
                onClose={() => setSelectedCompany(null)}
                onRefresh={() => fetchCompanies(pagination.page)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center"
            >
              <EmptyState 
                totalCompanies={pagination.total}
                onStartSearch={() => window.location.href = '/'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Sub-components
function CompanyCard({ company, viewMode }: { company: Company; viewMode: 'list' | 'grid' }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (score >= 60) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  return (
    <div className={cn(
      "w-full",
      viewMode === 'grid' ? "text-center" : "flex items-start gap-3"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex-shrink-0",
        viewMode === 'grid' ? "mx-auto mb-3" : ""
      )}>
        {company.logo_url ? (
          <img 
            src={company.logo_url} 
            alt={company.name}
            className={cn(
              "rounded border",
              viewMode === 'grid' ? "w-12 h-12" : "w-10 h-10"
            )}
          />
        ) : (
          <div className={cn(
            "bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded flex items-center justify-center",
            viewMode === 'grid' ? "w-12 h-12" : "w-10 h-10"
          )}>
            <Building2 className="w-4 h-4 text-gray-900" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 min-w-0",
        viewMode === 'grid' ? "space-y-2" : "space-y-1"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-start justify-between",
          viewMode === 'grid' ? "flex-col gap-1" : "gap-2"
        )}>
          <h3 className={cn(
            "font-semibold text-gray-900 dark:text-white truncate",
            viewMode === 'grid' ? "text-sm text-center" : "text-sm"
          )}>
            {company.name}
          </h3>
          
          {company.scoring_metrics?.fit_score?.score && (
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium flex-shrink-0",
              getScoreColor(company.scoring_metrics.fit_score.score),
              viewMode === 'grid' ? "self-center" : ""
            )}>
              {company.scoring_metrics.fit_score.score}%
            </div>
          )}
        </div>

        {/* Details */}
        <div className={cn(
          "space-y-1 text-xs text-gray-600 dark:text-gray-400",
          viewMode === 'grid' ? "text-center" : ""
        )}>
          {company.industry && company.industry.length > 0 && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="truncate">
                {Array.isArray(company.industry) 
                  ? company.industry[0]
                  : company.industry
                }
              </span>
            </div>
          )}
          
          {company.employee_count && company.employee_count > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{company.employee_count.toLocaleString()} employees</span>
            </div>
          )}
          
          {company.country && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{company.country}</span>
            </div>
          )}
        </div>

        {/* Technologies (Grid view only) */}
        {viewMode === 'grid' && company.technologies && company.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {company.technologies.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="inline-block px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
              >
                {tech}
              </span>
            ))}
            {company.technologies.length > 3 && (
              <span className="text-xs text-gray-500">
                +{company.technologies.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ totalCompanies, onStartSearch }: { totalCompanies: number; onStartSearch: () => void }) {
  return (
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-gradient-to-br from-green-100 dark:from-green-900/20 to-green-50 dark:to-green-800/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Building2 className="w-10 h-10 text-[#67F227]" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {totalCompanies === 0 ? "No Companies Yet" : "Select a Company"}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {totalCompanies === 0 
          ? "Start your first search to discover companies that match your ICP criteria."
          : "Click on a company from the list to view detailed information and insights."
        }
      </p>
      {totalCompanies === 0 && (
        <button
          onClick={onStartSearch}
          className="bg-gradient-to-r from-[#67F227] to-[#A7F205] text-gray-900 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#A7F205] hover:to-[#C3F25C] transition-all duration-300 inline-flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Start Your First Search
        </button>
      )}
    </div>
  );
}

// Keep your existing CompanyDetail, DetailSection, DetailField, ScoreField components
// They should work with the actual database Company type

