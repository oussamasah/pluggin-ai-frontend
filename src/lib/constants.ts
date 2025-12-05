// lib/constants.ts
import { OrgPlanDefinition, OrgPlanId } from '@/types/organization'

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://localhost:3001',
}

// Environment validation
if (typeof window !== 'undefined') {
  if (!API_CONFIG.BASE_URL) {
    console.warn('NEXT_PUBLIC_API_URL is not set, using default')
  }
}

export const ORG_PLANS: Record<OrgPlanId, OrgPlanDefinition> = {
  starter: {
    id: 'starter',
    label: 'Starter',
    price: '$0',
    description: 'Collaborate with a small team and validate your ICP.',
    limits: {
      maxSeats: 3,
      monthlySearches: 50,
      workflowsPerDay: 2,
      aiCredits: 2000,
    },
    features: [
      'Up to 3 workspace members',
      'Access to core ICP search',
      'Shared session history',
      'Basic AI enrichment',
    ],
  },
  growth: {
    id: 'growth',
    label: 'Growth',
    price: '$249',
    description: 'Unlock higher throughput and invite your GTM collaborators.',
    limits: {
      maxSeats: 10,
      monthlySearches: 250,
      workflowsPerDay: 10,
      aiCredits: 12000,
    },
    features: [
      'Up to 10 workspace members',
      'Priority workflow execution',
      'Custom ICP templates',
      'Slack + Webhook automations',
    ],
  },
  scale: {
    id: 'scale',
    label: 'Scale',
    price: 'Contact',
    description: 'Enterprise control with guaranteed throughput and limits.',
    limits: {
      maxSeats: 25,
      monthlySearches: 750,
      workflowsPerDay: 40,
      aiCredits: 50000,
    },
    features: [
      'Dedicated workspace concierge',
      'Unlimited saved sessions',
      'Custom roles and approvals',
      'Premium support SLA',
    ],
  },
}