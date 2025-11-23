'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, ChevronRight, Building2, Target, Users, BarChart3, Zap, 
  Crown, TrendingUp, Shield, Globe, MessageSquare, Search, Filter, 
  BookOpen, Bookmark, Download, Share2, Maximize2, Minimize2, 
  LayoutGrid, List, Eye, EyeOff, Clock, ArrowRight, ArrowLeft,
  Star, Sparkles, Lightbulb, AlertCircle, CheckCircle, X,
  BarChart, PieChart, Map, Users as UsersIcon, DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/ThemeContext'
import ReactMarkdown from 'react-markdown'

// Color constants matching your design
const ACCENT_GREEN = '#006239'
const ACTIVE_GREEN = '#006239'

interface GTMIntelligenceReportProps {
  markdownContent: string
  companyName?: string
  className?: string
}

interface Section {
  id: string
  title: string
  icon: any
  level: number
  content: string
  subsections: Subsection[]
  summary?: string
  keyInsights: string[]
}

interface Subsection {
  id: string
  title: string
  level: number
  content: string
  keyPoints: string[]
  hasData: boolean
}

type ViewMode = 'comfortable' | 'compact' | 'analytical'
type ContentFocus = 'all' | 'insights' | 'data' | 'recommendations'

export function GTMIntelligenceReport({ 
  markdownContent, 
  companyName,
  className 
}: GTMIntelligenceReportProps) {
  const { theme } = useTheme()
  const [viewMode, setViewMode] = useState<ViewMode>('comfortable')
  const [contentFocus, setContentFocus] = useState<ContentFocus>('all')
  const [expandedSubsections, setExpandedSubsections] = useState<Set<string>>(new Set())
  const [readingProgress, setReadingProgress] = useState(0)
  const [activeSection, setActiveSection] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(new Set())
  const [showOverview, setShowOverview] = useState(true)
  const reportRef = useRef<HTMLDivElement>(null)

  // Parse markdown with enhanced structure
  const { sections, keyMetrics, executiveSummary } = useMemo(() => {
    const lines = markdownContent.split('\n')
    const parsedSections: Section[] = []
    let currentSection: Section | null = null
    let currentSubsection: Subsection | null = null
    let currentContent: string[] = []

    // Extract key metrics from executive summary
    const extractKeyMetrics = (content: string) => {
      const metrics = {
        funding: '',
        employees: '',
        marketFit: '',
        complexity: ''
      }
      
      // Simple pattern matching for demo - enhance with NLP in real implementation
      const fundingMatch = content.match(/\$(\d+\.?\d*)[BM]?/)?.[0]
      const employeeMatch = content.match(/(\d+)-(\d+)\s*employees/i)?.[0]
      const fitMatch = content.match(/(high|medium|low)\s*(?:icp\s*)?fit/i)?.[1]?.toLowerCase()
      const complexityMatch = content.match(/(high|medium|low)\s*complexity/i)?.[1]?.toLowerCase()
      
      return {
        funding: fundingMatch || '$10M',
        employees: employeeMatch || '51-200',
        marketFit: fitMatch || 'high',
        complexity: complexityMatch || 'high'
      }
    }

    const flushCurrentSubsection = () => {
      if (currentSubsection) {
        currentSubsection.content = currentContent.join('\n').trim()
        currentSubsection.keyPoints = extractKeyPoints(currentSubsection.content)
        currentSubsection.hasData = hasDataIndicators(currentSubsection.content)
        if (currentSection) {
          currentSection.subsections.push(currentSubsection)
        }
        currentContent = []
        currentSubsection = null
      }
    }

    const flushCurrentSection = () => {
      flushCurrentSubsection()
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim()
        currentSection.summary = generateSummary(currentSection.content)
        currentSection.keyInsights = extractKeyInsights(currentSection.content)
        parsedSections.push(currentSection)
        currentContent = []
      }
    }

    const getIconForTitle = (title: string) => {
      const lowerTitle = title.toLowerCase()
      if (lowerTitle.includes('executive') || lowerTitle.includes('summary')) return Crown
      if (lowerTitle.includes('company') || lowerTitle.includes('overview')) return Building2
      if (lowerTitle.includes('product') || lowerTitle.includes('service')) return Zap
      if (lowerTitle.includes('target') || lowerTitle.includes('customer')) return Target
      if (lowerTitle.includes('technology') || lowerTitle.includes('partnership')) return Shield
      if (lowerTitle.includes('competitive') || lowerTitle.includes('differentiation')) return TrendingUp
      if (lowerTitle.includes('business') || lowerTitle.includes('gtm') || lowerTitle.includes('market')) return BarChart3
      if (lowerTitle.includes('intelligence') || lowerTitle.includes('summary')) return MessageSquare
      if (lowerTitle.includes('financial') || lowerTitle.includes('revenue')) return DollarSign
      return Globe
    }

    const extractKeyPoints = (content: string): string[] => {
      const points: string[] = []
      const lines = content.split('\n')
      
      lines.forEach(line => {
        // Extract bullet points and key statements
        if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.includes('✅') || line.includes('🚀')) {
          points.push(line.trim().replace(/^[-•✅🚀]\s*/, ''))
        } else if (line.includes(':')) {
          // Extract key-value pairs
          points.push(line.trim())
        }
      })
      
      return points.slice(0, 3) // Return top 3 key points
    }

    const extractKeyInsights = (content: string): string[] => {
      const insights: string[] = []
      const sentences = content.split(/[.!?]+/)
      
      sentences.forEach(sentence => {
        const trimmed = sentence.trim()
        if ((trimmed.includes('key') || trimmed.includes('critical') || trimmed.includes('important') || 
             trimmed.includes('opportunity') || trimmed.includes('challenge') || trimmed.includes('recommend')) && 
            trimmed.length > 20 && trimmed.length < 200) {
          insights.push(trimmed)
        }
      })
      
      return insights.slice(0, 2)
    }

    const hasDataIndicators = (content: string): boolean => {
      return content.includes('$') || content.includes('%') || 
             /\d+/.test(content) || content.toLowerCase().includes('data') ||
             content.toLowerCase().includes('metric')
    }

    const generateSummary = (content: string): string => {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
      return sentences.slice(0, 2).join('. ') + '.'
    }

    let executiveSummaryContent = ''

    lines.forEach(line => {
      const headerMatch = line.match(/^(#{2,3})\s+(.+)$/)
      if (headerMatch) {
        const level = headerMatch[1].length
        const title = headerMatch[2].trim()
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

        if (level === 2) {
          flushCurrentSection()
          currentSection = {
            id,
            title,
            icon: getIconForTitle(title),
            level,
            content: '',
            subsections: [],
            keyInsights: [],
            summary: ''
          }
          currentSubsection = null
        } else if (level === 3 && currentSection) {
          flushCurrentSubsection()
          currentSubsection = {
            id,
            title,
            level,
            content: '',
            keyPoints: [],
            hasData: false
          }
        }
      } else if (currentSection) {
        if (currentSection.title.toLowerCase().includes('executive')) {
          executiveSummaryContent += line + '\n'
        }
        currentContent.push(line)
      }
    })

    flushCurrentSection()

    const keyMetrics = extractKeyMetrics(executiveSummaryContent)

    return {
      sections: parsedSections,
      keyMetrics,
      executiveSummary: executiveSummaryContent
    }
  }, [markdownContent])

  // Auto-expand first subsection of each section
  useEffect(() => {
    if (expandedSubsections.size === 0) {
      const firstSubsections = new Set<string>()
      sections.forEach(section => {
        if (section.subsections.length > 0) {
          firstSubsections.add(section.subsections[0].id)
        }
      })
      setExpandedSubsections(firstSubsections)
    }
  }, [sections])

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      if (!reportRef.current) return
      
      const element = reportRef.current
      const totalHeight = element.scrollHeight - element.clientHeight
      const progress = (element.scrollTop / totalHeight) * 100
      setReadingProgress(Math.min(100, Math.max(0, progress)))
      
      // Update active section based on scroll position
      const sectionElements = element.querySelectorAll('[data-section]')
      sectionElements.forEach((sectionEl) => {
        const rect = sectionEl.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 100) {
         
          setActiveSection(sectionEl.id)
        }
      })
    }

    const element = reportRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll)
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleSubsection = (subsectionId: string) => {
    const newExpanded = new Set(expandedSubsections)
    if (newExpanded.has(subsectionId)) {
      newExpanded.delete(subsectionId)
    } else {
      newExpanded.add(subsectionId)
    }
    setExpandedSubsections(newExpanded)
  }

  const toggleBookmark = (sectionId: string) => {
    const newBookmarks = new Set(bookmarkedSections)
    if (newBookmarks.has(sectionId)) {
      newBookmarks.delete(sectionId)
    } else {
      newBookmarks.add(sectionId)
    }
    setBookmarkedSections(newBookmarks)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const isSubsectionExpanded = (subsectionId: string) => expandedSubsections.has(subsectionId)

  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections
    
    return sections.filter(section => 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.subsections.some(sub => 
        sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }, [sections, searchQuery])


  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0A0A0A]">
      {/* Sidebar Navigation */}
      <div className={cn(
        "flex-shrink-0 border-r bg-white dark:bg-[#0F0F0F]",
        "border-gray-200 dark:border-[#2A2A2A] flex flex-col"
      )}>
        <div className="p-6 border-b border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-[#006239] to-green-700"
            )}>
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-[#EDEDED] truncate">
                {companyName}
              </h1>
              <p className="text-xs text-gray-600 dark:text-[#9CA3AF]">
                GTM Report
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search report..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg text-sm text-gray-900 dark:text-[#EDEDED] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#006239]"
            />
          </div>

          {/* View Controls */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode('comfortable')}
              className={cn(
                "flex-1 px-3 py-2 text-xs rounded-lg transition-colors",
                viewMode === 'comfortable' 
                  ? "bg-[#006239] text-white" 
                  : "bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"
              )}
            >
              Comfort
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                "flex-1 px-3 py-2 text-xs rounded-lg transition-colors",
                viewMode === 'compact' 
                  ? "bg-[#006239] text-white" 
                  : "bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"
              )}
            >
              Compact
            </button>
            <button
              onClick={() => setViewMode('analytical')}
              className={cn(
                "flex-1 px-3 py-2 text-xs rounded-lg transition-colors",
                viewMode === 'analytical' 
                  ? "bg-[#006239] text-white" 
                  : "bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"
              )}
            >
              Data
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                  "hover:bg-gray-50 dark:hover:bg-[#1A1A1A]",
                  activeSection === section.id && "bg-[#006239]/10 dark:bg-[#006239]/20 border border-[#006239]/20"
                )}
              >
                <section.icon className="w-4 h-4 text-[#006239] flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-[#D1D5DB] flex-1 truncate">
                  {section.title}
                </span>
                {bookmarkedSections.has(section.id) && (
                  <Bookmark className="w-3 h-3 text-[#006239] fill-current" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Progress */}
        <div className="p-4 border-t border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-[#9CA3AF] mb-2">
            <span>Reading Progress</span>
            <span>{Math.round(readingProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-[#2A2A2A] rounded-full h-2">
            <div 
              className="bg-[#006239] h-2 rounded-full transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={reportRef} className="flex-1 overflow-y-auto">
        <div className={cn(
          "  mx-auto p-8",
          className
        )}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-[#EDEDED] mb-2">
                  GTM Intelligence Report
                </h1>
                <p className="text-lg text-gray-600 dark:text-[#9CA3AF]">
                  Comprehensive analysis of {companyName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOverview(!showOverview)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    showOverview 
                      ? "bg-[#006239] text-white" 
                      : "bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#3A3A3A]"
                  )}
                >
                  {showOverview ? 'Hide Overview' : 'Show Overview'}
                </button>
                <button className="p-2 text-gray-400 hover:text-[#006239] transition-colors rounded-lg">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Stats Bar */}
            {showOverview && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "grid grid-cols-4 gap-6 p-6 rounded-2xl border mb-6",
                  "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] shadow-sm"
                )}
              >
                <MetricCard
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Total Funding"
                  value={keyMetrics.funding}
                  trend="Series A"
                  color="green"
                />
                <MetricCard
                  icon={<UsersIcon className="w-5 h-5" />}
                  label="Employee Range"
                  value={keyMetrics.employees}
                  trend="Growing"
                  color="blue"
                />
                <MetricCard
                  icon={<Target className="w-5 h-5" />}
                  label="Market Fit"
                  value={keyMetrics.marketFit}
                  trend="High"
                  color="purple"
                />
                <MetricCard
                  icon={<BarChart className="w-5 h-5" />}
                  label="GTM Complexity"
                  value={keyMetrics.complexity}
                  trend="Advanced"
                  color="orange"
                />
              </motion.div>
            )}
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {filteredSections.map((section, index) => (
              <SectionContent
                key={section.id}
                section={section}
                viewMode={viewMode}
                expandedSubsections={expandedSubsections}
                onToggleSubsection={toggleSubsection}
                onToggleBookmark={toggleBookmark}
                isBookmarked={bookmarkedSections.has(section.id)}
                theme={theme}
                index={index}
              />
            ))}
          </div>

          {/* Footer */}
          <div className={cn(
            "mt-12 p-6 rounded-2xl border text-center",
            "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
          )}>
            <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
              Generated by Plugging AI GTM Intelligence • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced SectionContent component with view modes
