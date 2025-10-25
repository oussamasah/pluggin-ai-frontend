// context/ThemeContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // 1. Initial Load & Hydration fix
  useEffect(() => {
    setMounted(true)
    // Get initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(systemPrefersDark ? 'dark' : 'light')
    }
  }, [])

  // 2. Theme Change Effect (The crucial logic for Tailwind)
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    // **FIXED LOGIC**: Add/remove the 'dark' class based on the theme state.
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark') // Remove it for light mode
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    console.log('Toggling theme from:', theme, 'to:', theme === 'light' ? 'dark' : 'light')
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setThemeDirect = (newTheme: Theme) => {
    console.log('Setting theme to:', newTheme)
    setTheme(newTheme)
  }

  const value = {
    theme,
    toggleTheme,
    setTheme: setThemeDirect
  }

  // Prevent hydration mismatch: render a hidden div until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={value}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}