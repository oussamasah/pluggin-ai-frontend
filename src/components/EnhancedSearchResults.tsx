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

  if (!currentSession?.companies || currentSession?.companies?.length === 0) {
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

      <div className="h-full fixed overflow-y-scroll overflow-x-hidden w-100 flex flex-col bg-white dark:bg-[#0F0F0F]">
        {/* Header */}
        <div className={cn(
          "p-4 border-b",
          "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-[#EDEDED]">Matching Companies</h2>
              <p className="text-xs text-gray-500 dark:text-[#9CA3AF] font-light">
                {currentSession?.companies?.length} companies found • {savedCompanies?.size} saved
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
              {currentSession?.companies?.map((company, index) => (
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
                    isSaved={savedCompanies.has(company?.company_id)}
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
            isSaved={savedCompanies.has(selectedCompany?.company_id)}
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
    company?.technologies?.slice(0, 3) || [], 
    [company?.technologies]
  );

  return (
    <div className={cn(
      "p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group border",
      "bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2A2A2A]",
      "hover:border-[#006239]/30"
    )}>
      <div className="flex items-start gap-3 mb-4">
        {company?.logo_url ? (
          <img
            src={company?.logo_url}
            alt={`${company?.name} logo`}
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
              <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED] truncate">{company?.name}</h3>
              {company?.funding_stage && (
                <span className={cn(
                  "px-2 py-1 rounded-lg text-xs font-semibold border",
                  "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                )}>
                  {company?.funding_stage}
                </span>
              )}
            </div>
            {company?.website && (
              <a 
                href={company?.website} 
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
            <span className="text-xs text-gray-600 dark:text-[#9CA3AF] font-light">{company?.domain}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {company?.description && (
        <p className="text-sm text-gray-600 dark:text-[#9CA3AF] font-light leading-relaxed line-clamp-2 mb-4">
          {company?.description}
        </p>
      )}

      {/* Basic Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Location */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#9CA3AF] font-light">
          <MapPin className="w-3.5 h-3.5 text-[#006239]" />
          <span>{company?.location?.country != undefined && company?.location?.country} {company?.location?.city != undefined && " - " + company?.location?.city}</span>
        </div>

        {/* Employees */}
        {company?.employee_count && (
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
            score={
              company.scoring_metrics.intent_score?.analysis_metadata?.final_intent_score !== undefined
                ? company.scoring_metrics.intent_score.analysis_metadata.final_intent_score
                : company.scoring_metrics.intent_score?.score || 0
            } 
            color={
              (() => {
                const score = company.scoring_metrics.intent_score?.analysis_metadata?.final_intent_score !== undefined
                  ? company.scoring_metrics.intent_score.analysis_metadata.final_intent_score
                  : company.scoring_metrics.intent_score?.score || 0;
                return score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
              })()
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
                    <InfoRow label="City" value={company?.location?.city} />
                    <InfoRow label="Country" value={company?.location?.country} />
                    <InfoRow label="Country Code" value={company?.location?.country_code} />
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
                      value={company?.annual_revenue ? formatCurrency(company?.annual_revenue, company?.annual_revenue_currency) : 'Not specified'}
                    />
                    <InfoRow 
                      label="Total Funding" 
                      value={company?.total_funding ? formatCurrency(company?.total_funding, 'USD') : 'Not specified'}
                    />
                    <InfoRow label="Employee Count" value={company?.employee_count?.toLocaleString()} />
                    <InfoRow label="Founded Year" value={company?.founded_year} />
                  </div>
                </Section>

                {/* Contact Information */}
                <Section title="Contact Information" icon={<PhoneCall className="w-5 h-5" />}>
                  <div className="space-y-3">
                    <InfoRow label="Email" value={company?.contact_email} />
                    <InfoRow label="Phone" value={company?.contact_phone} />
                    <InfoRow label="Website" value={company?.website} isLink />
                  </div>
                </Section>

                {/* Social Profiles */}
                <Section title="Social Profiles" icon={<Network className="w-5 h-5" />}>
                  <div className="space-y-2">
                    <SocialLink href={company?.linkedin_url} platform="LinkedIn" />
                    <SocialLink href={company?.twitter_url} platform="Twitter" />
                    <SocialLink href={company?.facebook_url} platform="Facebook" />
                    <SocialLink href={company?.instagram_url} platform="Instagram" />
                    <SocialLink href={company?.crunchbase_url} platform="Crunchbase" />
                  </div>
                </Section>
              </div>
            </div>

            {/* Technology Stack */}
            {company?.technologies && company?.technologies?.length > 0 && (
              <Section title="Technology Stack" icon={<Cpu className="w-5 h-5" />}>
                <div className="flex flex-wrap gap-2">
                  {company?.technologies?.map((tech, index) => (
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
            {company?.scoring_metrics && (
              <Section title="Scoring Metrics" icon={<BarChart3 className="w-5 h-5" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ICP Fit Score Card */}
                  {company?.scoring_metrics?.fit_score && (
                    <div className={cn(
                      "p-6 border rounded-2xl transition-all duration-200",
                      "bg-gradient-to-br from-white to-gray-50 dark:from-[#1A1A1A] dark:to-[#0F0F0F]",
                      "border-gray-200 dark:border-[#2A2A2A]",
                      "hover:shadow-lg hover:border-[#006239]/30"
                    )}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-gray-900 dark:text-[#EDEDED] font-semibold text-base">ICP Fit Score</h4>
                            <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">Profile alignment</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <ScoreDisplay 
                          score={company.scoring_metrics.fit_score.score || 0}
                          label="Overall Fit"
                          size="large"
                        />
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
                        {company.scoring_metrics.fit_score.reason && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Reasoning</p>
                            <p className="text-sm text-gray-700 dark:text-[#EDEDED] leading-relaxed">
                              {company.scoring_metrics.fit_score.reason}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Confidence</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                  style={{ width: `${company.scoring_metrics.fit_score.confidence || 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] min-w-[3rem] text-right">
                                {company.scoring_metrics.fit_score.confidence || 0}%
                              </span>
                            </div>
                          </div>
                          {company.scoring_metrics.fit_score.factors && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Key Factors</p>
                              {typeof company.scoring_metrics.fit_score.factors === 'string' ? (
                                <p className="text-sm text-gray-700 dark:text-[#EDEDED] font-medium">
                                  {company.scoring_metrics.fit_score.factors}
                                </p>
                              ) : Array.isArray(company.scoring_metrics.fit_score.factors) ? (
                                <ul className="text-sm text-gray-700 dark:text-[#EDEDED] space-y-1">
                                  {company.scoring_metrics.fit_score.factors.map((factor: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-[#006239] mt-1">•</span>
                                      <span>{factor}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : typeof company.scoring_metrics.fit_score.factors === 'object' ? (
                                <div className="space-y-2">
                                  {Object.entries(company.scoring_metrics.fit_score.factors).map(([key, value]: [string, any]) => {
                                    // Handle nested objects (e.g., {match: true, score: 85, details: "..."})
                                    let displayValue: string;
                                    if (value === null || value === undefined) {
                                      displayValue = 'N/A';
                                    } else if (typeof value === 'boolean') {
                                      displayValue = value ? '✓ Match' : '✗ No Match';
                                    } else if (typeof value === 'object') {
                                      // If it's an object, try to extract meaningful info
                                      if (value.points !== undefined) {
                                        // Handle objects with points and details
                                        displayValue = `${value.points} points`;
                                        if (value.details) {
                                          displayValue += ` - ${value.details}`;
                                        } else if (value.description) {
                                          displayValue += ` - ${value.description}`;
                                        }
                                      } else if (value.match !== undefined) {
                                        displayValue = value.match ? '✓ Match' : '✗ No Match';
                                        if (value.score !== undefined) {
                                          displayValue += ` (${value.score}%)`;
                                        }
                                        if (value.details) {
                                          displayValue += ` - ${value.details}`;
                                        }
                                      } else if (value.score !== undefined) {
                                        displayValue = `${value.score}%`;
                                        if (value.details) {
                                          displayValue += ` - ${value.details}`;
                                        }
                                      } else if (value.percentage !== undefined) {
                                        displayValue = `${value.percentage}%`;
                                        if (value.details) {
                                          displayValue += ` - ${value.details}`;
                                        }
                                      } else if (value.earned !== undefined && value.max !== undefined) {
                                        displayValue = `${value.earned}/${value.max} pts`;
                                        if (value.details) {
                                          displayValue += ` - ${value.details}`;
                                        }
                                      } else if (value.details) {
                                        displayValue = value.details;
                                      } else if (value.description) {
                                        displayValue = value.description;
                                      } else {
                                        displayValue = JSON.stringify(value);
                                      }
                                    } else {
                                      displayValue = String(value);
                                    }
                                    
                                    return (
                                      <div key={key} className="flex items-start justify-between text-xs gap-2">
                                        <span className="text-gray-600 dark:text-[#9CA3AF] capitalize flex-shrink-0">
                                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                                        </span>
                                        <span className="text-gray-900 dark:text-[#EDEDED] font-medium text-right flex-1">
                                          {displayValue}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700 dark:text-[#EDEDED] font-medium">
                                  {String(company.scoring_metrics.fit_score.factors)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Intent Score Card */}
                  {company?.scoring_metrics?.intent_score && (
                    <div className={cn(
                      "p-6 border rounded-2xl transition-all duration-200",
                      "bg-gradient-to-br from-white to-gray-50 dark:from-[#1A1A1A] dark:to-[#0F0F0F]",
                      "border-gray-200 dark:border-[#2A2A2A]",
                      "hover:shadow-lg hover:border-[#006239]/30"
                    )}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-gray-900 dark:text-[#EDEDED] font-semibold text-base">Intent Score</h4>
                            <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">Buying readiness</p>
                          </div>
                        </div>
                      </div>

                      {/* Handle both old and new intent_score structures */}
                      {company.scoring_metrics.intent_score?.analysis_metadata ? (
                        <>
                          <div className="mb-4">
                            <ScoreDisplay 
                              score={company.scoring_metrics.intent_score.analysis_metadata.final_intent_score || 0}
                              label="Final Intent Score"
                              size="large"
                            />
                          </div>

                          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
                            {/* Reasoning from GTM Intelligence */}
                            {company.scoring_metrics.intent_score.gtm_intelligence?.overall_buying_readiness?.reasoning && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Reasoning</p>
                                <p className="text-sm text-gray-700 dark:text-[#EDEDED] leading-relaxed">
                                  {company.scoring_metrics.intent_score.gtm_intelligence.overall_buying_readiness.reasoning}
                                </p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Confidence</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-gray-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                                    <div 
                                      className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        company.scoring_metrics.intent_score.analysis_metadata.overall_confidence === 'HIGH'
                                          ? "bg-green-500"
                                          : company.scoring_metrics.intent_score.analysis_metadata.overall_confidence === 'MEDIUM'
                                          ? "bg-yellow-500"
                                          : "bg-gray-500"
                                      )}
                                      style={{ 
                                        width: `${company.scoring_metrics.intent_score.analysis_metadata.overall_confidence === 'HIGH' ? 85 : company.scoring_metrics.intent_score.analysis_metadata.overall_confidence === 'MEDIUM' ? 60 : 40}%` 
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] min-w-[3rem] text-right">
                                    {company.scoring_metrics.intent_score.analysis_metadata.overall_confidence || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Events Detected</p>
                                <div className="flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-[#006239]" />
                                  <span className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED]">
                                    {company.scoring_metrics.intent_score.analysis_metadata.total_events_detected || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Key Factors from signal_breakdown */}
                            {company.scoring_metrics.intent_score.signal_breakdown && Array.isArray(company.scoring_metrics.intent_score.signal_breakdown) && company.scoring_metrics.intent_score.signal_breakdown.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Key Factors</p>
                                <ul className="text-sm text-gray-700 dark:text-[#EDEDED] space-y-1">
                                  {company.scoring_metrics.intent_score.signal_breakdown
                                    .filter((signal: any) => signal.events_detected?.count > 0)
                                    .slice(0, 3)
                                    .map((signal: any, idx: number) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-[#006239] mt-1">•</span>
                                        <span>
                                          <span className="font-medium">{signal.signal_name || signal.event_type}:</span>{' '}
                                          {signal.events_detected.count} event{signal.events_detected.count !== 1 ? 's' : ''} detected
                                          {signal.signal_analysis?.buying_intent_interpretation && (
                                            <span className="text-gray-600 dark:text-[#9CA3AF]"> - {signal.signal_analysis.buying_intent_interpretation}</span>
                                          )}
                                        </span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                            
                            {company.scoring_metrics.intent_score.analysis_metadata.analysis_date && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Analysis Date</p>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400 dark:text-[#6A6A6A]" />
                                  <span className="text-sm text-gray-700 dark:text-[#EDEDED]">
                                    {new Date(company.scoring_metrics.intent_score.analysis_metadata.analysis_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-4">
                            <ScoreDisplay 
                              score={company.scoring_metrics.intent_score.score || 0}
                              label="Intent Score"
                              size="large"
                            />
                          </div>

                          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
                            {company.scoring_metrics.intent_score.reason && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Reasoning</p>
                                <p className="text-sm text-gray-700 dark:text-[#EDEDED] leading-relaxed">
                                  {company.scoring_metrics.intent_score.reason}
                                </p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Confidence</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-gray-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                                      style={{ width: `${company.scoring_metrics.intent_score.confidence || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] min-w-[3rem] text-right">
                                    {company.scoring_metrics.intent_score.confidence || 0}%
                                  </span>
                                </div>
                              </div>
                              {company.scoring_metrics.intent_score.factors && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">Key Factors</p>
                                  {typeof company.scoring_metrics.intent_score.factors === 'string' ? (
                                    <p className="text-sm text-gray-700 dark:text-[#EDEDED] font-medium">
                                      {company.scoring_metrics.intent_score.factors}
                                    </p>
                                  ) : Array.isArray(company.scoring_metrics.intent_score.factors) ? (
                                    <ul className="text-sm text-gray-700 dark:text-[#EDEDED] space-y-1">
                                      {company.scoring_metrics.intent_score.factors.map((factor: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <span className="text-[#006239] mt-1">•</span>
                                          <span>{factor}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : typeof company.scoring_metrics.intent_score.factors === 'object' ? (
                                    <div className="space-y-2">
                                      {Object.entries(company.scoring_metrics.intent_score.factors).map(([key, value]: [string, any]) => {
                                        // Handle nested objects (e.g., {match: true, score: 85, details: "..."})
                                        let displayValue: string;
                                        if (value === null || value === undefined) {
                                          displayValue = 'N/A';
                                        } else if (typeof value === 'boolean') {
                                          displayValue = value ? '✓ Match' : '✗ No Match';
                                        } else if (typeof value === 'object') {
                                          // If it's an object, try to extract meaningful info
                                          if (value.points !== undefined) {
                                            // Handle objects with points and details
                                            displayValue = `${value.points} points`;
                                            if (value.details) {
                                              displayValue += ` - ${value.details}`;
                                            } else if (value.description) {
                                              displayValue += ` - ${value.description}`;
                                            }
                                          } else if (value.match !== undefined) {
                                            displayValue = value.match ? '✓ Match' : '✗ No Match';
                                            if (value.score !== undefined) {
                                              displayValue += ` (${value.score}%)`;
                                            }
                                            if (value.details) {
                                              displayValue += ` - ${value.details}`;
                                            }
                                          } else if (value.score !== undefined) {
                                            displayValue = `${value.score}%`;
                                            if (value.details) {
                                              displayValue += ` - ${value.details}`;
                                            }
                                          } else if (value.percentage !== undefined) {
                                            displayValue = `${value.percentage}%`;
                                            if (value.details) {
                                              displayValue += ` - ${value.details}`;
                                            }
                                          } else if (value.earned !== undefined && value.max !== undefined) {
                                            displayValue = `${value.earned}/${value.max} pts`;
                                            if (value.details) {
                                              displayValue += ` - ${value.details}`;
                                            }
                                          } else if (value.details) {
                                            displayValue = value.details;
                                          } else if (value.description) {
                                            displayValue = value.description;
                                          } else {
                                            displayValue = JSON.stringify(value);
                                          }
                                        } else {
                                          displayValue = String(value);
                                        }
                                        
                                        return (
                                          <div key={key} className="flex items-start justify-between text-xs gap-2">
                                            <span className="text-gray-600 dark:text-[#9CA3AF] capitalize flex-shrink-0">
                                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                                            </span>
                                            <span className="text-gray-900 dark:text-[#EDEDED] font-medium text-right flex-1">
                                              {displayValue}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-700 dark:text-[#EDEDED] font-medium">
                                      {String(company.scoring_metrics.intent_score.factors)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Intent Signals - From Explorium signal_breakdown */}
            {company?.scoring_metrics?.intent_score?.signal_breakdown && 
             company.scoring_metrics.intent_score.signal_breakdown.some((signal: any) => 
               signal.events_detected?.count > 0
             ) && (
              <Section title="Intent Signals" icon={<Crosshair className="w-5 h-5" />}>
                <IntentSignalsDisplay 
                  signalBreakdown={company.scoring_metrics.intent_score.signal_breakdown} 
                />
              </Section>
            )}

            {/* Relationships */}
            {company?.relationships && Object.keys(company.relationships).length > 0 && (
              <Section title="Relationships" icon={<Users2 className="w-5 h-5" />}>
                <RelationshipsDisplay relationships={company.relationships} />
              </Section>
            )}

            {/* Metadata */}
            <Section title="Metadata" icon={<Layers className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoRow label="Company ID" value={company?.company_id} />
                <InfoRow label="Session ID" value={company?.session_id} />
                <InfoRow label="ICP Model ID" value={company?.icp_model_id} />
                <InfoRow label="Created At" value={new Date(company?.created_at).toLocaleString()} />
                <InfoRow label="Updated At" value={new Date(company?.updated_at).toLocaleString()} />
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

// Enhanced Score Display Component
function ScoreDisplay({ 
  score, 
  label, 
  size = 'medium' 
}: { 
  score: number
  label?: string
  size?: 'small' | 'medium' | 'large'
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return {
      bg: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400',
      ring: 'ring-green-200 dark:ring-green-800',
      bgLight: 'bg-green-50 dark:bg-green-900/20'
    };
    if (score >= 60) return {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600 dark:text-yellow-400',
      ring: 'ring-yellow-200 dark:ring-yellow-800',
      bgLight: 'bg-yellow-50 dark:bg-yellow-900/20'
    };
    if (score >= 40) return {
      bg: 'bg-orange-500',
      text: 'text-orange-600 dark:text-orange-400',
      ring: 'ring-orange-200 dark:ring-orange-800',
      bgLight: 'bg-orange-50 dark:bg-orange-900/20'
    };
    return {
      bg: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-200 dark:ring-red-800',
      bgLight: 'bg-red-50 dark:bg-red-900/20'
    };
  };

  const colors = getScoreColor(score);
  const sizeClasses = {
    small: { text: 'text-lg', svg: 50, radius: 18, stroke: 4 },
    medium: { text: 'text-xl', svg: 60, radius: 22, stroke: 5 },
    large: { text: 'text-2xl', svg: 70, radius: 26, stroke: 5 }
  };

  const sizeConfig = sizeClasses[size];
  // Calculate circumference for circular progress
  const circumference = 2 * Math.PI * sizeConfig.radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        {/* Circular Progress Indicator */}
        <div className="relative flex-shrink-0">
          <svg className="transform -rotate-90" width={sizeConfig.svg} height={sizeConfig.svg}>
            <circle
              cx={sizeConfig.svg / 2}
              cy={sizeConfig.svg / 2}
              r={sizeConfig.radius}
              stroke="currentColor"
              strokeWidth={sizeConfig.stroke}
              fill="none"
              className="text-gray-200 dark:text-[#2A2A2A]"
            />
            <circle
              cx={sizeConfig.svg / 2}
              cy={sizeConfig.svg / 2}
              r={sizeConfig.radius}
              stroke="currentColor"
              strokeWidth={sizeConfig.stroke}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={cn(colors.text, "transition-all duration-1000 ease-out")}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("font-bold", colors.text, sizeConfig.text)}>
              {score}
            </span>
          </div>
        </div>

        {/* Score Details */}
        <div className="flex-1">
          {label && (
            <p className="text-sm font-medium text-gray-500 dark:text-[#9CA3AF] mb-1">
              {label}
            </p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000 ease-out", colors.bg)}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", colors.bg)} />
            <span className="text-xs text-gray-500 dark:text-[#9CA3AF]">
              {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Low'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Intent Signals Display Component - From Explorium signal_breakdown
function IntentSignalsDisplay({ signalBreakdown }: { signalBreakdown: any[] }) {
  // Filter signals that have events detected (count > 0)
  const signalsWithEvents = (signalBreakdown || []).filter((signal: any) => 
    signal.events_detected?.count > 0
  );

  if (signalsWithEvents.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-[#9CA3AF] text-center py-4">
        No intent signals with detected events
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {signalsWithEvents.map((signal: any, index: number) => {
        const eventsCount = signal.events_detected?.count || 0;
        const rawScore = signal.raw_score || signal.scoring_breakdown?.total_raw_score || 0;
        const confidenceLevel = signal.confidence_level || 'MEDIUM';
        const mostRecentEvent = signal.events_detected?.events?.[0];
        const eventDate = mostRecentEvent?.event_time || mostRecentEvent?.event_date;
        
        // Get confidence color based on confidence level
        const getConfidenceColor = (level: string) => {
          switch (level.toUpperCase()) {
            case 'HIGH':
              return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
            case 'MEDIUM':
              return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
            case 'LOW':
              return 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
            default:
              return 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
          }
        };

        // Get raw score color
        const getScoreColor = (score: number) => {
          if (score >= 70) return 'text-green-600 dark:text-green-400';
          if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
          return 'text-gray-600 dark:text-gray-400';
        };

        return (
          <div
            key={signal.signal_id || index}
            className={cn(
              "p-4 rounded-xl border transition-all duration-200",
              "bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2A2A2A]",
              "hover:border-[#006239] hover:shadow-sm"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] mb-1">
                  {signal.signal_name || signal.event_type?.replace(/_/g, ' ') || 'Intent Signal'}
                </h4>
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  {signal.event_type?.replace(/_/g, ' ') || 'Unknown Type'}
                </span>
              </div>
              <div className="text-right ml-3">
                <div className={cn("text-lg font-bold", getScoreColor(rawScore))}>
                  {rawScore}
                </div>
                <div className="text-xs text-gray-500 dark:text-[#9CA3AF]">Raw Score</div>
              </div>
            </div>

            {/* Event Count and Confidence */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#006239]" />
                <span className="text-xs text-gray-600 dark:text-[#9CA3AF]">
                  {eventsCount} {eventsCount === 1 ? 'event' : 'events'} detected
                </span>
              </div>
              <div className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-lg",
                getConfidenceColor(confidenceLevel)
              )}>
                {confidenceLevel}
              </div>
            </div>

            {/* Signal Analysis */}
            {signal.signal_analysis?.what_detected && (
              <p className="text-xs text-gray-600 dark:text-[#9CA3AF] mb-2 line-clamp-2">
                {signal.signal_analysis.what_detected}
              </p>
            )}

            {/* Buying Intent Interpretation */}
            {signal.signal_analysis?.buying_intent_interpretation && (
              <div className="mt-2 p-2 bg-[#006239]/5 dark:bg-[#006239]/10 rounded-lg border border-[#006239]/20">
                <p className="text-xs text-gray-700 dark:text-[#EDEDED] font-medium mb-1">
                  Buying Intent:
                </p>
                <p className="text-xs text-gray-600 dark:text-[#9CA3AF]">
                  {signal.signal_analysis.buying_intent_interpretation}
                </p>
              </div>
            )}

            {/* Most Recent Event Date */}
            {eventDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#9CA3AF] mt-3 pt-3 border-t border-gray-200 dark:border-[#2A2A2A]">
                <Calendar className="w-3 h-3" />
                <span>
                  Most recent: {new Date(eventDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            )}

            {/* Weight Percentage */}
            {signal.weight_percentage !== undefined && (
              <div className="mt-2 text-xs text-gray-500 dark:text-[#9CA3AF]">
                Weight: {signal.weight_percentage}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Relationships Display Component
function RelationshipsDisplay({ relationships }: { relationships: any }) {
  const competitors: string[] = [];
  const partners: string[] = [];
  const customers: string[] = [];

  // Extract relationships from various possible structures
  if (typeof relationships === 'object' && relationships !== null) {
    if (Array.isArray(relationships.competitors)) {
      competitors.push(...relationships.competitors.map((c: any) => 
        typeof c === 'string' ? c : (c.name || c.company_name || String(c))
      ));
    }
    if (Array.isArray(relationships.partners)) {
      partners.push(...relationships.partners.map((p: any) => 
        typeof p === 'string' ? p : (p.name || p.company_name || String(p))
      ));
    }
    if (Array.isArray(relationships.customers)) {
      customers.push(...relationships.customers.map((c: any) => 
        typeof c === 'string' ? c : (c.name || c.company_name || String(c))
      ));
    }
  }

  const hasData = competitors.length > 0 || partners.length > 0 || customers.length > 0;

  if (!hasData) {
    return (
      <div className="text-sm text-gray-500 dark:text-[#9CA3AF] text-center py-4">
        No relationship data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Competitors */}
      {competitors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#006239]" />
            Competitors ({competitors.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {competitors.map((competitor, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200",
                  "bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2A2A2A]",
                  "hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-900 dark:text-[#EDEDED] font-medium">
                    {competitor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partners */}
      {partners.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] mb-3 flex items-center gap-2">
            <Users2 className="w-4 h-4 text-[#006239]" />
            Partners ({partners.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {partners.map((partner, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200",
                  "bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2A2A2A]",
                  "hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-900 dark:text-[#EDEDED] font-medium">
                    {partner}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customers */}
      {customers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] mb-3 flex items-center gap-2">
            <Users2 className="w-4 h-4 text-[#006239]" />
            Customers ({customers.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {customers.map((customer, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200",
                  "bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2A2A2A]",
                  "hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-900 dark:text-[#EDEDED] font-medium">
                    {customer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}