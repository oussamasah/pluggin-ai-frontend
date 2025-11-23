// components/EnhancedSearchResults.tsx
'use client'

import { useSession } from '@/context/SessionContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, MapPin, Users, Target, Zap, ExternalLink, Save, Database, 
  Filter, Cpu, Linkedin, X, Mail, Phone, Globe, Calendar, ArrowLeft, 
  Check, Clock, AlertCircle, CheckCircle, Sparkles, DollarSign, 
  TrendingUp, Shield, Network, FileText, Hash, CreditCard, Building,
  Earth, PhoneCall, MessageCircle, BarChart3, Crosshair, TargetIcon,
  Wallet, Users2, CalendarDays, RefreshCw, Layers,
  Crown,
  Eye,
  BarChart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Company } from '@/types'
import { useState, useCallback, useMemo } from 'react'

// Brand Colors
const ACCENT_GREEN = '#006239' // Primary brand green
const ACTIVE_GREEN = '#006239' // User chat bubbles & active states

export function EnhancedSearchResults() {
  const { currentSession } = useSession()
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set())

  const handleSaveCompany = useCallback((companyId: string) => {
    setSavedCompanies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(companyId)) {
        newSet.delete(companyId)
      } else {
        newSet.add(companyId)
      }
      return newSet
    })
  }, [])

  if (!currentSession?.companies || currentSession.companies.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-white dark:bg-[#0F0F0F]">
        <div className="text-center">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border",
            "bg-[#F9FAFB] dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
          )}>
            <Target className="w-8 h-8 text-gray-400 dark:text-[#9CA3AF]" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED] mb-2">No Results Yet</h3>
          <p className="text-sm text-gray-600 dark:text-[#9CA3AF] font-light">Matching companies will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <>

      <div className="h-full flex flex-col bg-white dark:bg-[#0F0F0F]">
        {/* Header */}
        <div className={cn(
          "p-4 border-b",
          "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-[#EDEDED]">Matching Companies</h2>
              <p className="text-xs text-gray-500 dark:text-[#9CA3AF] font-light">
                {currentSession.companies.length} companies found • {savedCompanies.size} saved
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className={cn(
                "p-2 rounded-xl transition-all duration-300 border border-transparent hover:border",
                "text-gray-400 hover:text-[#006239]",
                "hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:border-gray-300 dark:hover:border-[#2A2A2A]"
              )}>
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <AnimatePresence>
              {currentSession.companies.map((company, index) => (
                <motion.div
                  key={company.company_id || `${company.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CompanyCard 
                    company={company} 
                    onViewDetails={() => setSelectedCompany(company)}
                    onSaveCompany={handleSaveCompany}
                    isSaved={savedCompanies.has(company.company_id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Company Details Modal */}
      <AnimatePresence>
        {selectedCompany && (
          <CompanyDetailsModal
            company={selectedCompany}
            onClose={() => setSelectedCompany(null)}
            onSaveCompany={handleSaveCompany}
            isSaved={savedCompanies.has(selectedCompany.company_id)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

interface CompanyCardProps {
  company: Company
  onViewDetails: () => void
  onSaveCompany: (companyId: string) => void
  isSaved: boolean
}

function CompanyCard({ company, onViewDetails, onSaveCompany, isSaved }: CompanyCardProps) {
  const formatArray = useCallback((data: any): string => {
    if (Array.isArray(data)) return data.join(', ');
    if (typeof data === 'string') return data;
    return 'Not specified';
  }, []);

  const formatCurrency = useCallback((amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  const formattedTechnologies = useMemo(() => 
    company.technologies?.slice(0, 3) || [], 
    [company.technologies]
  );

  return (
    <div className={cn(
      "p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group border",
      "bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2A2A2A]",
      "hover:border-[#006239]/30"
    )}>
      <div className="flex items-start gap-3 mb-4">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.name} logo`}
            className="w-12 h-12 rounded-xl object-cover border border-gray-300 dark:border-[#2A2A2A]"
          />
        ) : (
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: ACCENT_GREEN }}
          >
            <Database className="w-6 h-6 text-white" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED] truncate">{company.name}</h3>
              {company.funding_stage && (
                <span className={cn(
                  "px-2 py-1 rounded-lg text-xs font-semibold border",
                  "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                )}>
                  {company.funding_stage}
                </span>
              )}
            </div>
            {company.website && (
              <a 
                href={company.website} 
                target='_blank' 
                rel="noopener noreferrer" 
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 rounded-lg text-gray-400 hover:text-[#006239] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <Globe className="w-3 h-3 text-[#006239]" />
            <span className="text-xs text-gray-600 dark:text-[#9CA3AF] font-light">{company.domain}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {company.description && (
        <p className="text-sm text-gray-600 dark:text-[#9CA3AF] font-light leading-relaxed line-clamp-2 mb-4">
          {company.description}
        </p>
      )}

      {/* Basic Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Location */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#9CA3AF] font-light">
          <MapPin className="w-3.5 h-3.5 text-[#006239]" />
          <span>{company.location.country != undefined && company?.location?.country} {company.location.city != undefined && " - " + company.location.city}</span>
        </div>

        {/* Employees */}
        {company.employee_count && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#9CA3AF] font-light">
            <Users className="w-3.5 h-3.5 text-[#006239]" />
            <span>{company.employee_count.toLocaleString()} employees</span>
          </div>
        )}

        {/* Founded Year */}
        {company.founded_year && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#9CA3AF] font-light">
            <Calendar className="w-3.5 h-3.5 text-[#006239]" />
            <span>Founded {company.founded_year}</span>
          </div>
        )}

        {/* Industry */}
        {company.industry && company.industry.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#9CA3AF] font-light">
            <Target className="w-3.5 h-3.5 text-[#006239]" />
            <span className="truncate">{formatArray(company.industry)}</span>
          </div>
        )}
      </div>

      {/* Financial Info */}
      <div className="flex gap-3 mb-4">
        {/* Annual Revenue */}
        {company.annual_revenue && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border",
            "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          )}>
            <DollarSign className="w-3.5 h-3.5" />
            <span>{formatCurrency(company.annual_revenue, company.annual_revenue_currency)}</span>
          </div>
        )}

        {/* Total Funding */}
        {company.total_funding && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border",
            "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
          )}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{formatCurrency(company.total_funding, 'USD')}</span>
          </div>
        )}
      </div>

      {/* Scores */}
      <div className="flex gap-3 mb-4">
        {/* ICP Score from scoring_metrics */}
        {company.scoring_metrics?.fit_score && (
          <ScorePill 
            label="ICP Fit" 
            score={company.scoring_metrics.fit_score.score} 
            color={
              company.scoring_metrics.fit_score.score >= 80 ? 'green' :
              company.scoring_metrics.fit_score.score >= 60 ? 'yellow' : 'red'
            }
          />
        )}

        {/* Intent Score from scoring_metrics */}
        {company.scoring_metrics?.intent_score && (
          <ScorePill 
            label="Intent" 
            score={company.scoring_metrics.intent_score.score} 
            color={
              company.scoring_metrics.intent_score.score >= 80 ? 'green' :
              company.scoring_metrics.intent_score.score >= 60 ? 'yellow' : 'red'
            }
          />
        )}
      </div>

      {/* Technologies */}
      {company.technologies && company.technologies.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-3.5 h-3.5 text-[#006239]" />
          <div className="flex gap-1.5 flex-wrap">
            {formattedTechnologies.map((tech, index) => (
              <span
                key={index}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border",
                  "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                )}
              >
                {tech}
              </span>
            ))}
            {company.technologies.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-[#9CA3AF] font-light">
                +{company.technologies.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Social Links */}
      <div className="flex items-center gap-3 mb-4">
        {company.linkedin_url && (
          <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#006239] transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A]">
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {company.twitter_url && (
          <a href={company.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#006239] transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A]">
            <MessageCircle className="w-4 h-4" />
          </a>
        )}
        {company.facebook_url && (
          <a href={company.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#006239] transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A]">
            <Network className="w-4 h-4" />
          </a>
        )}
        {company.instagram_url && (
          <a href={company.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#006239] transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A]">
            <Hash className="w-4 h-4" />
          </a>
        )}
        {company.crunchbase_url && (
          <a href={company.crunchbase_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#006239] transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A]">
            <BarChart className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
        <button 
          onClick={onViewDetails}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border",
            "bg-[#006239] text-white border-[#006239] hover:bg-[#006239] hover:border-[#006239]",
            "shadow-sm hover:shadow-md"
          )}
        >
          View Details
        </button>
        <button 
          onClick={() => onSaveCompany(company.company_id)}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border flex items-center justify-center gap-2",
            "shadow-sm hover:shadow-md",
            isSaved 
              ? cn(
                  "text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
                  "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                ) 
              : cn(
                  "text-gray-700 dark:text-[#9CA3AF] border-gray-300 dark:border-[#2A2A2A]",
                  "bg-[#F9FAFB] dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                )
          )}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  )
}

interface CompanyDetailsModalProps {
  company: Company
  onClose: () => void
  onSaveCompany: (companyId: string) => void
  isSaved: boolean
}

function CompanyDetailsModal({ company, onClose, onSaveCompany, isSaved }: CompanyDetailsModalProps) {
  const formatArray = useCallback((data: any): string => {
    if (Array.isArray(data)) return data.join(', ');
    if (typeof data === 'string') return data;
    return 'Not specified';
  }, []);

  const formatCurrency = useCallback((amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  const formatJSON = useCallback((data: any): string => {
    if (!data) return 'No data';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Invalid data';
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className={cn(
          "w-full max-w-6xl max-h-[95vh] overflow-hidden border shadow-2xl rounded-3xl",
          "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-6 border-b",
          "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]"
        )}>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-xl transition-all duration-300 border border-transparent hover:border",
                "text-gray-400 hover:text-gray-600 dark:hover:text-[#EDEDED]",
                "hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:border-gray-300 dark:hover:border-[#2A2A2A]"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-300 dark:border-[#2A2A2A]"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: ACCENT_GREEN }}
                >
                  <Database className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#EDEDED]">{company.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600 dark:text-[#9CA3AF] font-light">{company.domain}</p>
                  {company.funding_stage && (
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-xs font-semibold border",
                      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                    )}>
                      {company.funding_stage}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveCompany(company.company_id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border flex items-center gap-2",
                "shadow-sm hover:shadow-md",
                isSaved 
                  ? cn(
                      "text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
                      "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                    ) 
                  : cn(
                      "text-gray-700 dark:text-[#9CA3AF] border-gray-300 dark:border-[#2A2A2A]",
                      "bg-[#F9FAFB] dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                    )
              )}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaved ? 'Saved' : 'Save Company'}
            </button>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-xl transition-all duration-300 border border-transparent hover:border",
                "text-gray-400 hover:text-red-600 dark:hover:text-red-400",
                "hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Core Information */}
              <div className="space-y-6">
                {/* Description */}
                <Section title="Company Description" icon={<FileText className="w-5 h-5" />}>
                  <p className="text-gray-600 dark:text-[#9CA3AF] font-light leading-relaxed">
                    {company.description || 'No description available'}
                  </p>
                </Section>

                {/* Industry & Business Info */}
                <Section title="Industry & Business" icon={<TargetIcon className="w-5 h-5" />}>
                  <div className="space-y-3">
                    <InfoRow label="Industry" value={formatArray(company.industry)} />
                    <InfoRow label="Target Market" value={company.target_market} />
                    <InfoRow label="Ownership Type" value={company.ownership_type} />
                    <InfoRow label="Funding Stage" value={company.funding_stage} />
                  </div>
                </Section>

                {/* Location Information */}
                <Section title="Location" icon={<MapPin className="w-5 h-5" />}>
                  <div className="space-y-3">
                    <InfoRow label="City" value={company.location.city} />
                    <InfoRow label="Country" value={company.location.country} />
                    <InfoRow label="Country Code" value={company.location.country_code} />
                  </div>
                </Section>
              </div>

              {/* Right Column - Financial & Contact */}
              <div className="space-y-6">
                {/* Financial Information */}
                <Section title="Financial Information" icon={<DollarSign className="w-5 h-5" />}>
                  <div className="space-y-3">
                    <InfoRow 
                      label="Annual Revenue" 
                      value={company.annual_revenue ? formatCurrency(company.annual_revenue, company.annual_revenue_currency) : 'Not specified'}
                    />
                    <InfoRow 
                      label="Total Funding" 
                      value={company.total_funding ? formatCurrency(company.total_funding, 'USD') : 'Not specified'}
                    />
                    <InfoRow label="Employee Count" value={company.employee_count?.toLocaleString()} />
                    <InfoRow label="Founded Year" value={company.founded_year} />
                  </div>
                </Section>

                {/* Contact Information */}
                <Section title="Contact Information" icon={<PhoneCall className="w-5 h-5" />}>
                  <div className="space-y-3">
                    <InfoRow label="Email" value={company.contact_email} />
                    <InfoRow label="Phone" value={company.contact_phone} />
                    <InfoRow label="Website" value={company.website} isLink />
                  </div>
                </Section>

                {/* Social Profiles */}
                <Section title="Social Profiles" icon={<Network className="w-5 h-5" />}>
                  <div className="space-y-2">
                    <SocialLink href={company.linkedin_url} platform="LinkedIn" />
                    <SocialLink href={company.twitter_url} platform="Twitter" />
                    <SocialLink href={company.facebook_url} platform="Facebook" />
                    <SocialLink href={company.instagram_url} platform="Instagram" />
                    <SocialLink href={company.crunchbase_url} platform="Crunchbase" />
                  </div>
                </Section>
              </div>
            </div>

            {/* Technology Stack */}
            {company.technologies && company.technologies.length > 0 && (
              <Section title="Technology Stack" icon={<Cpu className="w-5 h-5" />}>
                <div className="flex flex-wrap gap-2">
                  {company.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium border",
                        "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                      )}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Scoring Metrics */}
            {company.scoring_metrics && (
              <Section title="Scoring Metrics" icon={<BarChart3 className="w-5 h-5" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {company.scoring_metrics.fit_score && (
                    <div className={cn(
                      "p-4 border rounded-2xl",
                      "bg-[#F9FAFB] dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
                    )}>
                      <h4 className="text-gray-900 dark:text-[#EDEDED] font-semibold mb-3">ICP Fit Score</h4>
                      <div className="space-y-2">
                        <InfoRow label="Score" value={`${company.scoring_metrics.fit_score.score}%`} />
                        <InfoRow label="Reason" value={company.scoring_metrics.fit_score.reason} />
                        <InfoRow label="Confidence" value={`${company.scoring_metrics.fit_score.confidence}%`} />
                        <InfoRow label="Factors" value={company.scoring_metrics.fit_score.factors} />
                      </div>
                    </div>
                  )}
                  {company.scoring_metrics.intent_score && (
                    <div className={cn(
                      "p-4 border rounded-2xl",
                      "bg-[#F9FAFB] dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
                    )}>
                      <h4 className="text-gray-900 dark:text-[#EDEDED] font-semibold mb-3">Intent Score</h4>
                      <div className="space-y-2">
                        <InfoRow label="Score" value={`${company.scoring_metrics.intent_score.score}%`} />
                        <InfoRow label="Reason" value={company.scoring_metrics.intent_score.reason} />
                        <InfoRow label="Confidence" value={`${company.scoring_metrics.intent_score.confidence}%`} />
                        <InfoRow label="Factors" value={company.scoring_metrics.intent_score.factors} />
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Intent Signals */}
            {company.intent_signals && (
              <Section title="Intent Signals" icon={<Crosshair className="w-5 h-5" />}>
                <pre className={cn(
                  "p-4 text-xs font-mono overflow-x-auto border rounded-2xl",
                  "bg-[#F9FAFB] dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-[#9CA3AF]"
                )}>
                  {formatJSON(company.intent_signals)}
                </pre>
              </Section>
            )}

            {/* Relationships */}
            {company.relationships && (
              <Section title="Relationships" icon={<Users2 className="w-5 h-5" />}>
                <pre className={cn(
                  "p-4 text-xs font-mono overflow-x-auto border rounded-2xl",
                  "bg-[#F9FAFB] dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-[#9CA3AF]"
                )}>
                  {formatJSON(company.relationships)}
                </pre>
              </Section>
            )}

            {/* Metadata */}
            <Section title="Metadata" icon={<Layers className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoRow label="Company ID" value={company.company_id} />
                <InfoRow label="Session ID" value={company.session_id} />
                <InfoRow label="ICP Model ID" value={company.icp_model_id} />
                <InfoRow label="Created At" value={new Date(company.created_at).toLocaleString()} />
                <InfoRow label="Updated At" value={new Date(company.updated_at).toLocaleString()} />
              </div>
            </Section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Helper Components
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="text-[#006239]">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function formatValueToString(value: any): string {
  if (typeof value === 'object' && value !== null) {
      try {
          return JSON.stringify(value);
      } catch (error) {
          return String(value); 
      }
  } else if (typeof value === 'string') {
      return value;
  } else if (value === null || value === undefined) {
      return String(value);
  } else {
      return String(value);
  }
}

function InfoRow({ label, value, isLink = false }: { label: string; value: any; isLink?: boolean }) {
  if (!value) return null;

  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-600 dark:text-[#9CA3AF] font-light text-sm">{label}</span>
      {isLink ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[#006239] hover:underline font-medium text-sm text-right max-w-[60%] break-words"
        >
          {value}
        </a>
      ) : (
        <span className="text-gray-900 dark:text-[#EDEDED] font-medium text-sm text-right max-w-[60%] break-words">
          {formatValueToString(value)}
        </span>
      )}
    </div>
  )
}

function SocialLink({ href, platform }: { href: string; platform: string }) {
  if (!href) return null;

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center gap-2 text-gray-600 dark:text-[#9CA3AF] hover:text-[#006239] transition-colors group p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
    >
      <ExternalLink className="w-3 h-3" />
      <span className="text-sm font-light">{platform}</span>
    </a>
  )
}

function ScorePill({ 
  label, 
  score, 
  color 
}: { 
  label: string
  score: number
  color: 'green' | 'yellow' | 'red'
}) {
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
  }

  return (
    <div className={cn(
      "px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-300",
      colorClasses[color]
    )}>
      {label}: {score}%
    </div>
  )
}