"use client";
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
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { WebGLShaderSidebar } from './ui/web-gl-shader-sidebar'
import { useRouter } from 'next/navigation'

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
    session.query?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalSearches: sessions.length,
    totalCompanies: sessions.reduce((sum, session) => sum + (session.resultsCount || 0), 0),
    activeSessions: sessions.filter(s => s.companies && s.companies.length > 0).length
  }

  return (
    <div className="fixed w-[20%]  h-screen  top-0 left-0 flex flex-col bg-slate-900/80 border-r border-[#27272a] shadow-2xl z-9 overflow-hidden">
      {/* WebGL Shader Background */}

      
      {/* Content Container */}
      <div className=" z-10 flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-[#27272a] bg-black/60 ">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#00FA64] to-[#00FF80] rounded-xl shadow-[0_0_20px_rgba(0,250,100,0.3)]">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">ICP SCOUT</h1>
                <p className="text-[#A1A1AA] text-xs font-light tracking-wide">ENTERPRISE INTELLIGENCE</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 backdrop-blur-md border border-[#27272a] rounded-xl text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#00FA64] focus:border-transparent transition-all duration-500"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-black/40 backdrop-blur-md rounded-xl border border-[#27272a]">
              <div className="text-sm font-bold text-white">{stats.totalSearches}</div>
              <div className="text-xs text-[#A1A1AA] font-light">SEARCHES</div>
            </div>
            <div className="text-center p-3 bg-black/40 backdrop-blur-md rounded-xl border border-[#27272a]">
              <div className="text-sm font-bold text-white">{stats.totalCompanies}</div>
              <div className="text-xs text-[#A1A1AA] font-light">COMPANIES</div>
            </div>
            <div className="text-center p-3 bg-black/40 backdrop-blur-md rounded-xl border border-[#27272a]">
              <div className="text-sm font-bold text-white">{stats.activeSessions}</div>
              <div className="text-xs text-[#A1A1AA] font-light">ACTIVE</div>
            </div>
          </div>

          {/* New Session Button */}
          <button
                 onClick={() => setIsCreating(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-[#67F227] to-[#A7F205] text-gray-900 py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#A7F205] hover:to-[#C3F25C] transition-all duration-300 flex items-center justify-center gap-2"
                >
  <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
  <span className="tracking-wide">NEW SEARCH</span>
                  </button>

          {/* New Session Input */}
          {isCreating && (
            <div className="mt-4 p-4 bg-black/60  rounded-xl border border-[#27272a] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white tracking-wide">CREATE NEW SEARCH</h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1 hover:bg-[#27272a] rounded-lg transition-colors duration-300"
                >
                  <X className="w-4 h-4 text-[#A1A1AA]" />
                </button>
              </div>
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Enter session name..."
                className="w-full px-3 py-3 bg-black/40 backdrop-blur-md border border-[#27272a] rounded-lg text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#00FA64] focus:border-transparent"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCreateSession}
                  className="flex-1 bg-[#00FA64] text-black py-2 rounded-lg text-sm font-bold hover:bg-[#00FF80] transition-colors duration-300"
                >
                  CREATE
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 bg-[#27272a] text-[#A1A1AA] py-2 rounded-lg text-sm font-medium hover:bg-[#363636] transition-colors duration-300"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sessions List Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-black/60 ">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#00FA64]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              RECENT SEARCHES
            </span>
          </div>
          {sessions.length > 0 && (
            <button className="p-1.5 text-[#A1A1AA] hover:text-white transition-colors duration-300">
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                setCurrentSession(session.id);
                router.push("/"); // 👈 Navigate to home
              }}
              className={cn(
                "group p-4 rounded-xl cursor-pointer transition-all duration-500 border backdrop-blur-md",
                currentSession?.id === session.id
                  ? 'bg-[#00FA64]/10 border-[#00FA64] shadow-[0_0_20px_rgba(0,250,100,0.2)]'
                  : 'bg-black/40 border-[#27272a] hover:border-[#00FA64]/40 hover:bg-[#00FA64]/5 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(0,250,100,0.1)]'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm mb-1 tracking-wide truncate">
                    {session.name}
                  </h3>
                  <p className="text-[#A1A1AA] text-xs truncate mb-2 font-light">
                    {session.query || 'No query yet'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A1A1AA] font-light">
                      {formatDistanceToNow(session.createdAt, { addSuffix: true })}
                    </span>
                    {session.resultsCount > 0 && (
                      <>
                        <span className="w-1 h-1 bg-[#00FA64] rounded-full" />
                        <span className="bg-[#00FA64]/20 text-[#00FA64] text-xs px-2 py-1 rounded-full font-medium">
                          {session.resultsCount} FOUND
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                    className="p-1.5 text-[#A1A1AA] hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all duration-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-[#00FA64] ml-1" />
                </div>
              </div>
            </div>
          ))}

          {filteredSessions.length === 0 && (
            <div className="text-center py-12 backdrop-blur-md">
              <div className="w-16 h-16 bg-[#00FA64]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#00FA64]/20">
                <Search className="w-6 h-6 text-[#00FA64]" />
              </div>
              <p className="text-[#A1A1AA] text-sm mb-1 font-light">
                {searchTerm ? 'No matching searches found' : 'No searches yet'}
              </p>
              <p className="text-xs text-[#666666] font-light">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first search to get started'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="p-4 border-t border-[#27272a] space-y-2 bg-black/60 ">

             <Link href="/companies" className="block">
            <NavButton 
              icon={Building2} 
              label="COMPANY DATABASE" 
            />
          </Link>
          <NavButton 
            icon={Users} 
            label="PROSPECTS" 
            onClick={() => {/* Add navigation */}}
          />
          <NavButton 
            icon={BarChart3} 
            label="ANALYTICS" 
            onClick={() => {/* Add navigation */}}
          />
          <Link href="/icp-configuration" className="block">
            <NavButton 
              icon={Settings} 
              label="ICP CONFIGURATION" 
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

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
        "w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all duration-500 group backdrop-blur-md",
        active
          ? 'bg-[#00FA64]/10 text-[#00FA64] border border-[#00FA64]/30 shadow-[0_0_20px_rgba(0,250,100,0.2)]'
          : 'text-[#A1A1AA] hover:text-white hover:bg-white/5 hover:border hover:border-[#00FA64]/20'
      )}
      {...props}
    >
      <Icon className={cn(
        "w-4 h-4 transition-colors duration-500",
        active 
          ? "text-[#00FA64]" 
          : "text-[#A1A1AA] group-hover:text-[#00FA64]"
      )} />
      <span className="tracking-wide font-medium">{label}</span>
    </button>
  )
}