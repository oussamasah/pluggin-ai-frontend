// components/BackendHealthCheck.tsx
'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { Wifi, WifiOff, Server } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackendHealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setIsChecking(true)
        await apiClient.healthCheck()
        setIsHealthy(true)
      } catch (error) {
        setIsHealthy(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkHealth()
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Server className="w-4 h-4 animate-pulse" />
        <span>Checking backend...</span>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm",
      isHealthy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
    )}>
      {isHealthy ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Backend Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Backend Offline</span>
        </>
      )}
    </div>
  )
}