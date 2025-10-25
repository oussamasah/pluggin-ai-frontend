// components/WelcomeScreen.tsx
'use client'

import { motion } from 'framer-motion'
import { Sparkles, Search, Target, Zap, ArrowRight, Users, BarChart3, Building2 } from 'lucide-react'
import { useSession } from '@/context/SessionContext'
import { LiquidButton } from './ui/liquid-glass-button'

const features = [
  {
    icon: Search,
    title: 'AI-Powered Search',
    description: 'Find companies using natural language and advanced AI algorithms'
  },
  {
    icon: Target,
    title: 'ICP Matching',
    description: 'Automatically score companies against your ideal customer profile'
  },
  {
    icon: Zap,
    title: 'Real-time Data',
    description: 'Get the most up-to-date company information and signals'
  }
]

const stats = [
  {
    value: "10M+",
    label: "Companies",
    icon: Building2
  },
  {
    value: "500+",
    label: "Data Points",
    icon: BarChart3
  },
  {
    value: "99%",
    label: "Accuracy",
    icon: Target
  }
]

const exampleQueries = [
  "Find SaaS companies in Europe with 50-200 employees that use React",
  "Show me fintech startups in Southeast Asia that recently raised Series A",
  "Search for manufacturing companies in US with 201-500 employees expanding to Europe",
  "Find e-commerce companies using Shopify with $1M-$10M revenue"
]

export function WelcomeScreen() {
  const { createNewSession } = useSession()

  const handleExampleQuery = async (query: string) => {
    const sessionName = `Search: ${query.substring(0, 30)}${query.length > 30 ? '...' : ''}`
    await createNewSession(sessionName)
  }

  const handleQuickStart = async () => {
    await createNewSession("Quick Start Search")
  }

  return (
    <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden  bg-black/80  w-full">
      {/* WebGL Shader Background */}
   
      
      {/* Main Content Container */}
      <div className="relative w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <div className="p-3 bg-gradient-to-br from-[#00FA64] to-[#00FF80] rounded-2xl shadow-[0_0_40px_rgba(0,250,100,0.3)]">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-white">
              ICP SCOUT
            </h1>
            <p className="text-[#A1A1AA] text-sm mt-2 font-light tracking-wide">ENTERPRISE INTELLIGENCE PLATFORM</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-16"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-[#27272a] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <stat.icon className="w-5 h-5 text-[#00FA64]" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </div>
              <div className="text-[#A1A1AA] text-xs font-medium tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Main Hero Section */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-[#27272a] shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden mb-12">
          <div className="p-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight"
            >
              FIND YOUR IDEAL CUSTOMERS
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-[#A1A1AA] mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Discover, score, and connect with companies that perfectly match your ideal customer profile using advanced AI algorithms
            </motion.p>

            {/* Availability Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-3 mb-12"
            >
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FA64] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00FA64]"></span>
              </span>
              <p className="text-[#00FA64] text-sm font-medium tracking-wide">READY TO FIND YOUR PERFECT MATCHES</p>
            </motion.div>

            {/* Quick Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <LiquidButton 
                onClick={handleQuickStart}
                className="text-white border border-[#00FA64]/30 rounded-full bg-gradient-to-r from-[#00FA64] to-[#00FF80] hover:from-[#00FF80] hover:to-[#80FFC2] transition-all duration-500 shadow-[0_0_40px_rgba(0,250,100,0.3)] hover:shadow-[0_0_60px_rgba(0,250,100,0.5)]"
                size="xxl"
              >
                START SEARCHING NOW
              </LiquidButton>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="group p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-[#27272a] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_48px_rgba(0,250,100,0.1)] transition-all duration-500 hover:-translate-y-2 cursor-pointer hover:border-[#00FA64]/30"
              onClick={() => handleQuickStart()}
            >
              <div className="w-14 h-14 bg-[#00FA64]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-[#00FA64]/20">
                <feature.icon className="w-7 h-7 text-[#00FA64]" />
              </div>
              <h3 className="font-bold text-white text-xl mb-4 tracking-wide">{feature.title}</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed font-light">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Example Queries Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-black/40 backdrop-blur-xl rounded-2xl border border-[#27272a] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <Search className="w-6 h-6 text-[#00FA64]" />
            <h3 className="text-xl font-bold text-white tracking-wide">TRY THESE EXAMPLE SEARCHES</h3>
          </div>
          
          <div className="space-y-4">
            {exampleQueries.map((query, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                onClick={() => handleExampleQuery(query)}
                className="w-full p-6 text-left bg-black/60 backdrop-blur-md rounded-xl border border-[#27272a] hover:border-[#00FA64]/40 hover:bg-[#00FA64]/5 transition-all duration-500 group hover:shadow-[0_8px_32px_rgba(0,250,100,0.1)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-base mb-2 tracking-wide">
                      SEARCH SESSION {index + 1}
                    </h4>
                    <p className="text-[#A1A1AA] text-sm font-light">
                      {query}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-xs text-[#00FA64] font-medium tracking-wide">CLICK TO START</span>
                    <ArrowRight className="w-5 h-5 text-[#00FA64] transform group-hover:translate-x-2 transition-transform duration-500" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-16"
        >
          <p className="text-[#A1A1AA] text-sm font-light tracking-wide">
            JOIN THOUSANDS OF SALES TEAMS FINDING THEIR PERFECT CUSTOMERS WITH ICP SCOUT
          </p>
        </motion.div>
      </div>
    </div>
  )
}