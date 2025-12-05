'use client'

import { SignIn, useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const { theme } = useTheme()
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const [redirectUrl, setRedirectUrl] = useState('/dashboard')

  // Check if there's a selected plan in sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const selectedPlan = sessionStorage.getItem('selectedPlan')
      if (selectedPlan) {
        setRedirectUrl('/onboarding')
      }
    }
  }, [])

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const selectedPlan = sessionStorage.getItem('selectedPlan')
      if (selectedPlan) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#006239]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              {theme === "dark" ? (
                <img 
                  src="/plauging-ai-dark.png" 
                  alt="Plugging AI Logo" 
                  className="w-14 h-14"
                />
              ) : (
                <img 
                  src="/plauging-ai-light.png" 
                  alt="Plugging AI Logo" 
                  className="w-14 h-14"
                />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#EDEDED] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-[#9CA3AF] mt-2">
            Sign in to access your GTM Intelligence dashboard
          </p>
        </div>

        {/* Clerk Sign In Component */}
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] rounded-2xl',
              headerTitle: 'text-gray-900 dark:text-[#EDEDED]',
              headerSubtitle: 'text-gray-600 dark:text-[#9CA3AF]',
              formFieldLabel: 'text-gray-700 dark:text-[#EDEDED]',
              formFieldInput: 'bg-gray-50 dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A] text-gray-900 dark:text-[#EDEDED] focus:ring-[#006239] focus:border-[#006239]',
              formButtonPrimary: 'bg-[#006239] hover:bg-[#25a843] transition-all duration-300 shadow-lg',
              footerActionLink: 'text-[#006239] hover:text-[#25a843]',
              identityPreviewText: 'text-gray-900 dark:text-[#EDEDED]',
              identityPreviewEditButton: 'text-[#006239] hover:text-[#25a843]',
              formFieldAction: 'text-[#006239] hover:text-[#25a843]',
              dividerLine: 'bg-gray-200 dark:bg-[#2A2A2A]',
              dividerText: 'text-gray-500 dark:text-[#9CA3AF]',
              socialButtonsBlockButton: 'border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-[#EDEDED] hover:bg-gray-50 dark:hover:bg-[#2A2A2A]',
              socialButtonsBlockButtonText: 'text-gray-700 dark:text-[#EDEDED]',
              footer: 'hidden',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl={redirectUrl}
        />

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-[#9CA3AF] mt-6">
          Don't have an account?{' '}
          <a href="/sign-up" className="text-[#006239] hover:text-[#25a843] font-medium">
            Sign up
          </a>
        </p>
      </motion.div>
    </div>
  )
}
