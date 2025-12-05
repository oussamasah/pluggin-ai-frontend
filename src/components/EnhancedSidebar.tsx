'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSession } from '@/context/SessionContext'
import { useTheme } from '@/context/ThemeContext'
import { useUser, useClerk, useOrganization } from '@clerk/nextjs'

import { 
  Search, 
  Plus, 
  Settings, 
  Trash2, 
  Building2,
  Users,
  BarChart3,
  ChevronRight,
  X,
  Filter,
  Target,
  LogOut,
  User,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { useRouter, usePathname } from 'next/navigation'

// --- Color Constants for Plugging AI Brand ---
const ACCENT_GREEN = '#006239' // The core brand green (used for gradients/logos)
const ACTIVE_GREEN = '#006239' // The bright green (used for highlights/active text)

export function EnhancedSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoaded: isUserLoaded } = useUser()
  const { signOut } = useClerk()
  const { organization } = useOrganization()
  
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
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Add debugging to see session data
  useEffect(() => {
    console.log('🔍 Sidebar Sessions Debug:', {
      totalSessions: sessions.length,
      sessions: sessions.map(s => ({
        id: s.id,
        name: s.name,
        resultsCount: s.resultsCount,
        companiesCount: s.companies?.length,
        query: s.query,
        hasCompaniesArray: !!s.companies,
        hasResultsCount: s.resultsCount > 0
      }))
    })
  }, [sessions])

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return
    
    await createNewSession(newSessionName)
    setNewSessionName('')
    setIsCreating(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.query?.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fixed stats calculation
  const stats = {
    totalSearches: sessions.length,
    totalCompanies: sessions.reduce((sum, session) => {
      // Prefer companies array length, fall back to resultsCount
      const count = session.companies?.length || session.resultsCount || 0
      return sum + count
    }, 0),
    activeSessions: sessions.filter(s => {
      const hasCompanies = s.companies && s.companies.length > 0
      const hasResults = s.resultsCount && s.resultsCount > 0
      return hasCompanies || hasResults
    }).length
  }

  // Get user's plan info
  const userPlan = user?.publicMetadata?.plan as { name?: string } | undefined
  const orgPlan = organization?.publicMetadata?.plan as { name?: string } | undefined
  const currentPlan = organization ? orgPlan?.name : userPlan?.name

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
            <Link href="/dashboard" className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" 
              >
                {theme === "dark" ? (
                  <img 
                    src="/plauging-ai-dark.png" 
                    alt="Plugging AI Logo" 
                    className="w-8 h-8"
                  />
                ) : (
                  <img 
                    src="/plauging-ai-light.png" 
                    alt="Plugging AI Logo" 
                    className="w-8 h-8"
                  />
                )}   
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-[#EDEDED]">
                  GTM Intelligence
                </h1>
                <p className="text-xs font-light text-gray-600 dark:text-[#9CA3AF]">
                  Powered by Plugging AI
                </p>
              </div>
            </Link>
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
              boxShadow: `0 4px 10px rgba(0, 250, 100, ${theme === "dark" ? '0.3' : '0.4'})`
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
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
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
          {filteredSessions.map((session) => {
            // Calculate the actual company count - this is the key fix
            const companyCount = session.companies?.length || session.resultsCount || 0
            const hasCompanies = companyCount > 0

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setCurrentSession(session.id);
                  router.push("/dashboard");
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
                      {session.query?.[session.query.length - 1] || session.query?.[0] || 'No query yet'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-light",
                        currentSession?.id === session.id ? "text-white/70" : "text-gray-500 dark:text-[#9CA3AF]"
                      )}>
                        {formatDistanceToNow(session.createdAt, { addSuffix: true })}
                      </span>
                      {hasCompanies && (
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
                            {companyCount} found
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
            )
          })}

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
          <Link href="/dashboard/companies" className="block">
            <NavButton 
              icon={Building2} 
              label="Companies" 
              active={pathname === '/dashboard/companies'}
            />
          </Link>
          <Link href="/dashboard/team" className="block">
            <NavButton 
              icon={Users} 
              label="Team" 
              active={pathname === '/dashboard/team'}
            />
          </Link>

          <Link href="/dashboard/settings" className="block">
            <NavButton 
              icon={Settings} 
              label="ICP Models" 
              active={pathname === '/dashboard/settings'}
            />
          </Link>
        </div>

        {/* User Menu Section */}
        <div className={cn(
          "p-4 border-t",
          "bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
        )}>
          {isUserLoaded && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                  "hover:bg-white dark:hover:bg-[#2A2A2A]",
                  showUserMenu && "bg-white dark:bg-[#2A2A2A]"
                )}
              >
                {/* User Avatar */}
                {user.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.firstName || 'User'} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#006239]/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#006239] flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                
                {/* User Info */}
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-[#EDEDED] truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#9CA3AF] truncate flex items-center gap-1">
                    {organization ? (
                      <>
                        <Building2 className="w-3 h-3" />
                        {organization.name}
                      </>
                    ) : currentPlan ? (
                      <>
                        <Crown className="w-3 h-3" />
                        {currentPlan} Plan
                      </>
                    ) : (
                      user.primaryEmailAddress?.emailAddress
                    )}
                  </p>
                </div>

                <ChevronRight className={cn(
                  "w-4 h-4 text-gray-400 transition-transform duration-200",
                  showUserMenu && "rotate-90"
                )} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl shadow-xl border z-50",
                    "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
                  )}
                >
                  <Link 
                    href="/dashboard/profile"
                    onClick={() => setShowUserMenu(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200",
                      "text-gray-700 dark:text-[#EDEDED] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                    )}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>

                  {organization && (
                    <Link 
                      href="/dashboard/team"
                      onClick={() => setShowUserMenu(false)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200",
                        "text-gray-700 dark:text-[#EDEDED] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                      )}
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Team Settings</span>
                    </Link>
                  )}

                  <div className="h-px bg-gray-200 dark:bg-[#2A2A2A] my-1" />

                  <button
                    onClick={handleSignOut}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-200",
                      "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    )}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#2A2A2A] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-[#2A2A2A] rounded animate-pulse w-24" />
                <div className="h-3 bg-gray-200 dark:bg-[#2A2A2A] rounded animate-pulse w-32" />
              </div>
            </div>
          )}
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
