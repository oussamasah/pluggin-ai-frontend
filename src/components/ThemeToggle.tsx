// components/ThemeToggle.tsx
'use client'

import { useTheme } from '@/context/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        <Sun className="w-4 h-4" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/60 dark:bg-[#1A1A1A]/80 border border-gray-300/60 dark:border-gray-700 hover:border-[#67F227]/30 dark:hover:border-[#67F227]/50 transition-all duration-200 hover:shadow-md group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-gray-600 group-hover:text-[#67F227] transition-colors" />
      ) : (
        <Sun className="w-4 h-4 text-gray-400 group-hover:text-[#67F227] transition-colors" />
      )}
    </button>
  )
}