'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2, Circle, Brain, Database, BarChart3, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTIVE_GREEN = '#006239'

interface WorkflowStep {
  id: string
  node: string
  name: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  progress?: number
}

interface ReasoningWorkflowProps {
  steps: WorkflowStep[]
  currentProgress?: number
  className?: string
}

// Node to icon and name mapping
const nodeConfig: Record<string, { icon: React.ElementType; name: string; color: string }> = {
  planner: {
    icon: Brain,
    name: 'Planning',
    color: 'text-blue-600 dark:text-blue-400'
  },
  retriever: {
    icon: Database,
    name: 'Retrieving',
    color: 'text-purple-600 dark:text-purple-400'
  },
  analyzer: {
    icon: BarChart3,
    name: 'Analyzing',
    color: 'text-orange-600 dark:text-orange-400'
  },
  responder: {
    icon: MessageSquare,
    name: 'Responding',
    color: 'text-green-600 dark:text-green-400'
  }
}

export function ReasoningWorkflow({ steps, currentProgress, className }: ReasoningWorkflowProps) {
  // Only show the current in-progress step, not completed or pending steps
  const currentStep = steps.find(step => step.status === 'in-progress')
  
  if (!currentStep) return null

  const config = nodeConfig[currentStep.node] || {
    icon: Circle,
    name: currentStep.node,
    color: 'text-gray-600 dark:text-[#9CA3AF]'
  }
  const Icon = config.icon

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={cn('mb-4 pb-4 border-b border-gray-100/80 dark:border-[#2A2A2A]/30', className)}
      >
        {/* Minimalist header with icon and title */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#006239]/10 to-[#006239]/5 dark:from-[#006239]/20 dark:to-[#006239]/10 flex items-center justify-center ring-1 ring-[#006239]/10 dark:ring-[#006239]/20">
            <Loader2 className={cn('w-3 h-3 animate-spin text-[#006239] dark:text-[#006239]')} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'text-sm font-medium tracking-tight',
              'text-[#006239] dark:text-[#006239]'
            )}>
              {config.name}
            </h3>
          </div>
          {currentStep.progress !== undefined && (
            <span className="text-xs font-medium text-gray-400 dark:text-[#6B7280] tabular-nums">
              {currentStep.progress}%
            </span>
          )}
        </div>
        
        {/* Minimalist description */}
        <p className="text-xs text-gray-500 dark:text-[#9CA3AF] leading-relaxed font-light pl-[30px]">
          {currentStep.description}
        </p>

        {/* Premium progress bar with fixed width container */}
        {currentStep.progress !== undefined && (
          <div className="mt-3 pl-[30px]">
            <div className="relative w-full h-0.5 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#006239] to-[#006239]/80"
                initial={{ width: 0 }}
                animate={{ width: `${currentStep.progress}%` }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default ReasoningWorkflow

