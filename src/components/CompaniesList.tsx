// components/CompaniesList.tsx
'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Company, ICPModel } from '@/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { CompanyDetail } from './CompanyDetail'

// Brand Colors
const ACCENT_GREEN = '#006239'
const ACTIVE_GREEN = '#006239'

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

interface ColumnConfig {
  key: keyof Company | 'actions';
  label: string;
  sortable: boolean;
  visible: boolean;
  width?: string;
}

export function CompaniesList() {
  const userID = process.env.NEXT_PUBLIC_MOCK_USER_ID
  const { icpModels, primaryModel } = useSession()
  
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

  // Table Configuration
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    { key: 'name', label: 'Company', sortable: true, visible: true, width: '25%' },
    { key: 'industry', label: 'Industry', sortable: true, visible: true, width: '15%' },
    { key: 'employee_count', label: 'Employees', sortable: true, visible: true, width: '10%' },
    { key: 'annual_revenue', label: 'Revenue', sortable: true, visible: true, width: '12%' },
    { key: 'country', label: 'Location', sortable: true, visible: true, width: '10%' },
    { key: 'scoring_metrics', label: 'ICP Score', sortable: true, visible: true, width: '10%' },
    { key: 'technologies', label: 'Tech Stack', sortable: false, visible: true, width: '13%' },
    { key: 'actions', label: '', sortable: false, visible: true, width: '5%' }
  ])

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Refs to prevent multiple requests
  const isFetchingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch companies - FIXED: Remove dependencies that cause recreations
  const fetchCompanies = useCallback(async (page = 1, resetFilters = false) => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      console.log('⏸️ Already fetching, skipping request')
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    try {
      isFetchingRef.current = true
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

      // Create new abort controller
      abortControllerRef.current = new AbortController()

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

      console.log('🔍 Fetching companies with params:', Object.fromEntries(params))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': `${userID}`
        },
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) throw new Error('Failed to fetch companies')

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
    } catch (err: any) {
      // Don't show error for aborted requests
      if (err.name === 'AbortError') {
        console.log('⏸️ Request was aborted')
        return
      }
      console.error('Error fetching companies:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch companies')
    } finally {
      isFetchingRef.current = false
      setLoading(false)
    }
  }, [
    // Only include stable dependencies
    userID,
    // Remove filters and searchQuery from dependencies to prevent recreations
  ])

  // Fetch statistics - FIXED: Stable function
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/stats`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': `${userID}`
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
  }, [userID])

  // Initial data fetch - FIXED: Only run once
  useEffect(() => {
    console.log('🚀 Initial data fetch')
    fetchCompanies(1)
    fetchStats()
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, []) // Empty dependency array - only run once on mount

  // Debounced search - FIXED: Proper debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🔍 Debounced search triggered')
      fetchCompanies(1)
    }, 500)

    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [searchQuery, fetchCompanies])

  // Handle filter changes - FIXED: Single effect for all filters
  useEffect(() => {
    console.log('🔍 Filter change detected')
    fetchCompanies(1)
  }, [selectedICP, filters, sortConfig, fetchCompanies])

  // Handle pagination limit changes
  useEffect(() => {
    console.log('🔍 Pagination limit changed')
    fetchCompanies(1)
  }, [pagination.limit, fetchCompanies])

  // Handle sort
  const handleSort = (field: keyof Company) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    console.log('📄 Page change:', newPage)
    fetchCompanies(newPage)
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
          'x-user-id': `${userID}`
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
    console.log('🔄 Resetting filters')
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
    // Trigger fetch after reset
    setTimeout(() => fetchCompanies(1, true), 0)
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
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

  // Visible columns
  const visibleColumns = useMemo(() => 
    columnConfig.filter(col => col.visible), 
    [columnConfig]
  )

  if (loading && companies.length === 0) {
    return (
      <div className="min-h-[100vh] flex bg-white dark:bg-[#0F0F0F]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-600 dark:text-[#9CA3AF] animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-[#9CA3AF]">Loading companies...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && companies.length === 0) {
    return (
      <div className="min-h-[100vh] flex bg-white dark:bg-[#0F0F0F]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED] mb-2">Error Loading Companies</h3>
            <p className="text-gray-600 dark:text-[#9CA3AF] mb-4">{error}</p>
            <button
              onClick={() => fetchCompanies(1)}
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
    <div className="min-h-[100vh] flex flex-col bg-white dark:bg-[#0F0F0F]">
      {/* Header with Stats */}
      <div className="border-b border-gray-200 dark:border-[#2A2A2A]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-xl transition-colors text-gray-600 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-[#EDEDED]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#006239] rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#EDEDED]">Companies</h1>
                  <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                    {pagination.total.toLocaleString()} companies analyzed
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-[#9CA3AF] rounded-xl hover:bg-gray-200 dark:hover:bg-[#3A3A3A] transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => fetchCompanies(1, true)}
                disabled={loading}
                className={cn(
                  "p-2 transition-colors rounded-xl",
                  loading 
                    ? "text-gray-400 dark:text-[#6A6A6A] cursor-not-allowed" 
                    : "text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                )}
              >
                <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Statistics Overview */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Total Companies"
                value={stats.totalCompanies.toString()}
                trend="+12%"
                color="blue"
              />
              <StatCard
                icon={<CheckCircle className="w-5 h-5" />}
                label="High Fit Score"
                value={stats.highFitCount.toString()}
                trend={`${Math.round((stats.highFitCount / stats.totalCompanies) * 100)}%`}
                color="green"
              />
              <StatCard
                icon={<Users className="w-5 h-5" />}
                label="Avg Employees"
                value={stats.averageEmployees.toLocaleString()}
                trend="+5%"
                color="purple"
              />
              <StatCard
                icon={<Clock className="w-5 h-5" />}
                label="New (30d)"
                value={stats.recentAdditions.toString()}
                trend="+8"
                color="orange"
              />
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies, industries, technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] placeholder-gray-500 dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#006239] focus:border-transparent rounded-xl"
              />
            </div>
            <select
              value={selectedICP}
              onChange={(e) => setSelectedICP(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] focus:outline-none focus:ring-2 focus:ring-[#006239] rounded-xl"
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
              disabled={loading}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border rounded-xl transition-colors",
                loading 
                  ? "bg-gray-100 dark:bg-[#1A1A1A] text-gray-400 dark:text-[#6A6A6A] cursor-not-allowed" 
                  : showFilters 
                    ? "bg-[#006239] text-white border-[#006239]" 
                    : "bg-gray-50 dark:bg-[#2A2A2A] border-gray-300 dark:border-[#3A3A3A] text-gray-700 dark:text-[#9CA3AF] hover:bg-gray-100 dark:hover:bg-[#3A3A3A]"
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
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
                <div className="mt-4 p-4 bg-gray-50 dark:bg-[#2A2A2A] rounded-xl border border-gray-300 dark:border-[#3A3A3A] grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#9CA3AF] mb-2">Industry</label>
                    <select
                      value={filters.industry}
                      onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-[#006239] rounded-lg"
                    >
                      <option value="all">All Industries</option>
                      {availableFilters.industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#9CA3AF] mb-2">Country</label>
                    <select
                      value={filters.country}
                      onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-[#006239] rounded-lg"
                    >
                      <option value="all">All Countries</option>
                      {availableFilters.countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#9CA3AF] mb-2">Employees Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minEmployees}
                        onChange={(e) => setFilters(prev => ({ ...prev, minEmployees: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-[#006239] rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxEmployees}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxEmployees: parseInt(e.target.value) || 10000 }))}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-[#006239] rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      disabled={loading}
                      className={cn(
                        "w-full px-4 py-2 border transition-colors rounded-lg",
                        loading
                          ? "bg-gray-100 dark:bg-[#1A1A1A] text-gray-400 dark:text-[#6A6A6A] cursor-not-allowed"
                          : "bg-white dark:bg-[#1A1A1A] border-gray-300 dark:border-[#3A3A3A] text-gray-700 dark:text-[#9CA3AF] hover:bg-gray-50 dark:hover:bg-[#2A2A2A]"
                      )}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Table Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-[#9CA3AF]">
              Showing {companies.length} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('table')}
                disabled={loading}
                className={cn(
                  "p-2 transition-colors rounded-lg",
                  loading
                    ? "text-gray-400 dark:text-[#6A6A6A] cursor-not-allowed"
                    : viewMode === 'table' 
                      ? "bg-[#006239] text-white" 
                      : "text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                disabled={loading}
                className={cn(
                  "p-2 transition-colors rounded-lg",
                  loading
                    ? "text-gray-400 dark:text-[#6A6A6A] cursor-not-allowed"
                    : viewMode === 'grid' 
                      ? "bg-[#006239] text-white" 
                      : "text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={pagination.limit}
              onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              disabled={loading}
              className="px-3 py-1 bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-[#3A3A3A] text-gray-900 dark:text-[#EDEDED] text-sm rounded-lg disabled:opacity-50"
            >
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'table' ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]">
                  {visibleColumns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-[#9CA3AF] uppercase tracking-wider"
                      style={{ width: column.width }}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {column.sortable && (
                          <button
                            onClick={() => column.key !== 'actions' && handleSort(column.key as keyof Company)}
                            disabled={loading}
                            className={cn(
                              "transition-colors",
                              loading
                                ? "text-gray-400 cursor-not-allowed"
                                : sortConfig.field === column.key 
                                  ? "text-[#006239]" 
                                  : "text-gray-400 hover:text-gray-600 dark:hover:text-[#9CA3AF]"
                            )}
                          >
                            {sortConfig.field === column.key && sortConfig.direction === 'asc' ? (
                              <SortAsc className="w-3 h-3" />
                            ) : (
                              <SortDesc className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#2A2A2A]">
                {companies.map((company) => (
                  <tr
                    key={company.company_id}
                    
                    className={cn(
                      "group cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#1A1A1A]",
                      selectedCompany?.company_id === company.company_id && "bg-[#006239]/5 dark:bg-[#006239]/10"
                    )}
                    onClick={() => setSelectedCompany(company)}
                  >
                    {/* Company Name */}
                    <td className="px-4 py-3">
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

                    {/* Industry */}
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-[#EDEDED]">
                      {Array.isArray(company.industry) ? company.industry[0] : company.industry}
                    </td>

                    {/* Employees */}
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-[#EDEDED]">
                      {company.employee_count ? company.employee_count.toLocaleString() : '-'}
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-[#EDEDED]">
                      {company.annual_revenue ? formatCurrency(company.annual_revenue, company.annual_revenue_currency) : '-'}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-[#EDEDED]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#006239]" />
                        {company.country}
                      </div>
                    </td>

                    {/* ICP Score */}
                    <td className="px-4 py-3">
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

                    {/* Technologies */}
                    <td className="px-4 py-3">
                      {company.technologies && company.technologies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {company.technologies.slice(0, 2).map((tech, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-lg"
                            >
                              {tech}
                            </span>
                          ))}
                          {company.technologies.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-[#9CA3AF]">
                              +{company.technologies.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-[#6A6A6A]">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCompany(company)
                        }}
                        className="p-1 text-gray-400 hover:text-[#006239] transition-colors rounded-lg"
                        title="View Details"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Grid View Fallback
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <CompanyGridCard 
                  key={company.company_id}
                  company={company}
                  onSelect={setSelectedCompany}
                  isSelected={selectedCompany?.company_id === company.company_id}
                />
              ))}
            </div>
          )}

          {companies.length === 0 && !loading && (
            <div className="flex-1 flex items-center justify-center p-12">
              <EmptyState 
                totalCompanies={pagination.total}
                onStartSearch={() => window.location.href = '/'}
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className={cn(
                    "px-4 py-2 text-sm transition-colors rounded-xl",
                    pagination.hasPrev && !loading
                      ? "bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-[#3A3A3A] text-gray-700 dark:text-[#9CA3AF] hover:bg-gray-50 dark:hover:bg-[#3A3A3A] hover:text-[#006239]"
                      : "bg-gray-100 dark:bg-[#1A1A1A] text-gray-400 dark:text-[#6A6A6A] cursor-not-allowed"
                  )}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext || loading}
                  className={cn(
                    "px-4 py-2 text-sm transition-colors rounded-xl",
                    pagination.hasNext && !loading
                      ? "bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-[#3A3A3A] text-gray-700 dark:text-[#9CA3AF] hover:bg-gray-50 dark:hover:bg-[#3A3A3A] hover:text-[#006239]"
                      : "bg-gray-100 dark:bg-[#1A1A1A] text-gray-400 dark:text-[#6A6A6A] cursor-not-allowed"
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      <AnimatePresence>
        {selectedCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setSelectedCompany(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "w-full h-full overflow-hidden",
                "bg-white dark:bg-[#0F0F0F]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <CompanyDetail 
                company={selectedCompany}
                onClose={() => setSelectedCompany(null)}
                onRefresh={() => fetchCompanies(pagination.page)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Supporting Components (keep the same as before)
function StatCard({ icon, label, value, trend, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  trend: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-[#006239]',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
  }

  return (
    <div className={cn(
      "p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A]",
      colorClasses[color]
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-white dark:bg-[#1A1A1A] rounded-xl">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-[#9CA3AF]">{trend}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED]">{value}</div>
      <div className="text-sm text-gray-600 dark:text-[#9CA3AF]">{label}</div>
    </div>
  )
}

function CompanyGridCard({ company, onSelect, isSelected }: { 
  company: Company; 
  onSelect: (company: Company) => void;
  isSelected: boolean;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (score >= 60) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-2xl cursor-pointer transition-all duration-200 group",
        "bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2A2A2A]",
        "hover:border-[#006239] hover:shadow-md",
        isSelected && "border-[#006239] bg-[#006239]/5 dark:bg-[#006239]/10"
      )}
      onClick={() => onSelect(company)}
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
            getScoreColor(company.scoring_metrics.fit_score.score)
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
        {company.country && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-[#006239]" />
            <span>{company.country}</span>
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

      <div className="mt-3 flex justify-end">
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onSelect(company)
          }}
          className="p-1 text-gray-400 hover:text-[#006239] transition-colors rounded-lg"
          title="View Details"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function EmptyState({ totalCompanies, onStartSearch }: { totalCompanies: number; onStartSearch: () => void }) {
  return (
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
  )
}