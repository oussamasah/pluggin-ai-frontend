import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { fetchPlanSummary } from '@/lib/server/organizations'

interface Params {
  params: {
    organizationId: string
  }
}

const ADMIN_ROLES = new Set(['admin', 'owner'])

export async function POST(req: Request, { params }: Params) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const organizationId = params.organizationId

  try {
    const payload = await req.json()
    const { email, role = 'basic_member' }: { email?: string; role?: string } = payload

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const memberships = await clerkClient.users.getOrganizationMembershipList({ userId, limit: 100 })
    const membership = memberships.data.find((record) => record.organization.id === organizationId)

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!ADMIN_ROLES.has(membership.role)) {
      return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 })
    }

    const summary = await fetchPlanSummary(organizationId)
    const projectedSeats = summary.memberCount + summary.pendingInvites + 1

    if (projectedSeats > summary.limits.maxSeats) {
      return NextResponse.json(
        {
          error: `Invite would exceed seat limit (${summary.limits.maxSeats}) for the ${summary.plan} plan.`,
        },
        { status: 409 }
      )
    }

    const invitation = await clerkClient.organizations.createOrganizationInvitation({
      organizationId,
      emailAddress: email,
      inviterUserId: userId,
      role,
    })

    const organization = await fetchPlanSummary(organizationId)

    return NextResponse.json(
      {
        invitationId: invitation.id,
        organization,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to send organization invitation', error)
    return NextResponse.json({ error: 'Unable to send invite' }, { status: 500 })
  }
}
