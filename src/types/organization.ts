export type OrgPlanId = 'starter' | 'growth' | 'scale'

export interface OrgPlanLimits {
  maxSeats: number
  monthlySearches: number
  workflowsPerDay: number
  aiCredits: number
}

export interface OrgPlanDefinition {
  id: OrgPlanId
  label: string
  price: string
  description: string
  limits: OrgPlanLimits
  features: string[]
}

export interface OrganizationPlanSummary {
  organizationId: string
  organizationName: string
  plan: OrgPlanId
  planAssigned: boolean
  limits: OrgPlanLimits
  memberCount: number
  pendingInvites: number
  seatsRemaining: number
  invitesRemaining: number
  lastSyncedAt: string
}
