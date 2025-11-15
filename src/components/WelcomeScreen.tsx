// components/WelcomeScreen.tsx
'use client'

import { motion } from 'framer-motion'
import { Sparkles, Search, Target, Zap, ArrowRight, Users, BarChart3, Building2, Crown, Rocket, Globe } from 'lucide-react'
import { useSession } from '@/context/SessionContext'
import { useTheme } from '@/context/ThemeContext'

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
 const { theme } = useTheme()
  const handleExampleQuery = async (query: string) => {
    const sessionName = `Search: ${query.substring(0, 30)}${query.length > 30 ? '...' : ''}`
    await createNewSession(sessionName)
  }

  const handleQuickStart = async () => {
    await createNewSession("Quick Start Search")
  }

  return (
    <div className="relative flex-1 flex items-start justify-center pt-20 pb-28 px-4 md:px-8 overflow-y-auto w-full bg-white dark:bg-[#0F0F0F]">
      {/* Main Content Container */}
      <div className="relative w-full max-w-3xl mx-auto">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4 mb-16"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center ">
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
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-[#EDEDED]">
              GTM Intelligence
            </h1>
            <p className="text-gray-600 dark:text-[#9CA3AF] text-sm mt-2">
              <span className="font-semibold">Powered by Plugging AI</span> — Premium Intelligence Platform
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-16"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2A2A2A] rounded-xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-[#006239]" />
                <div className="text-xl font-bold text-gray-900 dark:text-[#EDEDED]">{stat.value}</div>
              </div>
              <div className="text-gray-600 dark:text-[#9CA3AF] text-xs font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Main Hero Section */}
        <div className="p-8 bg-white dark:bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-xl mb-12">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-[#EDEDED] mb-4 leading-tight"
            >
              Discover Your Ideal Investments
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 dark:text-[#9CA3AF] mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Identify, analyze, and connect with companies that match your investment criteria using advanced AI algorithms.
            </motion.p>

            {/* Status Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 mb-10"
            >
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-[#006239]"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#006239]"></span>
              </span>
              <p className="text-gray-600 dark:text-[#9CA3AF] text-sm font-medium">AI Engine: Active and Ready</p>
            </motion.div>

            {/* Quick Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <button 
                onClick={handleQuickStart}
                className="px-8 py-4 text-white font-semibold text-lg transition-all duration-300 rounded-xl flex items-center gap-3 shadow-md hover:shadow-lg bg-[#006239] border border-[#006239] hover:bg-[#25a843] hover:border-[#25a843]"
              >
                <Rocket className="w-5 h-5" />
                Start New Analysis
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="group p-6 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2A2A2A] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
              onClick={handleQuickStart}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 bg-green-50 dark:bg-green-900/20"
              >
                <feature.icon className="w-5 h-5 text-[#006239]" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED] text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-[#9CA3AF] text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Example Queries Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-5 h-5 text-[#006239]" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED]">Try These Example Searches</h3>
          </div>
          
          <div className="space-y-4">
            {exampleQueries.map((query, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.9 + index * 0.1, 
                  ease: [0.25, 0.46, 0.45, 0.94] 
                }}
                onClick={() => handleExampleQuery(query)}
                className="w-full p-4 text-left bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2A2A2A] rounded-xl transition-all duration-300 group hover:shadow-lg dark:hover:shadow-green-900/10 hover:border-green-200 dark:hover:border-green-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-medium text-gray-900 dark:text-[#EDEDED] text-sm mb-1">
                      Analysis {index + 1}
                    </h4>
                    <p className="text-gray-600 dark:text-[#9CA3AF] text-sm">
                      {query}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs font-medium text-[#006239]">Start</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300 text-[#006239]" />
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
          <div className="flex items-center justify-center gap-2">
            <Globe className="w-4 h-4 text-gray-500 dark:text-[#9CA3AF]" />
            <p className="text-gray-500 dark:text-[#9CA3AF] text-sm">
              Trusted by leading investment teams worldwide
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}