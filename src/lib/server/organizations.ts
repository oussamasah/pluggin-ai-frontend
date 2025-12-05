import { clerkClient } from '@clerk/nextjs/server'
import { ORG_PLANS } from '@/lib/constants'
import { OrgPlanId, OrganizationPlanSummary } from '@/types/organization'

export function resolvePlan(planKey?: unknown): OrgPlanId {
  if (typeof planKey === 'string' && planKey in ORG_PLANS) {
    return planKey as OrgPlanId
  }
  return 'starter'
}

function buildSummary(args: {
  organizationId: string
  organizationName: string
  plan: OrgPlanId
  memberCount: number
  pendingInvites: number
}): OrganizationPlanSummary {
  const { organizationId, organizationName, plan, memberCount, pendingInvites } = args
  const planDefinition = ORG_PLANS[plan]
  const seatsRemaining = Math.max(planDefinition.limits.maxSeats - memberCount, 0)

  return {
    organizationId,
    organizationName,
    plan,
    limits: planDefinition.limits,
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
  const plan = resolvePlan(organization.publicMetadata?.plan)

  return buildSummary({
    organizationId: organization.id,
    organizationName: organization.name,
    plan,
    memberCount,
    pendingInvites,
  })
}
