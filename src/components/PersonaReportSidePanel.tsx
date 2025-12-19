'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { PersonaIntelligenceReport } from './PersonaIntelligenceReport'
import { cn } from '@/lib/utils'

interface PersonaReportSidePanelProps {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
  employeeData: {
    markdownContent?: string
    employeeName?: string
    companyName?: string
    employeeRole?: string
  } | null
}

export function PersonaReportSidePanel({ 
  isOpen, 
  onClose, 
  isLoading = false,
  employeeData 
}: PersonaReportSidePanelProps) {
  // Close panel on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[60] cursor-pointer"
            onClick={onClose}
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "fixed top-0 right-0 h-full z-[61]",
              "w-full max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw]",
              "bg-white dark:bg-[#0F0F0F] shadow-2xl",
              "flex flex-col"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F] flex-shrink-0">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#EDEDED]">
                  Persona Intelligence Report
                </h2>
                {employeeData && (
                  <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                    {employeeData.employeeName} • {employeeData.employeeRole}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 dark:text-[#9CA3AF] hover:text-gray-600 dark:hover:text-[#EDEDED] transition-colors hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="w-12 h-12 text-[#006239] animate-spin" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 dark:text-[#EDEDED]">
                      Generating Persona Intelligence...
                    </p>
                    <p className="text-sm text-gray-600 dark:text-[#9CA3AF] mt-1">
                      Analyzing profile and creating insights
                    </p>
                  </div>
                </div>
              ) : employeeData?.markdownContent ? (
                <PersonaIntelligenceReport
                  markdownContent={employeeData.markdownContent}
                  employeeName={employeeData.employeeName}
                  companyName={employeeData.companyName}
                  employeeRole={employeeData.employeeRole}
                  className="h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-[#2A2A2A] rounded-full flex items-center justify-center">
                    <X className="w-8 h-8 text-gray-400 dark:text-[#6A6A6A]" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 dark:text-[#EDEDED]">
                      No Persona Data Available
                    </p>
                    <p className="text-sm text-gray-600 dark:text-[#9CA3AF] mt-1">
                      Unable to generate persona intelligence for this profile
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

