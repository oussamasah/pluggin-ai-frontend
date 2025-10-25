
import { Cpu, Database, Filter, Search } from 'lucide-react';
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function QuickStartSearch() {
      const [activeCommandCategory, setActiveCommandCategory] = useState<string | null>(null)
  return (
    <div>   <div className="w-24 h-24 bg-gradient-to-br from-[#00FA64]/10 to-[#00FF80]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#00FA64]/20 shadow-[0_0_40px_rgba(0,250,100,0.1)]">
    <Cpu className="w-10 h-10 text-[#00FA64]" />
  </div>

  {/* Command Categories */}
  <div className="grid grid-cols-3 gap-4 mb-8">
    <CommandButton
      icon={<Database className="w-6 h-6" />}
      label="Companies"
      isActive={activeCommandCategory === "companies"}
      onClick={() => setActiveCommandCategory(activeCommandCategory === "companies" ? null : "companies")}
    />
    <CommandButton
      icon={<Filter className="w-6 h-6" />}
      label="Analysis"
      isActive={activeCommandCategory === "analysis"}
      onClick={() => setActiveCommandCategory(activeCommandCategory === "analysis" ? null : "analysis")}
    />
    <CommandButton
      icon={<Search className="w-6 h-6" />}
      label="Research"
      isActive={activeCommandCategory === "research"}
      onClick={() => setActiveCommandCategory(activeCommandCategory === "research" ? null : "research")}
    />
  </div>

  {/* Command Suggestions */}
  <AnimatePresence>
    {activeCommandCategory && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-8 overflow-hidden"
      >
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-[#27272a] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="text-sm font-bold text-white tracking-wide">
              {activeCommandCategory === "companies" && "COMPANY SEARCHES"}
              {activeCommandCategory === "analysis" && "ANALYSIS QUERIES"}
              {activeCommandCategory === "research" && "RESEARCH TASKS"}
            </h3>
          </div>
          <ul className="divide-y divide-[#27272a]">
            {commandSuggestions[
              activeCommandCategory as keyof typeof commandSuggestions
            ].map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleCommandSelect(suggestion)}
                className="p-4 hover:bg-[#00FA64]/5 cursor-pointer transition-all duration-200 border-b border-[#27272a] last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  {activeCommandCategory === "companies" ? (
                    <Database className="w-5 h-5 text-[#00FA64]" />
                  ) : activeCommandCategory === "analysis" ? (
                    <Filter className="w-5 h-5 text-[#00FA64]" />
                  ) : (
                    <Search className="w-5 h-5 text-[#00FA64]" />
                  )}
                  <span className="text-[#A1A1AA] font-light text-left">
                    {suggestion}
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    )}
  </AnimatePresence></div>
  )
}

export default QuickStartSearch

// CommandButton component remains the same...

interface CommandButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }
  
  function CommandButton({ icon, label, isActive, onClick }: CommandButtonProps) {
    return (
      <motion.button
        onClick={onClick}
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300 backdrop-blur-sm",
          isActive
            ? "bg-[#00FA64]/10 border-[#00FA64]/30 shadow-[0_0_20px_rgba(0,250,100,0.2)]"
            : "bg-black/40 border-[#27272a] hover:border-[#00FA64]/30 hover:bg-[#00FA64]/5"
        )}
      >
        <div className={cn(
          "transition-colors duration-300",
          isActive ? "text-[#00FA64]" : "text-[#A1A1AA]"
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-sm font-bold tracking-wide transition-colors duration-300",
          isActive ? "text-[#00FA64]" : "text-[#A1A1AA]"
        )}>
          {label}
        </span>
      </motion.button>
    )
  }