import { clerkClient } from '@clerk/nextjs/server'
import { ORG_PLANS } from '@/lib/constants'
import { OrgPlanId, OrganizationPlanSummary } from '@/types/organization'

export function resolvePlan(planKey?: unknown): { plan: OrgPlanId; isFallback: boolean } {
  if (typeof planKey === 'string' && planKey in ORG_PLANS) {
    return { plan: planKey as OrgPlanId, isFallback: false }
  }
  return { plan: 'starter', isFallback: true }
}

function buildSummary(args: {
  organizationId: string
  organizationName: string
  plan: OrgPlanId
  planAssigned: boolean
  memberCount: number
  pendingInvites: number
  maxSeatsOverride?: number | null
}): OrganizationPlanSummary {
  const { organizationId, organizationName, plan, planAssigned, memberCount, pendingInvites, maxSeatsOverride } = args
  const planDefinition = ORG_PLANS[plan]
  const effectiveMaxSeats = maxSeatsOverride ?? planDefinition.limits.maxSeats
  const limits = {
    ...planDefinition.limits,
    maxSeats: effectiveMaxSeats,
  }
  const seatsRemaining = Math.max(effectiveMaxSeats - memberCount, 0)

  return {
    organizationId,
    organizationName,
    plan,
    planAssigned,
    limits,
    memberCount,
    pendingInvites,
    seatsRemaining,
    invitesRemaining: seatsRemaining,
    lastSyncedAt: new Date().toISOString(),
  }
}

export async function fetchPlanSummary(organizationId: string) {
  const [organization, memberships, invitations] = await Promise.all([
    clerkClient.organizations.getOrganization({ organizationId }),
    clerkClient.organizations.getOrganizationMembershipList({ organizationId, limit: 200 }),
    clerkClient.organizations.getOrganizationInvitationList({ organizationId, status: 'pending', limit: 200 }),
  ])

  const memberCount = memberships.totalCount ?? memberships.data.length
  const pendingInvites = invitations.totalCount ?? invitations.data.length
  const { plan, isFallback } = resolvePlan(organization.publicMetadata?.plan)

  return buildSummary({
    organizationId: organization.id,
    organizationName: organization.name,
    plan,
    planAssigned: !isFallback,
    memberCount,
    pendingInvites,
    maxSeatsOverride: organization.maxAllowedMemberships ?? undefined,
  })
}
