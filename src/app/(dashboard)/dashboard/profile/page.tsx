'use client'

import { useTheme } from '@/context/ThemeContext'
import { UserProfile } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default function ProfilePage() {
  const { theme } = useTheme()

  return (
    <div className="flex-1 p-8 bg-white dark:bg-[#0F0F0F] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <UserProfile 
          appearance={
            theme === 'dark' 
              ? {
                  baseTheme: dark,
                  variables: {
                    colorPrimary: '#006239',
                    colorBackground: '#1A1A1A',
                    colorText: '#EDEDED',
                    colorTextSecondary: '#9CA3AF',
                    colorInputBackground: '#0F0F0F',
                    colorInputText: '#EDEDED',
                    borderRadius: '0.75rem',
                  },
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-xl border border-[#2A2A2A] rounded-2xl',
                    navbar: 'border-r border-[#2A2A2A]',
                    formButtonPrimary: 'bg-[#006239] hover:bg-[#25a843] text-white',
                  }
                }
              : {
                  variables: {
                    colorPrimary: '#006239',
                    colorBackground: '#ffffff',
                    colorText: '#171717',
                    colorTextSecondary: '#525252',
                    colorInputBackground: '#f9f9f9',
                    colorInputText: '#171717',
                    borderRadius: '0.75rem',
                  },
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-xl border border-gray-200 rounded-2xl',
                    navbar: 'border-r border-gray-200',
                    formButtonPrimary: 'bg-[#006239] hover:bg-[#25a843] text-white',
                  }
                }
          }
          routing="hash" // Changed from "path" to "hash"
        />
      </div>
    </div>
  )
}