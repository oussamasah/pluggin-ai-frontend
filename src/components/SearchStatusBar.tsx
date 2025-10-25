// components/SearchStatusBar.tsx
import { motion } from 'framer-motion'
import { Search, Database, Target, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { SearchStatus } from '@/types'
import { cn } from '@/lib/utils'

interface SearchStatusBarProps {
  status: SearchStatus
}

const statusConfig = {
  initial: { icon: Loader, color: 'gray', label: 'Initial' },
  searching: { icon: Search, color: 'green', label: 'Searching' },
  enriching: { icon: Database, color: 'green', label: 'Enriching' },
  scoring: { icon: Target, color: 'green', label: 'Scoring' },
  complete: { icon: CheckCircle, color: 'green', label: 'Complete' },
  error: { icon: AlertCircle, color: 'red', label: 'Error' },
} as const

export function SearchStatusBar({ status }: SearchStatusBarProps) {
  const config = statusConfig[status.stage as keyof typeof statusConfig] ?? {
    icon: Loader,
    color: 'gray',
    label: 'Initial'
  }
  
  const Icon = config.icon

  const colorClasses: Record<'green' | 'red' | 'gray', string> = {
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
    gray: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mx-4 mt-4 p-4 rounded-2xl border backdrop-blur-sm",
        colorClasses[config.color]
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {status.stage === 'searching' || status.stage === 'enriching' || status.stage === 'scoring' ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            <span className="font-medium text-sm">{config.label}</span>
          </div>
          <div className="h-4 w-px bg-current opacity-20" />
          <p className="text-sm opacity-90">{status.message}</p>
          {status.details && (
            <>
              <div className="h-4 w-px bg-current opacity-20" />
              <p className="text-sm opacity-70">{status.details}</p>
            </>
          )}
        </div>

        {/* Progress */}
        {status.progress !== undefined && (
          <div className="flex items-center gap-3">
            <div className="w-24 bg-white/50 dark:bg-black/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  config.color === 'green' && "bg-[#67F227]",
                  config.color === 'red' && "bg-red-500",
                  config.color === 'gray' && "bg-gray-500"
                )}
              />
            </div>
            <span className="text-sm font-medium w-8">
              {status.progress}%
            </span>
          </div>
        )}
      </div>

      {/* Step Progress */}
      {status.currentStep && status.totalSteps && (
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 bg-white/50 dark:bg-black/20 rounded-full h-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${(status.currentStep / status.totalSteps) * 100}%` 
              }}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                config.color === 'green' && "bg-[#67F227]",
                config.color === 'red' && "bg-red-500",
                config.color === 'gray' && "bg-gray-500"
              )}
            />
          </div>
          <span className="text-xs opacity-70">
            Step {status.currentStep} of {status.totalSteps}
          </span>
        </div>
      )}
    </motion.div>
  )
}