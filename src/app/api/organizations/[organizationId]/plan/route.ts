import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { ORG_PLANS } from '@/lib/constants'
import { OrgPlanId } from '@/types/organization'
import { fetchPlanSummary } from '@/lib/server/organizations'

const ADMIN_ROLES = new Set(['admin', 'owner'])

interface Params {
  params: {
    organizationId: string
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const organizationId = params.organizationId

  try {
    const payload = await req.json()
    const { plan }: { plan?: OrgPlanId } = payload

    if (!plan || !(plan in ORG_PLANS)) {
      return NextResponse.json({ error: 'Unknown plan selection' }, { status: 400 })
    }

    const memberships = await clerkClient.users.getOrganizationMembershipList({ userId, limit: 100 })
    const membership = memberships.data.find((item) => item.organization.id === organizationId)

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!ADMIN_ROLES.has(membership.role)) {
      return NextResponse.json({ error: 'Only admins can update plans' }, { status: 403 })
    }

    const organization = await clerkClient.organizations.getOrganization({ organizationId })
    const planDefinition = ORG_PLANS[plan]

    await clerkClient.organizations.updateOrganization(organizationId, {
      maxAllowedMemberships: planDefinition.limits.maxSeats,
      publicMetadata: {
        ...organization.publicMetadata,
        plan,
        planLabel: planDefinition.label,
        limits: planDefinition.limits,
      },
    })

    const summary = await fetchPlanSummary(organizationId)

    return NextResponse.json({ organization: summary })
  } catch (error) {
    console.error('Failed to update organization plan', error)
    return NextResponse.json({ error: 'Unable to update plan' }, { status: 500 })
  }
}
