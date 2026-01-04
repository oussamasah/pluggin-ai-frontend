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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className={cn('mb-4 pb-4 border-b border-gray-200 dark:border-[#2A2A2A]', className)}
      >
        {/* Title with icon */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#006239]/10 dark:bg-[#006239]/20 flex items-center justify-center">
            <Loader2 className={cn('w-3.5 h-3.5 animate-spin', config.color)} />
          </div>
          <h3 className={cn(
            'text-sm font-semibold',
            'text-[#006239] dark:text-[#006239]'
          )}>
            {config.name}
          </h3>
          {currentStep.progress !== undefined && (
            <span className="text-xs text-gray-500 dark:text-[#6B7280] ml-auto">
              {currentStep.progress}%
            </span>
          )}
        </div>
        
        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-[#9CA3AF] leading-relaxed ml-8">
          {currentStep.description}
        </p>

        {/* Progress bar */}
        {currentStep.progress !== undefined && (
          <div className="mt-2 w-full bg-gray-200 dark:bg-[#2A2A2A] rounded-full h-1 overflow-hidden ml-8">
            <motion.div
              className="h-1 rounded-full"
              style={{ backgroundColor: ACTIVE_GREEN }}
              initial={{ width: 0 }}
              animate={{ width: `${currentStep.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default ReasoningWorkflow

