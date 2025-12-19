'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Users, Briefcase, Target, MessageSquare, Zap, 
  Crown, TrendingUp, Search, Bookmark, Download,
  AlertCircle, Award, FileText, Brain, Handshake, Rocket,
  TrendingDown, AlertTriangle, TrendingUp as TrendingUpIcon,
  Briefcase as BriefcaseIcon, Network, BarChart2, 
  Users as UsersGroup, MapPin, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/ThemeContext'
import ReactMarkdown from 'react-markdown'

const ACCENT_GREEN = '#006239'
const ACTIVE_GREEN = '#006239'

interface PersonaIntelligenceReportProps {
  markdownContent: string
  employeeName?: string
  companyName?: string
  employeeRole?: string
  className?: string
}

interface PersonaSection {
  id: string
  title: string
  icon: any
  level: number
  content: string
  subsections: PersonaSubsection[]
  keyMetrics?: PersonaMetric[]
  tags?: string[]
}

interface PersonaSubsection {
  id: string
  title: string
  level: number
  content: string
  keyPoints: string[]
  hasData: boolean
  tags?: string[]
  urgency?: 'high' | 'medium' | 'low'
  confidence?: number
}

interface PersonaMetric {
  label: string
  value: string | number
  icon: any
  trend?: 'up' | 'down' | 'neutral'
  color: string
}

interface FrictionReducer {
  type: string
  reason: string
  tactic: string
}

interface MessageHook {
  text: string
  resonance: string
}

type ViewMode = 'comfortable' | 'compact' | 'analytical' | 'executive'
type ContentFocus = 'all' | 'pain-points' | 'messaging' | 'strategy'