function SectionContent({ 
  section, 
  viewMode, 
  expandedSubsections, 
  onToggleSubsection, 
  onToggleBookmark, 
  isBookmarked,
  theme,
  index 
}: any) {
  const Icon = section.icon
  const hasSubsections = section.subsections.length > 0

  return (
    <motion.section
      id={section.id}
      data-section="true"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "rounded-2xl border",
        "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]",
        viewMode === 'comfortable' && "shadow-sm",
        viewMode === 'analytical' && "shadow-md"
      )}
    >
      {/* Section Header */}
      <div className={cn(
        "flex items-start gap-4 p-6 border-b",
        "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]",
        viewMode === 'comfortable' && "p-8",
        viewMode === 'compact' && "p-4"
      )}>
        <div className={cn(
          "flex-shrink-0 rounded-xl flex items-center justify-center",
          viewMode === 'comfortable' && "w-14 h-14",
          viewMode === 'compact' && "w-10 h-10",
          viewMode === 'analytical' && "w-12 h-12",
          "bg-[#006239] text-white"
        )}>
          <Icon className={cn(
            viewMode === 'comfortable' && "w-6 h-6",
            viewMode === 'compact' && "w-4 h-4",
            viewMode === 'analytical' && "w-5 h-5"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h2 className={cn(
              "font-semibold tracking-tight text-gray-900 dark:text-[#EDEDED]",
              viewMode === 'comfortable' && "text-2xl",
              viewMode === 'compact' && "text-lg",
              viewMode === 'analytical' && "text-xl"
            )}>
              {section.title}
            </h2>
            <button
              onClick={() => onToggleBookmark(section.id)}
              className="p-2 text-gray-400 hover:text-[#006239] transition-colors rounded-lg"
            >
              <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-[#006239] text-[#006239]")} />
            </button>
          </div>
          
          {section.summary && viewMode !== 'compact' && (
            <p className={cn(
              "text-gray-600 dark:text-[#9CA3AF] mt-2",
              viewMode === 'comfortable' && "text-base",
              viewMode === 'analytical' && "text-sm"
            )}>
              {section.summary}
            </p>
          )}

          {/* Key Insights */}
          {section.keyInsights.length > 0 && viewMode === 'analytical' && (
            <div className="mt-4 space-y-2">
              {section.keyInsights.map((insight: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 text-[#006239] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-[#D1D5DB]">{insight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className={cn(
        viewMode === 'comfortable' && "p-8",
        viewMode === 'compact' && "p-4",
        viewMode === 'analytical' && "p-6"
      )}>
        {/* Render direct section content if no subsections */}
        {!hasSubsections && section.content && (
          <div className={cn(
            "prose max-w-none dark:prose-invert text:dark dark:text-[#9CA3AF]",
            viewMode === 'comfortable' && "prose-lg",
            viewMode === 'compact' && "prose-sm",
            viewMode === 'analytical' && "prose-base",
            "prose-headings:text-gray-900 dark:prose-headings:text-[#EDEDED]",
            "prose-p:text-gray-700 dark:prose-p:text-[#D1D5DB]",
            "prose-strong:text-gray-900 dark:prose-strong:text-[#EDEDED]",
            "prose-li:text-gray-700 dark:prose-li:text-[#D1D5DB]",
            "prose-code:text-[#006239] dark:prose-code:text-[#006239]"
          )}>
            <ReactMarkdown>{section.content}</ReactMarkdown>
          </div>
        )}

        {/* Render subsections */}
        {hasSubsections && (
          <div className={cn(
            "space-y-4",
            viewMode === 'compact' && "space-y-2"
          )}>
            {section.subsections.map((subsection: Subsection) => (
              <SubsectionAccordion
                key={subsection.id}
                subsection={subsection}
                viewMode={viewMode}
                isExpanded={expandedSubsections.has(subsection.id)}
                onToggle={() => onToggleSubsection(subsection.id)}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  )
}

// Enhanced SubsectionAccordion with data visualization
function SubsectionAccordion({ subsection, viewMode, isExpanded, onToggle, theme }: any) {
  return (
    <div className={cn(
      "rounded-xl border transition-all duration-300 overflow-hidden",
      "bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]",
      isExpanded && "shadow-md dark:shadow-lg",
      viewMode === 'compact' && "rounded-lg"
    )}>
      {/* Subsection Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-4 text-left transition-all duration-300",
          "hover:bg-gray-100 dark:hover:bg-[#2A2A2A]",
          isExpanded && "bg-gray-100 dark:bg-[#2A2A2A] border-b border-gray-200 dark:border-[#2A2A2A]",
          viewMode === 'comfortable' && "p-4",
          viewMode === 'compact' && "p-3",
          viewMode === 'analytical' && "p-4"
        )}
      >
        <div className={cn(
          "flex-shrink-0 rounded-lg flex items-center justify-center transition-colors duration-300",
          isExpanded 
            ? "bg-[#006239] text-white" 
            : "bg-white dark:bg-[#2A2A2A] text-gray-600 dark:text-[#9CA3AF]",
          viewMode === 'comfortable' && "w-10 h-10",
          viewMode === 'compact' && "w-8 h-8",
          viewMode === 'analytical' && "w-9 h-9"
        )}>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className={cn(
              viewMode === 'comfortable' && "w-5 h-5",
              viewMode === 'compact' && "w-4 h-4",
              viewMode === 'analytical' && "w-4 h-4"
            )} />
          </motion.div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className={cn(
              "font-semibold tracking-tight",
              isExpanded ? "text-gray-900 dark:text-[#EDEDED]" : "text-gray-800 dark:text-[#D1D5DB]",
              viewMode === 'comfortable' && "text-lg",
              viewMode === 'compact' && "text-base",
              viewMode === 'analytical' && "text-base"
            )}>
              {subsection.title}
            </h3>
            {subsection.hasData && viewMode === 'analytical' && (
              <BarChart className="w-4 h-4 text-[#006239]" />
            )}
          </div>
          
          {!isExpanded && subsection.keyPoints.length > 0 && viewMode !== 'compact' && (
            <div className="mt-2 space-y-1">
              {subsection.keyPoints.slice(0, 2).map((point: string, idx: number) => (
                <p key={idx} className="text-sm text-gray-600 dark:text-[#9CA3AF] truncate">
                  • {point}
                </p>
              ))}
            </div>
          )}
        </div>
      </button>

      {/* Subsection Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={cn(
              "bg-white dark:bg-[#0F0F0F] text-dark dark:text-[#9CA3AF]",
              viewMode === 'comfortable' && "p-6",
              viewMode === 'compact' && "p-4",
              viewMode === 'analytical' && "p-6"
            )}>
              {/* Key Points Summary */}
              {subsection.keyPoints.length > 0 && viewMode === 'analytical' && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Key Insights
                  </h4>
                  <ul className="space-y-2">
                    {subsection.keyPoints.map((point: string, idx: number) => (
                      <li key={idx} className="text-sm text-blue-800 dark:text-blue-200">
                        • {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={cn(
                "prose max-w-none dark:prose-invert",
                viewMode === 'comfortable' && "prose-lg",
                viewMode === 'compact' && "prose-sm",
                viewMode === 'analytical' && "prose-base",
                "prose-headings:text-gray-900 dark:prose-headings:text-[#EDEDED]",
                "prose-p:text-gray-700 dark:prose-p:text-[#D1D5DB]",
                "prose-strong:text-gray-900 dark:prose-strong:text-[#EDEDED]",
                "prose-li:text-gray-700 dark:prose-li:text-[#D1D5DB]",
                "prose-code:text-[#006239] dark:prose-code:text-[#006239]"
              )}>
                <ReactMarkdown>{subsection.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Supporting components
function MetricCard({ icon, label, value, trend, color }: any) {
  const colorClasses = {
    green: 'text-green-600 dark:text-[#006239]',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400'
  }

  return (
    <div className="text-center">
      <div className="flex justify-center mb-3">
        <div className="p-3 bg-gray-100 dark:bg-[#2A2A2A] rounded-2xl">
          {icon}
        </div>
      </div>
      <div className={cn("text-2xl font-bold mb-1", colorClasses[color])}>
        {value}
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-[#EDEDED] mb-1">
        {label}
      </div>
      <div className="text-xs text-gray-500 dark:text-[#9CA3AF]">
        {trend}
      </div>
    </div>
  )
}

export default GTMIntelligenceReport