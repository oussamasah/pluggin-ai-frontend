'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { 
  Rocket, 
  Check, 
  Crown, 
  Users, 
  Building2, 
  Zap, 
  ArrowRight, 
  Star,
  Globe,
  BarChart3,
  Target,
  Search,
  Shield,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

// Plan types
interface Plan {
  id: 'solo' | 'pro' | 'business'
  name: string
  description: string
  price: string
  period: string
  icon: any
  popular?: boolean
  limits: {
    members: number | 'Unlimited'
    projects: number | 'Unlimited'
    searches: number | 'Unlimited'
    features: string[]
  }
}

const plans: Plan[] = [
  {
    id: 'solo',
    name: 'Solo',
    description: 'Perfect for individual researchers and consultants',
    price: '$29',
    period: '/month',
    icon: Rocket,
    limits: {
      members: 1,
      projects: 3,
      searches: 100,
      features: [
        'AI-Powered Company Search',
        'Basic ICP Matching',
        'Export to CSV',
        'Email Support',
      ]
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams that need collaboration',
    price: '$79',
    period: '/month',
    icon: Crown,
    popular: true,
    limits: {
      members: 5,
      projects: 15,
      searches: 500,
      features: [
        'Everything in Solo',
        'Team Collaboration',
        'Advanced Analytics',
        'Priority Support',
        'API Access',
        'Custom Integrations',
      ]
    }
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For organizations that need enterprise features',
    price: '$199',
    period: '/month',
    icon: Building2,
    limits: {
      members: 'Unlimited',
      projects: 'Unlimited',
      searches: 'Unlimited',
      features: [
        'Everything in Pro',
        'Unlimited Team Members',
        'SSO Integration',
        'Dedicated Account Manager',
        'Custom Training',
        'SLA Guarantee',
        'White-label Options',
      ]
    }
  }
]

const features = [
  {
    icon: Search,
    title: 'AI-Powered Search',
    description: 'Find companies using natural language and advanced AI algorithms'
  },
  {
    icon: Target,
    title: 'ICP Matching',
    description: 'Automatically score companies against your ideal customer profile'
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Get the most up-to-date company information and signals'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with SOC 2 compliance and data encryption'
  }
]

const stats = [
  { value: '10M+', label: 'Companies' },
  { value: '500+', label: 'Data Points' },
  { value: '99%', label: 'Accuracy' },
  { value: '50K+', label: 'Users' }
]

export default function LandingPage() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { theme } = useTheme()

  const handleSelectPlan = (plan: Plan) => {
    // Store selected plan in sessionStorage
    sessionStorage.setItem('selectedPlan', JSON.stringify({
      id: plan.id,
      name: plan.name,
      limits: plan.limits
    }))
    
    if (isSignedIn) {
      // If already signed in, go to plan setup/onboarding
      router.push('/onboarding')
    } else {
      // Redirect to sign-up for new users
      router.push('/sign-up')
    }
  }

  const handleSignIn = () => {
    router.push('/sign-in')
  }

  const handleSignUp = () => {
    router.push('/sign-up')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-[#0F0F0F] dark:via-[#0F0F0F] dark:to-[#0F0F0F]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                {theme === "dark" ? (
                  <img src="/plauging-ai-dark.png" alt="Logo" className="w-8 h-8" />
                ) : (
                  <img src="/plauging-ai-light.png" alt="Logo" className="w-8 h-8" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-[#EDEDED]">
                  GTM Intelligence
                </h1>
                <p className="text-xs text-gray-600 dark:text-[#9CA3AF]">
                  Powered by Plugging AI
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isSignedIn ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#006239] hover:bg-[#25a843] rounded-lg transition-all duration-300"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/sign-in')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#EDEDED] hover:text-[#006239] transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/sign-up')}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#006239] hover:bg-[#25a843] rounded-lg transition-all duration-300"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#006239]/10 dark:bg-[#006239]/20 text-[#006239] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered GTM Intelligence Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-[#EDEDED] tracking-tight mb-6">
              Find Your Ideal
              <span className="block text-[#006239]">Customers with AI</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-[#9CA3AF] max-w-2xl mx-auto mb-10">
              Discover, analyze, and connect with companies that perfectly match your 
              ideal customer profile using advanced AI algorithms and real-time data.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => router.push('/sign-up')}
                className="px-8 py-4 text-lg font-semibold text-white bg-[#006239] hover:bg-[#25a843] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 text-lg font-semibold text-gray-700 dark:text-[#EDEDED] bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl hover:border-[#006239] transition-all duration-300"
              >
                View Pricing
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl"
              >
                <div className="text-3xl font-bold text-[#006239] mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-[#9CA3AF]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-[#0F0F0F] border-y border-gray-200 dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-[#EDEDED] mb-4">
              Everything you need to find leads
            </h2>
            <p className="text-lg text-gray-600 dark:text-[#9CA3AF] max-w-2xl mx-auto">
              Our platform combines AI intelligence with comprehensive company data 
              to help you identify and engage with your ideal customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-[#006239]/10 dark:bg-[#006239]/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#006239]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED] mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-[#9CA3AF]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-[#EDEDED] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-[#9CA3AF] max-w-2xl mx-auto">
              Choose the plan that best fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative p-8 bg-white dark:bg-[#1A1A1A] border rounded-2xl transition-all duration-300 hover:shadow-xl",
                  plan.popular 
                    ? "border-[#006239] shadow-lg scale-105" 
                    : "border-gray-200 dark:border-[#2A2A2A]"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 text-sm font-semibold text-white bg-[#006239] rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-[#006239]/10 dark:bg-[#006239]/20 flex items-center justify-center mb-4">
                    <plan.icon className="w-6 h-6 text-[#006239]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED]">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-[#9CA3AF] mt-2">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900 dark:text-[#EDEDED]">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-[#9CA3AF]">{plan.period}</span>
                </div>

                {/* Limits */}
                <div className="space-y-3 mb-8 pb-8 border-b border-gray-200 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#006239]" />
                    <span className="text-gray-700 dark:text-[#EDEDED]">
                      <strong>{plan.limits.members}</strong> team member{plan.limits.members !== 1 && 's'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-[#006239]" />
                    <span className="text-gray-700 dark:text-[#EDEDED]">
                      <strong>{plan.limits.projects}</strong> project{typeof plan.limits.projects === 'number' && plan.limits.projects !== 1 && 's'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-[#006239]" />
                    <span className="text-gray-700 dark:text-[#EDEDED]">
                      <strong>{plan.limits.searches}</strong> searches/month
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.limits.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#006239] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-[#EDEDED]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={cn(
                    "w-full py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
                    plan.popular
                      ? "text-white bg-[#006239] hover:bg-[#25a843] shadow-lg"
                      : "text-[#006239] bg-[#006239]/10 hover:bg-[#006239]/20"
                  )}
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#006239]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to find your ideal customers?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of sales and marketing teams who use GTM Intelligence 
            to discover high-quality leads and accelerate their growth.
          </p>
          <button
            onClick={() => router.push('/sign-up')}
            className="px-8 py-4 text-lg font-semibold text-[#006239] bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <Rocket className="w-5 h-5" />
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-white dark:bg-[#0F0F0F] border-t border-gray-200 dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                {theme === "dark" ? (
                  <img src="/plauging-ai-dark.png" alt="Logo" className="w-6 h-6" />
                ) : (
                  <img src="/plauging-ai-light.png" alt="Logo" className="w-6 h-6" />
                )}
              </div>
              <span className="font-semibold text-gray-900 dark:text-[#EDEDED]">
                GTM Intelligence
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-[#9CA3AF]">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Trusted by leading investment teams worldwide</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">
              © {new Date().getFullYear()} Plugging AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

