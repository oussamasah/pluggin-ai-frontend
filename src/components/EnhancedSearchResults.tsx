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
  Wallet, Users2, CalendarDays, RefreshCw, Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Company } from '@/types'
import { useState } from 'react'
import { Serializable } from 'child_process'

export function EnhancedSearchResults() {
  const { currentSession } = useSession()
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set())

  const handleSaveCompany = (companyId: string) => {
    setSavedCompanies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(companyId)) {
        newSet.delete(companyId)
      } else {
        newSet.add(companyId)
      }
      return newSet
    })
  }

  if (!currentSession?.companies || currentSession.companies.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-black/80">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00FA64]/10 to-[#00FF80]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#00FA64]/20 shadow-[0_0_20px_rgba(0,250,100,0.1)]">
            <Target className="w-8 h-8 text-[#00FA64]" />
          </div>
          <h3 className="font-bold text-white mb-2 tracking-wide">NO RESULTS YET</h3>
          <p className="text-sm text-[#A1A1AA] font-light tracking-wide">Matching companies will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-full flex flex-col bg-black/80">
        {/* Header */}
        <div className="p-6 border-b border-[#27272a] bg-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white tracking-wide">MATCHING COMPANIES</h2>
              <p className="text-sm text-[#A1A1AA] font-light tracking-wide mt-1">
                {currentSession.companies.length} COMPANIES FOUND • {savedCompanies.size} SAVED
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-[#A1A1AA] hover:text-[#00FA64] transition-all duration-300 hover:bg-[#00FA64]/10 rounded-lg border border-transparent hover:border-[#00FA64]/30">
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto max-h-[700px]">
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
  const formatArray = (data: any): string => {
    if (Array.isArray(data)) return data.join(', ');
    if (typeof data === 'string') return data;
    return 'Not specified';
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-xl border border-[#27272a] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,250,100,0.1)] hover:border-[#00FA64]/30 transition-all duration-300 group">
    
      <div className="flex items-start gap-3 mb-4">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.name} logo`}
            className="w-12 h-12 rounded-xl object-cover border border-[#27272a] shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-[#00FA64] to-[#00FF80] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,250,100,0.3)]">
            <Database className="w-6 h-6 text-black" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white tracking-wide truncate">{company.name}</h3>
              {company.funding_stage && (
                <span className="px-2 py-1 rounded-full text-xs font-bold tracking-wide border bg-purple-500/10 text-purple-400 border-purple-500/30">
                  {company.funding_stage.toUpperCase()}
                </span>
              )}
            </div>
            {company.website && (
              <a href={company.website} target='_blank' rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 text-[#A1A1AA] hover:text-[#00FA64] hover:bg-[#00FA64]/10 rounded-lg">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <Globe className="w-3 h-3 text-[#00FA64]" />
            <span className="text-xs text-[#A1A1AA] font-light tracking-wide">{company.domain}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {company.description && (
        <p className="text-sm text-[#A1A1AA] font-light leading-relaxed line-clamp-2 mb-4 tracking-wide">
          {company.description}
        </p>
      )}

      {/* Basic Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Location */}
        <div className="flex items-center gap-2 text-xs text-[#A1A1AA] font-light tracking-wide">
          <MapPin className="w-3.5 h-3.5 text-[#00FA64]" />
          <span>{ company.location.country!=undefined && company?.location?.country} {company.location.city!=undefined && " - "+company.location.city }</span>
        </div>

        {/* Employees */}
        {company.employee_count && (
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA] font-light tracking-wide">
            <Users className="w-3.5 h-3.5 text-[#00FA64]" />
            <span>{company.employee_count.toLocaleString()} EMPLOYEES</span>
          </div>
        )}

        {/* Founded Year */}
        {company.founded_year && (
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA] font-light tracking-wide">
            <Calendar className="w-3.5 h-3.5 text-[#00FA64]" />
            <span>FOUNDED {company.founded_year}</span>
          </div>
        )}

        {/* Industry */}
        {company.industry && company.industry.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA] font-light tracking-wide">
            <Target className="w-3.5 h-3.5 text-[#00FA64]" />
            <span className="truncate">{formatArray(company.industry)}</span>
          </div>
        )}
      </div>

      {/* Financial Info */}
      <div className="flex gap-3 mb-4">
        {/* Annual Revenue */}
        {company.annual_revenue && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-medium tracking-wide">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{formatCurrency(company.annual_revenue, company.annual_revenue_currency)}</span>
          </div>
        )}

        {/* Total Funding */}
        {company.total_funding && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-medium tracking-wide">
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
            label="ICP FIT" 
            score={company.scoring_metrics.fit_score.score} 
            color={
              company.scoring_metrics.fit_score.score >= 80 ? 'green' :
              company.scoring_metrics.fit_score.score >= 60 ? 'yellow' : 'red'
            }
          />
        )}

        {/* Intent Score from scoring_metrics */}
        {company.scoring_metrics?.intent_score  && (
          <ScorePill 
            label="INTENT" 
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
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <div className="flex gap-1.5 flex-wrap">
            {company.technologies.slice(0, 3).map((tech, index) => (
              <span
                key={index}
                className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide border border-blue-500/20"
              >
                {tech}
              </span>
            ))}
            {company.technologies.length > 3 && (
              <span className="text-xs text-[#A1A1AA] font-light tracking-wide">
                +{company.technologies.length - 3} MORE
              </span>
            )}
          </div>
        </div>
      )}

      {/* Social Links */}
      <div className="flex items-center gap-3 mb-4">
        {company.linkedin_url && (
          <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#00FA64] transition-colors">
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {company.twitter_url && (
          <a href={company.twitter_url} target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#00FA64] transition-colors">
            <MessageCircle className="w-4 h-4" />
          </a>
        )}
        {company.facebook_url && (
          <a href={company.facebook_url} target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#00FA64] transition-colors">
            <Network className="w-4 h-4" />
          </a>
        )}
        {company.instagram_url && (
          <a href={company.instagram_url} target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#00FA64] transition-colors">
            <Hash className="w-4 h-4" />
          </a>
        )}
        {company.crunchbase_url && (
          <a href={company.crunchbase_url} target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#00FA64] transition-colors">
            <BarChart3 className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-[#27272a]">
        <button 
          onClick={onViewDetails}
          className="flex-1 bg-[#00FA64]/10 text-[#00FA64] py-2.5 rounded-lg text-sm font-bold tracking-wide hover:bg-[#00FA64]/20 hover:shadow-[0_0_20px_rgba(0,250,100,0.2)] transition-all duration-300 border border-[#00FA64]/30"
        >
          VIEW DETAILS
        </button>
        <button 
          onClick={() => onSaveCompany(company.company_id)}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 border flex items-center justify-center gap-2",
            isSaved 
              ? "bg-[#00FA64]/20 text-[#00FA64] border-[#00FA64]/30 hover:bg-[#00FA64]/30" 
              : "bg-[#27272a] text-[#A1A1AA] border-[#363636] hover:bg-[#363636] hover:text-white"
          )}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaved ? 'SAVED' : 'SAVE'}
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
  const formatArray = (data: any): string => {
    if (Array.isArray(data)) return data.join(', ');
    if (typeof data === 'string') return data;
    return 'Not specified';
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatJSON = (data: any): string => {
    if (!data) return 'No data';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Invalid data';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-2xl border border-[#00FA64]/20 shadow-2xl shadow-[#00FA64]/10 w-full max-w-6xl max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#00FA64]/20 bg-gradient-to-r from-[#00FA64]/10 to-[#00FF80]/10">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 text-[#A1A1AA] hover:text-[#00FA64] transition-all duration-300 hover:bg-[#00FA64]/10 rounded-lg border border-transparent hover:border-[#00FA64]/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="w-12 h-12 rounded-xl object-cover border border-[#27272a] shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-[#00FA64] to-[#00FF80] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,250,100,0.3)]">
                  <Database className="w-6 h-6 text-black" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">{company.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-[#A1A1AA] font-light tracking-wide">{company.domain}</p>
                  {company.funding_stage && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold tracking-wide border bg-purple-500/10 text-purple-400 border-purple-500/30">
                      {company.funding_stage.toUpperCase()}
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
                "px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 border flex items-center gap-2",
                isSaved 
                  ? "bg-[#00FA64]/20 text-[#00FA64] border-[#00FA64]/30 hover:bg-[#00FA64]/30" 
                  : "bg-[#27272a] text-[#A1A1AA] border-[#363636] hover:bg-[#363636] hover:text-white"
              )}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaved ? 'SAVED' : 'SAVE COMPANY'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#A1A1AA] hover:text-red-400 transition-all duration-300 hover:bg-red-400/10 rounded-lg border border-transparent hover:border-red-400/30"
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
                <Section title="COMPANY DESCRIPTION" icon={<FileText className="w-5 h-5" />}>
                  <p className="text-[#A1A1AA] font-light leading-relaxed tracking-wide">
                    {company.description || 'No description available'}
                  </p>
                </Section>

                {/* Industry & Business Info */}
                <Section title="INDUSTRY & BUSINESS" icon={<TargetIcon className="w-5 h-5" />}>
                  <div className="space-y-3">
                    <InfoRow label="Industry" value={formatArray(company.industry)} />
                    <InfoRow label="Target Market" value={company.target_market} />
                    <InfoRow label="Ownership Type" value={company.ownership_type} />
                    <InfoRow label="Funding Stage" value={company.funding_stage} />
                  </div>
                </Section>

                {/* Location Information */}
                <Section title="LOCATION" icon={<MapPin className="w-5 h-5" />}>
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
                <Section title="FINANCIAL INFORMATION" icon={<DollarSign className="w-5 h-5" />}>
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
                <Section title="CONTACT INFORMATION" icon={<PhoneCall className="w-5 h-5" />}>
                  <div className="space-y-3">
                    <InfoRow label="Email" value={company.contact_email} />
                    <InfoRow label="Phone" value={company.contact_phone} />
                    <InfoRow label="Website" value={company.website} isLink />
                  </div>
                </Section>

                {/* Social Profiles */}
                <Section title="SOCIAL PROFILES" icon={<Network className="w-5 h-5" />}>
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
              <Section title="TECHNOLOGY STACK" icon={<Cpu className="w-5 h-5" />}>
                <div className="flex flex-wrap gap-2">
                  {company.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-[#00FA64]/10 text-[#00FA64] px-3 py-2 rounded-lg text-sm font-medium tracking-wide border border-[#00FA64]/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Scoring Metrics */}
            {company.scoring_metrics && (
              <Section title="SCORING METRICS" icon={<BarChart3 className="w-5 h-5" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {company.scoring_metrics.fit_score && (
                    <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#27272a]">
                      <h4 className="text-white font-semibold mb-3 tracking-wide">ICP FIT SCORE</h4>
                      <div className="space-y-2">
                        <InfoRow label="Score" value={`${company.scoring_metrics.fit_score.score}%`} />
                        <InfoRow label="Reason" value={company.scoring_metrics.fit_score.reason} />
                        <InfoRow label="Confidence" value={`${company.scoring_metrics.fit_score.confidence}%`} />
                        <InfoRow label="Factors" value={company.scoring_metrics.fit_score.factors} />
                      </div>
                    </div>
                  )}
                  {company.scoring_metrics.intent_score && (
                    <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#27272a]">
                      <h4 className="text-white font-semibold mb-3 tracking-wide">INTENT SCORE</h4>
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
              <Section title="INTENT SIGNALS" icon={<Crosshair className="w-5 h-5" />}>
                <pre className="bg-[#1A1A1A] rounded-lg p-4 border border-[#27272a] text-xs text-[#A1A1AA] font-mono overflow-x-auto">
                  {formatJSON(company.intent_signals)}
                </pre>
              </Section>
            )}

            {/* Relationships */}
            {company.relationships && (
              <Section title="RELATIONSHIPS" icon={<Users2 className="w-5 h-5" />}>
                <pre className="bg-[#1A1A1A] rounded-lg p-4 border border-[#27272a] text-xs text-[#A1A1AA] font-mono overflow-x-auto">
                  {formatJSON(company.relationships)}
                </pre>
              </Section>
            )}

            {/* Metadata */}
            <Section title="METADATA" icon={<Layers className="w-5 h-5" />}>
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
        <div className="text-[#00FA64]">{icon}</div>
        <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  )
}
function formatValueToString(value: Serializable): string {
  if (typeof value === 'object' && value !== null) {
      // This handles both objects and arrays
      try {
          return JSON.stringify(value);
      } catch (error) {
          // Fallback for circular references or other JSON errors
          return String(value); 
      }
  } else if (typeof value === 'string') {
      // If it's already a string, return it directly
      return value;
  } else if (value === null || value === undefined) {
      // Handle null and undefined explicitly (though String(value) works)
      return String(value);
  } else {
      // For primitives (number, boolean, symbol, bigint)
      return String(value);
  }
}
function InfoRow({ label, value, isLink = false }: { label: string; value: any; isLink?: boolean }) {
  if (!value) return null;

  return (
    <div className="flex justify-between items-start">
      <span className="text-[#A1A1AA] font-light tracking-wide text-sm">{label}</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#00FA64] hover:underline font-medium text-sm text-right max-w-[60%] break-words">
          {value}
        </a>
      ) : (
        <span className="text-white font-medium text-sm text-right max-w-[60%] break-words">
          {formatValueToString(value)}
        </span>
      )}
    </div>
  )
}

function SocialLink({ href, platform }: { href: string; platform: string }) {
  if (!href) return null;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#00FA64] transition-colors group">
      <ExternalLink className="w-3 h-3" />
      <span className="text-sm font-light tracking-wide">{platform}</span>
    </a>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-[#00FA64] bg-[#00FA64]/10 border-[#00FA64]/30'
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    return 'text-red-400 bg-red-500/10 border-red-500/30'
  }

  return (
    <div className={cn(
      "px-3 py-1 rounded-full border text-sm font-bold tracking-wide",
      getColor(score)
    )}>
      {score}%
    </div>
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
    green: 'bg-[#00FA64]/10 text-[#00FA64] border-[#00FA64]/30 shadow-[0_0_15px_rgba(0,250,100,0.1)]',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.1)]',
    red: 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
  }

  return (
    <div className={cn(
      "px-3 py-2 rounded-full border text-xs font-bold tracking-wide transition-all duration-300",
      colorClasses[color]
    )}>
      {label}: {score}%
    </div>
  )
}