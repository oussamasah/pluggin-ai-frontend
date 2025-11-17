'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSession } from '@/context/SessionContext'
import { useTheme } from '@/context/ThemeContext'

import { 
  Search, 
  Plus, 
  Settings, 
  Trash2, 
  MessageSquare,
  Building2,
  Users,
  BarChart3,
  ChevronRight,
  Sparkles,
  X,
  Filter,
  Crown,
  Zap,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { WebGLShaderSidebar } from './ui/web-gl-shader-sidebar'
import { useRouter } from 'next/navigation'

// --- Color Constants for Plugging AI Brand ---
const ACCENT_GREEN = '#006239' // The core brand green (used for gradients/logos)
const ACTIVE_GREEN = '#006239' // The bright green (used for highlights/active text)

export function EnhancedSidebar() {
  const router = useRouter();
  const { 
    sessions, 
    currentSession, 
    setCurrentSession, 
    createNewSession, 
    deleteSession 
  } = useSession()
  
  const { theme } = useTheme()
  
  const [isCreating, setIsCreating] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return
    
    await createNewSession(newSessionName)
    setNewSessionName('')
    setIsCreating(false)
  }

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.query?.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Mocked/Derived Stats
  const stats = {
    totalSearches: sessions.length,
    totalCompanies: sessions.reduce((sum, session) => sum + (session.resultsCount || 0), 0),
    activeSessions: sessions.filter(s => s.companies && s.companies.length > 0).length
  }

  return (
    <div className={cn(
      "fixed w-64 md:w-80 h-screen top-0 left-0 flex flex-col shadow-2xl z-50 overflow-hidden border-r",
      "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]"
    )}>
      {/* Content Container */}
      <div className="flex flex-col h-full">
        
        {/* Header (Branding, Search, Stats) */}
        <div className="p-4 border-b border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
            
          {/* Logo & Brand */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" 
              
              >
                           {theme=="dark"?<img 
  src="/plauging-ai-dark.png" 
  alt="Crown" 
  className=""
/>:<img 
  src="/plauging-ai-light.png" 
  alt="Crown" 
  className=""
/>}   
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-[#EDEDED]">
                  GTM Intelligence
                </h1>
                <p className="text-xs font-light text-gray-600 dark:text-[#9CA3AF]">
                  Powered by Plugging AI
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search analyses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2 text-sm rounded-xl focus:outline-none transition-all duration-300 shadow-inner border",
                "bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-[#EDEDED] border-gray-200 dark:border-[#2A2A2A]",
                "focus:ring-2 focus:ring-[#006239] focus:border-transparent focus:ring-offset-0"
              )}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.entries(stats).map(([key, value]) => (
                <div 
                  key={key} 
                  className={cn(
                    "text-center p-2 rounded-lg border",
                    "bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]",
                    "shadow-sm dark:shadow-none"
                  )}
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED]">
                    {value}
                  </div>
                  <div className="text-xs font-light mt-0.5 text-gray-600 dark:text-[#9CA3AF]">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
            ))}
          </div>

          {/* New Session Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreating(true)}
            className={cn(
              "w-full flex items-center justify-center gap-2 p-3 text-white font-semibold rounded-xl shadow-lg transition-all duration-300",
              "hover:shadow-xl"
            )}
            style={{ 
              backgroundColor: ACTIVE_GREEN,
              boxShadow: `0 4px 10px rgba(0, 250, 100, ${theme =="dark" ? '0.3' : '0.4'})`
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="tracking-wide">New Session</span>
          </motion.button>

          {/* New Session Input */}
          {isCreating && (
            <div className={cn(
              "mt-4 p-4 rounded-xl shadow-xl border",
              "bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
            )}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-[#EDEDED]">
                  Create Session
                </h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className={cn(
                    "p-1 rounded-full transition-colors duration-300",
                    "hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"
                  )}>
                  <X className="w-4 h-4 text-gray-500 dark:text-[#9CA3AF]" />
                </button>
              </div>
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Name your analysis..."
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-lg border focus:outline-none transition-all duration-300",
                  "bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-[#EDEDED] border-gray-200 dark:border-[#2A2A2A]",
                  "focus:ring-1 focus:ring-[#006239] focus:border-transparent"
                )}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCreateSession}
                  className={cn(
                    "flex-1 text-white py-2 text-sm font-semibold rounded-lg transition-colors duration-300",
                    "hover:bg-green-600"
                  )}
                  style={{ backgroundColor: ACCENT_GREEN }}
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg transition-colors duration-300",
                    "bg-gray-200 dark:bg-[#2A2A2A] text-gray-700 dark:text-[#9CA3AF]",
                    "hover:bg-gray-300 dark:hover:bg-[#3A3A3A]"
                  )}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Sessions List Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-3 border-b",
          "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]"
        )}>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#006239]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-[#9CA3AF]">
              Recent Analyses
            </span>
          </div>
          {sessions.length > 0 && (
            <button className={cn(
              "p-1.5 rounded-md transition-colors duration-300",
              "text-gray-500 dark:text-[#9CA3AF] hover:bg-gray-100 dark:hover:bg-[#1A1A1A]"
            )}>
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setCurrentSession(session.id);
                router.push("/");
              }}
              className={cn(
                "group p-4 cursor-pointer transition-all duration-300 rounded-xl border",
                currentSession?.id === session.id
                  ? "bg-[#006239] text-white border-transparent shadow-xl"
                  : cn(
                      "bg-gray-50 dark:bg-[#1E1E1E] text-gray-900 dark:text-[#EDEDED]",
                      "border-gray-200 dark:border-[#2A2A2A] hover:shadow-md"
                    )
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-semibold text-sm mb-1 tracking-wide truncate",
                    currentSession?.id === session.id ? "text-white" : "text-gray-900 dark:text-[#EDEDED]"
                  )}>
                    {session.name}
                  </h3>
                  <p className={cn(
                    "text-xs truncate mb-2 font-light",
                    currentSession?.id === session.id ? "text-white/80" : "text-gray-600 dark:text-[#9CA3AF]"
                  )}>
                    {session.query || 'No query yet'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-light",
                      currentSession?.id === session.id ? "text-white/70" : "text-gray-500 dark:text-[#9CA3AF]"
                    )}>
                      {formatDistanceToNow(session.createdAt, { addSuffix: true })}
                    </span>
                    {session.resultsCount > 0 && (
                      <>
                        <span className={cn(
                          "w-1 h-1 rounded-full",
                          currentSession?.id === session.id ? "bg-white" : "bg-[#006239]"
                        )} />
                        <span className={cn(
                          "text-xs px-2 py-0.5 font-medium rounded-full",
                          currentSession?.id === session.id 
                            ? "text-white border border-white/50" 
                            : "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20"
                        )}>
                          {session.resultsCount} found
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className={cn(
                  "flex items-center gap-1 ml-2 transition-opacity duration-300",
                  currentSession?.id === session.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                    className={cn(
                      "p-1 rounded-full transition-all duration-300",
                      currentSession?.id === session.id 
                        ? "hover:bg-red-600" 
                        : "hover:bg-red-50 dark:hover:bg-red-900/20"
                    )}>
                    <Trash2 className={cn(
                      "w-3.5 h-3.5",
                      currentSession?.id === session.id 
                        ? "text-white" 
                        : "text-gray-400 hover:text-red-500"
                    )} />
                  </button>
                  <ChevronRight className={cn(
                    "w-4 h-4 ml-1",
                    currentSession?.id === session.id ? "text-white" : "text-gray-400"
                  )} />
                </div>
              </div>
            </motion.div>
          ))}

          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <div className={cn(
                "w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-full border",
                "bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
              )}>
                <Search className="w-5 h-5 text-gray-500 dark:text-[#9CA3AF]" />
              </div>
              <p className="text-sm mb-1 font-light text-gray-600 dark:text-[#9CA3AF]">
                {searchTerm ? 'No matching analyses found' : 'No analyses yet'}
              </p>
              <p className="text-xs font-light text-gray-500 dark:text-[#6B7280]">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first analysis to begin'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className={cn(
          "p-4 space-y-1 border-t",
          "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]"
        )}>
          <Link href="/companies" className="block">
            <NavButton 
              icon={Building2} 
              label="Company Database" 
            />
          </Link>
          <NavButton 
            icon={Users} 
            label="Prospects" 
            onClick={() => {/* Add navigation */}}
          />
          <NavButton 
            icon={BarChart3} 
            label="Analytics" 
            onClick={() => {/* Add navigation */}}
          />
          <Link href="/icp-configuration" className="block">
            <NavButton 
              icon={Settings} 
              label="Configuration" 
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Enhanced NavButton component
function NavButton({ 
  icon: Icon, 
  label, 
  active = false,
  ...props 
}: { 
  icon: any
  label: string
  active?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 p-3 text-sm font-medium transition-all duration-300 rounded-xl border",
        "group hover:shadow-md",
        active
          ? cn(
              "font-semibold border-[#006239]",
              "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
            )
          : cn(
              "border-transparent text-gray-600 dark:text-[#9CA3AF]",
              "hover:border-gray-300 dark:hover:border-[#2A2A2A]",
              "hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
            )
      )}
      {...props}
    >
      <Icon className={cn(
        "w-4 h-4 transition-colors duration-300",
        active 
          ? "text-[#006239] dark:text-[#006239]" 
          : "text-gray-400 dark:text-gray-500 group-hover:text-[#006239] dark:group-hover:text-[#006239]"
      )} />
      <span className="tracking-wide font-medium">
        {label}
      </span>
    </button>
  )
}