export function PersonaIntelligenceReport({ 
  markdownContent, 
  employeeName,
  companyName,
  employeeRole,
  className 
}: PersonaIntelligenceReportProps) {
  const { theme } = useTheme()
  const [viewMode, setViewMode] = useState<ViewMode>('comfortable')
  const [contentFocus, setContentFocus] = useState<ContentFocus>('all')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [readingProgress, setReadingProgress] = useState(0)
  const [activeSection, setActiveSection] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(new Set())
  const [showQuickSummary, setShowQuickSummary] = useState(true)
  const reportRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
     
  }, [markdownContent])
  // Parse persona markdown with enhanced structure
  const { 
    sections, 
    buyingCentreType, 
    keyMetrics,
    frictionReducers,
    messageHooks,
    engagementStrategy,
    personaProfile 
  } = useMemo(() => {
    const lines = markdownContent?.split('\n')

    if(!lines) return {
      sections: [] as PersonaSection[],
      buyingCentreType: '',
      keyMetrics: [],
      frictionReducers: [],
      messageHooks: [],
      engagementStrategy: { channel: '', framework: '', nextSteps: [] as string[] },
      personaProfile: { name: employeeName || '', role: employeeRole || '', location: '', experience: '', connections: 0, followers: 0, email: '' }
    }
    
    const parsedSections: PersonaSection[] = []
    let currentSection: PersonaSection | null = null
    let currentSubsection: PersonaSubsection | null = null
    let currentContent: string[] = []

    // Extract persona profile data
    const profile: any = {
      name: employeeName || '',
      role: employeeRole || '',
      location: '',
      experience: '',
      connections: 0,
      followers: 0,
      email: ''
    }

    // Extract buying centre type
    let buyingCentre = ''

    // Extract friction reducers
    const frictionReducers: FrictionReducer[] = []

    // Extract message hooks
    const messageHooks: MessageHook[] = []

    // Extract engagement strategy
    const engagementStrategy = {
      channel: '',
      framework: '',
      nextSteps: [] as string[]
    }

    const flushCurrentSubsection = () => {
      if (currentSubsection) {
        currentSubsection.content = currentContent.join('\n').trim()
        currentSubsection.keyPoints = extractKeyPoints(currentSubsection.content)
        currentSubsection.hasData = hasDataIndicators(currentSubsection.content)
        currentSubsection.urgency = determineUrgency(currentSubsection.title, currentSubsection.content)
        currentSubsection.confidence = calculateConfidence(currentSubsection.content)
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
        currentSection.keyMetrics = extractMetricsFromSection(currentSection)
        currentSection.tags = extractTags(currentSection)
        parsedSections.push(currentSection)
        currentContent = []
      }
    }

    const getIconForTitle = (title: string) => {
      const lowerTitle = title.toLowerCase()
      if (lowerTitle.includes('profile') || lowerTitle.includes('📋')) return User
      if (lowerTitle.includes('buying') || lowerTitle.includes('🏢')) return Briefcase
      if (lowerTitle.includes('psychographic') || lowerTitle.includes('🎯')) return Brain
      if (lowerTitle.includes('pain') || lowerTitle.includes('💡')) return AlertCircle
      if (lowerTitle.includes('product') || lowerTitle.includes('🎪')) return Zap
      if (lowerTitle.includes('credibility') || lowerTitle.includes('📊')) return Award
      if (lowerTitle.includes('message') || lowerTitle.includes('🎯')) return MessageSquare
      if (lowerTitle.includes('friction') || lowerTitle.includes('🚀')) return Rocket
      if (lowerTitle.includes('engagement') || lowerTitle.includes('📞')) return Handshake
      if (lowerTitle.includes('data') || lowerTitle.includes('⚠️')) return AlertTriangle
      return FileText
    }

    const extractKeyPoints = (content: string): string[] => {
      const points: string[] = []
      const lines = content.split('\n')
      
      lines.forEach(line => {
        if (line.trim().startsWith('-') || line.trim().startsWith('•') || 
            line.trim().startsWith('✅') || line.trim().startsWith('🚀') ||
            line.includes('•')) {
          const cleanLine = line.trim().replace(/^[-•✅🚀]\s*/, '')
          if (cleanLine.length > 10 && cleanLine.length < 200) {
            points.push(cleanLine)
          }
        }
      })
      
      return points.slice(0, 5)
    }

    const hasDataIndicators = (content: string): boolean => {
      return content.includes('$') || content.includes('%') || 
             /\d+/.test(content) || content.toLowerCase().includes('data') ||
             content.toLowerCase().includes('metric')
    }

    const determineUrgency = (title: string, content: string): 'high' | 'medium' | 'low' => {
      if (title.toLowerCase().includes('high') || content.toLowerCase().includes('high urgency')) return 'high'
      if (title.toLowerCase().includes('medium') || content.toLowerCase().includes('medium urgency')) return 'medium'
      if (title.toLowerCase().includes('low') || content.toLowerCase().includes('low urgency')) return 'low'
      return 'medium'
    }

    const calculateConfidence = (content: string): number => {
      let score = 50
      if (content.includes('strong') || content.includes('significant') || content.includes('high')) score += 20
      if (content.includes('potential') || content.includes('some') || content.includes('limited')) score -= 10
      if (content.includes('comprehensive') || content.includes('validated') || content.includes('confirmed')) score += 30
      return Math.min(100, Math.max(0, score))
    }

    const extractMetricsFromSection = (section: PersonaSection): PersonaMetric[] => {
      const metrics: PersonaMetric[] = []
      
      // Extract from profile section
      if (section.title.includes('PROFILE') || section.title.includes('📋')) {
        metrics.push(
          { label: 'Connections', value: profile.connections || 0, icon: Users, color: 'blue', trend: profile.connections > 500 ? 'up' : 'neutral' },
          { label: 'Followers', value: profile.followers || 0, icon: UsersGroup, color: 'purple', trend: profile.followers > 500 ? 'up' : 'neutral' },
          { label: 'Experience', value: profile.experience || 'Unknown', icon: BriefcaseIcon, color: 'green' }
        )
      }
      
      // Extract from pain points section
      if (section.title.includes('PAIN POINTS') || section.title.includes('💡')) {
        const highUrgency = section.subsections.filter(s => s.urgency === 'high').length
        const totalPoints = section.subsections.length
        metrics.push(
          { label: 'High Urgency Points', value: highUrgency, icon: AlertCircle, color: 'red' },
          { label: 'Total Pain Points', value: totalPoints, icon: FileText, color: 'orange' },
          { label: 'Avg Confidence', value: Math.round(section.subsections.reduce((acc, s) => acc + (s.confidence || 50), 0) / section.subsections.length), icon: BarChart2, color: 'blue' }
        )
      }
      
      return metrics
    }

    const extractTags = (section: PersonaSection): string[] => {
      const tags: string[] = []
      const content = section.content.toLowerCase()
      
      if (content.includes('strategic') || content.includes('strategy')) tags.push('Strategic')
      if (content.includes('technical') || content.includes('technology')) tags.push('Technical')
      if (content.includes('financial') || content.includes('roi')) tags.push('Financial')
      if (content.includes('operational') || content.includes('efficiency')) tags.push('Operational')
      if (content.includes('leadership') || content.includes('management')) tags.push('Leadership')
      if (content.includes('innovation') || content.includes('growth')) tags.push('Growth')
      
      return tags.slice(0, 3)
    }

    // Process lines and extract data
    let processingTable = false
    let currentTableData: string[] = []

    lines.forEach(line => {
      // Extract profile data
      if (line.includes('Location:')) profile.location = line.split(':')[1]?.trim() || ''
      if (line.includes('Experience:')) profile.experience = line.split(':')[1]?.trim() || ''
      if (line.includes('connections,')) {
        const match = line.match(/(\d+)\s*connections/)
        if (match) profile.connections = parseInt(match[1])
      }
      if (line.includes('followers')) {
        const match = line.match(/(\d+)\s*followers/)
        if (match) profile.followers = parseInt(match[1])
      }
      if (line.includes('Contact Email:')) profile.email = line.split(':')[1]?.trim() || ''

      // Extract buying centre type
      if (line.includes('Type: **')) {
        const match = line.match(/Type: \*\*([^*]+)\*\*/)
        if (match) buyingCentre = match[1]
      }

      // Extract friction reducers from table
      if (line.includes('Friction Type') && line.includes('Why They Experience It') && line.includes('Reduction Tactic')) {
        processingTable = true
        currentTableData = []
      } else if (processingTable) {
        if (line.includes('|') && !line.includes('---')) {
          currentTableData.push(line)
        } else if (line.trim() === '') {
          processingTable = false
          currentTableData.forEach(tableLine => {
            const cells = tableLine.split('|').filter(cell => cell.trim())
            if (cells.length >= 3) {
              frictionReducers.push({
                type: cells[0].trim(),
                reason: cells[1].trim(),
                tactic: cells[2].trim()
              })
            }
          })
        }
      }

      // Extract message hooks
      if (line.startsWith('> "')) {
        const hookText = line.match(/> "([^"]+)"/)?.[1] || ''
        const resonanceMatch = lines[lines.indexOf(line) + 1]
        const resonance = resonanceMatch?.includes('Why It Resonates:') 
          ? resonanceMatch.split(':')[1]?.trim() || ''
          : ''
        messageHooks.push({ text: hookText, resonance })
      }

      // Extract engagement strategy
      if (line.includes('Recommended Channel')) {
        const match = line.match(/\[([^\]]+)\]/)
        if (match) engagementStrategy.channel = match[1]
      }

      // Section parsing
      const headerMatch = line.match(/^(#{2,3})\s+(.+)$/)
      if (headerMatch) {
        const level = headerMatch[1].length
        const title = headerMatch[2].trim()
        
        // Skip main title
        if (title === 'GTM PERSONA INTELLIGENCE REPORT') return
        
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/[^a-z0-9-]/g, '')

        if (level === 2) {
          flushCurrentSection()
          currentSection = {
            id,
            title,
            icon: getIconForTitle(title),
            level,
            content: '',
            subsections: [],
            keyMetrics: [],
            tags: []
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
            hasData: false,
            tags: [],
            urgency: 'medium',
            confidence: 50
          }
        }
      } else if (currentSection) {
        currentContent.push(line)
      }
    })

    flushCurrentSection()

    // Calculate key metrics for quick summary
    const totalPainPoints = parsedSections.find(s => s.title.includes('PAIN POINTS'))?.subsections.length || 0
    const highUrgencyPoints = parsedSections.find(s => s.title.includes('PAIN POINTS'))?.subsections.filter(s => s.urgency === 'high').length || 0
    const totalMessageHooks = messageHooks.length
    const totalFrictionReducers = frictionReducers.length

    const keyMetrics = [
      { label: 'Buying Power', value: buyingCentre, icon: Crown, color: 'green' },
      { label: 'High Urgency Points', value: highUrgencyPoints, icon: AlertCircle, color: 'red' },
      { label: 'Message Hooks', value: totalMessageHooks, icon: MessageSquare, color: 'blue' },
      { label: 'Friction Reducers', value: totalFrictionReducers, icon: Rocket, color: 'purple' }
    ]

    return {
      sections: parsedSections,
      buyingCentreType: buyingCentre,
      keyMetrics,
      frictionReducers: frictionReducers.slice(0, 5),
      messageHooks: messageHooks.slice(0, 3),
      engagementStrategy,
      personaProfile: profile
    }
  }, [markdownContent, employeeName, employeeRole])

  // Auto-expand key sections
  useEffect(() => {
    if (expandedSections.size === 0) {
      const keySections = new Set<string>()
      const importantIds = ['decision-maker-profile', 'buying-centre-classification', 'strategic-pain-points']
      sections.forEach(section => {
        if (importantIds.includes(section.id)) {
          keySections.add(section.id)
        }
      })
      setExpandedSections(keySections)
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
      
      // Update active section
      const sectionElements = element.querySelectorAll('[data-persona-section]')
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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
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

  const isSectionExpanded = (sectionId: string) => expandedSections.has(sectionId)

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
        "border-gray-200 dark:border-[#2A2A2A] flex flex-col w-80"
      )}>
        <div className="p-6 border-b border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-[#006239] to-green-700"
            )}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-[#EDEDED] truncate">
                {personaProfile.name || employeeName}
              </h1>
              <p className="text-xs text-gray-600 dark:text-[#9CA3AF] truncate">
                {personaProfile.role || employeeRole}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search persona..."
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
              onClick={() => setViewMode('executive')}
              className={cn(
                "flex-1 px-3 py-2 text-xs rounded-lg transition-colors",
                viewMode === 'executive' 
                  ? "bg-[#006239] text-white" 
                  : "bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"
              )}
            >
              Executive
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
                  {section.title.replace(/[🎯🏢📋💡🎪📊🚀📞⚠️]/g, '').trim()}
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
          "max-w-6xl mx-auto p-8",
          className
        )}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-[#EDEDED] mb-2">
                  Persona Intelligence Report
                </h1>
                <p className="text-lg text-gray-600 dark:text-[#9CA3AF]">
                  {personaProfile.name} • {personaProfile.role} • {companyName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQuickSummary(!showQuickSummary)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    showQuickSummary 
                      ? "bg-[#006239] text-white" 
                      : "bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#3A3A3A]"
                  )}
                >
                  {showQuickSummary ? 'Hide Summary' : 'Show Summary'}
                </button>
                <button className="p-2 text-gray-400 hover:text-[#006239] transition-colors rounded-lg">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Stats Bar */}
            {showQuickSummary && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "grid grid-cols-4 gap-6 p-6 rounded-2xl border mb-6",
                  "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] shadow-sm"
                )}
              >
                {keyMetrics.map((metric, index) => (
                  <PersonaMetricCard key={index} metric={metric} />
                ))}
              </motion.div>
            )}

            {/* Quick Profile Summary */}
            {showQuickSummary && viewMode !== 'compact' && (
              <div className={cn(
                "grid grid-cols-2 gap-6 p-6 rounded-2xl border mb-6",
                "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
              )}>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED] mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                        {personaProfile.experience} experience
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                        {personaProfile.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                        {personaProfile.connections} connections • {personaProfile.followers} followers
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED] mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Buying Profile
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#006239]" />
                      <span className="text-sm font-medium text-gray-900 dark:text-[#EDEDED]">
                        {buyingCentreType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                        {engagementStrategy.channel ? `Preferred: ${engagementStrategy.channel}` : 'Channel: TBD'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                        {messageHooks.length} message hooks • {frictionReducers.length} friction reducers
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {filteredSections.map((section, index) => (
              <PersonaSectionAccordion
                key={section.id}
                section={section}
                viewMode={viewMode}
                isExpanded={isSectionExpanded(section.id)}
                onToggle={() => toggleSection(section.id)}
                onToggleBookmark={() => toggleBookmark(section.id)}
                isBookmarked={bookmarkedSections.has(section.id)}
                theme={theme}
                index={index}
              />
            ))}
          </div>

          {/* Message Hooks Section */}
          {messageHooks.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED] mb-6 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-[#006239]" />
                Message Hooks & Outreach Strategy
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {messageHooks.map((hook, index) => (
                  <MessageHookCard key={index} hook={hook} index={index + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Friction Reducers Section */}
          {frictionReducers.length > 0 && viewMode !== 'compact' && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED] mb-6 flex items-center gap-3">
                <Rocket className="w-6 h-6 text-[#006239]" />
                Friction Reduction Strategies
              </h2>
              <div className={cn(
                "rounded-2xl border",
                "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
              )}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#2A2A2A]">
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-[#EDEDED]">
                        Friction Type
                      </th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-[#EDEDED]">
                        Why They Experience It
                      </th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-900 dark:text-[#EDEDED]">
                        Reduction Tactic
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {frictionReducers.map((reducer, index) => (
                      <tr key={index} className={cn(
                        "border-b border-gray-100 dark:border-[#2A2A2A] last:border-0",
                        "hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
                      )}>
                        <td className="py-4 px-6 text-sm text-gray-900 dark:text-[#EDEDED]">
                          {reducer.type}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-[#9CA3AF]">
                          {reducer.reason}
                        </td>
                        <td className="py-4 px-6 text-sm text-[#006239] dark:text-[#006239] font-medium">
                          {reducer.tactic}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={cn(
            "mt-12 p-6 rounded-2xl border text-center",
            "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
          )}>
            <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
              Generated by Plugging AI Persona Intelligence • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Persona Section Accordion
function PersonaSectionAccordion({ 
  section, 
  viewMode, 
  isExpanded, 
  onToggle, 
  onToggleBookmark, 
  isBookmarked,
  theme,
  index 
}: any) {
  const Icon = section.icon

  return (
    <motion.section
      id={section.id}
      data-persona-section="true"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-2xl border overflow-hidden",
        "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]",
        viewMode === 'comfortable' && "shadow-sm",
        viewMode === 'executive' && "shadow-md"
      )}
    >
      {/* Section Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle() }}
        className={cn(
          "w-full flex items-start gap-4 p-6 text-left transition-all cursor-pointer",
          "hover:bg-gray-50 dark:hover:bg-[#1A1A1A]",
          isExpanded && "bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2A2A2A]"
        )}
      >
        <div className={cn(
          "flex-shrink-0 rounded-xl flex items-center justify-center",
          viewMode === 'compact' ? "w-10 h-10" : "w-12 h-12",
          "bg-[#006239] text-white"
        )}>
          <Icon className={viewMode === 'compact' ? "w-5 h-5" : "w-6 h-6"} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className={cn(
                "font-semibold tracking-tight text-gray-900 dark:text-[#EDEDED]",
                viewMode === 'compact' ? "text-lg" : "text-xl"
              )}>
                {section.title.replace(/[🎯🏢📋💡🎪📊🚀📞⚠️]/g, '').trim()}
              </h2>
              {section.tags && section.tags.length > 0 && viewMode !== 'compact' && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {section.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-[#9CA3AF] rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleBookmark()
                }}
                className="p-2 text-gray-400 hover:text-[#006239] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
              >
                <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-[#006239] text-[#006239]")} />
              </button>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="p-2 text-gray-400"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </div>
          </div>
          
          {/* Key Metrics */}
          {section.keyMetrics && section.keyMetrics.length > 0 && viewMode !== 'compact' && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {section.keyMetrics.map((metric: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <metric.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                    {metric.label}: <span className="font-medium text-gray-900 dark:text-[#EDEDED]">{metric.value}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-6 bg-white dark:bg-[#0F0F0F]">
              {/* Subsection content */}
              {section.subsections.length > 0 ? (
                <div className="space-y-6">
                  {section.subsections.map((subsection: any) => (
                    <PersonaSubsectionCard 
                      key={subsection.id} 
                      subsection={subsection} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                <div className={cn(
                  "prose max-w-none dark:prose-invert",
                  viewMode === 'compact' && "prose-sm",
                  "prose-headings:text-gray-900 dark:prose-headings:text-[#EDEDED]",
                  "prose-p:text-gray-700 dark:prose-p:text-[#D1D5DB]",
                  "prose-strong:text-gray-900 dark:prose-strong:text-[#EDEDED]",
                  "prose-li:text-gray-700 dark:prose-li:text-[#D1D5DB]",
                  "prose-code:text-[#006239] dark:prose-code:text-[#006239]"
                )}>
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

// Persona Subsection Card
function PersonaSubsectionCard({ subsection, viewMode }: { subsection: PersonaSubsection; viewMode: ViewMode }) {
  const urgencyColor: Record<'high' | 'medium' | 'low', string> = {
    high: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
    medium: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
  }

  return (
    <div className={cn(
      "rounded-xl border p-4",
      urgencyColor[subsection.urgency ?? 'medium']
    )}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED]">
          {subsection.title}
        </h3>
        {subsection.confidence && (
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-[#9CA3AF]">
              {subsection.confidence}% confidence
            </span>
          </div>
        )}
      </div>

      {/* Key Points */}
      {subsection.keyPoints.length > 0 && (
        <div className="mb-4 space-y-2">
          {subsection.keyPoints.map((point: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#006239] mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-[#D1D5DB]">{point}</span>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "prose max-w-none dark:prose-invert prose-sm",
        "prose-p:text-gray-600 dark:prose-p:text-[#9CA3AF]",
        "prose-strong:text-gray-900 dark:prose-strong:text-[#EDEDED]"
      )}>
        <ReactMarkdown>{subsection.content}</ReactMarkdown>
      </div>
    </div>
  )
}

// Persona Metric Card
function PersonaMetricCard({ metric }: { metric: PersonaMetric }) {
  const Icon = metric.icon
  const trendIcon: Record<'up' | 'down' | 'neutral', React.ReactNode> = {
    up: <TrendingUp className="w-4 h-4" />,
    down: <TrendingDown className="w-4 h-4" />,
    neutral: <TrendingUp className="w-4 h-4 opacity-50" />
  }

  return (
    <div className="text-center">
      <div className="flex justify-center mb-3">
        <div className="p-3 bg-gray-100 dark:bg-[#2A2A2A] rounded-2xl">
          <Icon className="w-5 h-5 text-[#006239]" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED] mb-1">
        {metric.value}
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-[#EDEDED] mb-1">
        {metric.label}
      </div>
      {metric.trend && (
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-[#9CA3AF]">
          {trendIcon[metric.trend]}
          <span>{metric.trend === 'up' ? 'High' : metric.trend === 'down' ? 'Low' : 'Stable'}</span>
        </div>
      )}
    </div>
  )
}

// Message Hook Card
function MessageHookCard({ hook, index }: any) {
  return (
    <div className={cn(
      "rounded-2xl border p-6",
      "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]",
      "hover:border-[#006239] hover:shadow-sm transition-all duration-200"
    )}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#006239]/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-[#006239]">#{index}</span>
        </div>
        <MessageSquare className="w-5 h-5 text-[#006239]" />
      </div>
      <blockquote className="text-lg font-medium text-gray-900 dark:text-[#EDEDED] mb-4 italic">
        "{hook.text}"
      </blockquote>
      <div className="text-sm text-gray-600 dark:text-[#9CA3AF]">
        <div className="font-medium mb-1">Why it resonates:</div>
        <p>{hook.resonance}</p>
      </div>
    </div>
  )
}

export default PersonaIntelligenceReport