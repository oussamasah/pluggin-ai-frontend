'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser, useOrganizationList, useAuth } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { Rocket, Users, Building2, ArrowRight, Check, Loader2 } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { toast } from 'sonner'
import { updateUserPlan, createOrganizationWithPlan } from '@/lib/actions/organization'

interface SelectedPlan {
  id: 'solo' | 'pro' | 'business'
  name: string
  limits: {
    members: number | string
    projects: number | string
    searches: number | string
    features: string[]
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded: isUserLoaded } = useUser()
  const { isSignedIn } = useAuth()
  const { setActive } = useOrganizationList()
  const { theme } = useTheme()

  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null)
  const [orgName, setOrgName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load selected plan from sessionStorage
  useEffect(() => {
    const storedPlan = sessionStorage.getItem('selectedPlan')
    if (storedPlan) {
      try {
        setSelectedPlan(JSON.parse(storedPlan))
      } catch (e) {
        console.error('Failed to parse stored plan')
      }
    }
  }, [])

  // Redirect if not signed in
  useEffect(() => {
    if (isUserLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isUserLoaded, isSignedIn, router])

  const handleSetupAccount = async () => {
    if (!selectedPlan || !user) return

    setIsLoading(true)

    try {
      if (selectedPlan.id === 'solo') {
        // Solo plan - update user metadata
        await updateUserPlan(selectedPlan, user.id)
        toast.success('Account setup complete!')
        sessionStorage.removeItem('selectedPlan')
        router.push('/dashboard')
      } else {
        // Pro or Business plan - create organization
        if (!orgName.trim()) {
          toast.error('Please enter an organization name')
          setIsLoading(false)
          return
        }

        const result = await createOrganizationWithPlan(orgName.trim(), selectedPlan, user.id)

        // Set organization active
        if (setActive && result.organizationId) {
          await setActive({ organization: result.organizationId })
        }

        toast.success('Organization created successfully!')
        sessionStorage.removeItem('selectedPlan')
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Setup error:', error)
      toast.error(error.errors?.[0]?.message || error.message || 'Failed to complete setup')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isUserLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-[#0F0F0F] dark:via-[#0F0F0F] dark:to-[#0F0F0F]">
        <Loader2 className="w-8 h-8 text-[#006239] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-[#0F0F0F] dark:via-[#0F0F0F] dark:to-[#0F0F0F]">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center">
                <img 
                  src={theme === 'dark' ? '/plauging-ai-dark.png' : '/plauging-ai-light.png'} 
                  alt="Plugging AI Logo" 
                  className="w-14 h-14" 
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#EDEDED] tracking-tight">
              Complete Your Setup
            </h1>
            <p className="text-gray-600 dark:text-[#9CA3AF] mt-2">
              {selectedPlan 
                ? `Setting up your ${selectedPlan.name} plan`
                : 'Choose a plan to get started'}
            </p>
          </div>

          {/* Setup Card */}
          <div className={cn("p-8 rounded-2xl border shadow-2xl", "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]")}>
            {selectedPlan ? (
              <>
                {/* Plan Summary */}
                <div className={cn("p-4 rounded-xl mb-6", "bg-[#006239]/10 dark:bg-[#006239]/20")}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#006239] flex items-center justify-center">
                      {selectedPlan.id === 'solo' ? <Rocket className="w-5 h-5 text-white" /> :
                       selectedPlan.id === 'pro' ? <Users className="w-5 h-5 text-white" /> :
                       <Building2 className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-[#EDEDED]">
                        {selectedPlan.name} Plan
                      </p>
                      <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                        {selectedPlan.limits.members === 1 
                          ? 'Personal account'
                          : `Up to ${selectedPlan.limits.members} team members`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organization Name Input */}
                {selectedPlan.id !== 'solo' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#EDEDED] mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Enter your company or team name"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border",
                        "bg-gray-50 dark:bg-[#0F0F0F] text-gray-900 dark:text-[#EDEDED]",
                        "border-gray-200 dark:border-[#2A2A2A]",
                        "focus:ring-2 focus:ring-[#006239] focus:border-transparent outline-none"
                      )}
                    />
                  </div>
                )}

                {/* Features Summary */}
                <div className="space-y-3 mb-8">
                  <p className="text-sm font-medium text-gray-700 dark:text-[#EDEDED]">What's included:</p>
                  {selectedPlan.limits.features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#9CA3AF]">
                      <Check className="w-4 h-4 text-[#006239]" /> {feature}
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={handleSetupAccount}
                  disabled={isLoading || (selectedPlan.id !== 'solo' && !orgName.trim())}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all duration-300",
                    isLoading || (selectedPlan.id !== 'solo' && !orgName.trim())
                      ? "bg-gray-200 dark:bg-[#2A2A2A] text-gray-400 cursor-not-allowed"
                      : "bg-[#006239] hover:bg-[#25a843] text-white shadow-lg hover:shadow-xl"
                  )}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Setup <ArrowRight className="w-5 h-5" /></>}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-[#9CA3AF] mb-4">No plan selected. Please choose a plan.</p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 text-white bg-[#006239] hover:bg-[#25a843] rounded-xl font-medium transition-all duration-300"
                >
                  View Plans
                </button>
              </div>
            )}
          </div>

          {/* Skip Option */}
          {selectedPlan && (
            <p className="text-center text-sm text-gray-500 dark:text-[#9CA3AF] mt-6">
              <button
                onClick={() => {
                  sessionStorage.removeItem('selectedPlan')
                  router.push('/dashboard')
                }}
                className="text-[#006239] hover:text-[#25a843] font-medium"
              >
                Skip for now
              </button>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
