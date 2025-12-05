import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { fetchPlanSummary } from '@/lib/server/organizations'

interface Params {
  params: {
    organizationId: string
  }
}

export async function GET(_: Request, { params }: Params) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const organizationId = params.organizationId

  try {
    const memberships = await clerkClient.users.getOrganizationMembershipList({ userId, limit: 100 })
    const isMember = memberships.data.some((membership) => membership.organization.id === organizationId)

    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const organization = await fetchPlanSummary(organizationId)
    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Failed to fetch organization summary', error)
    return NextResponse.json({ error: 'Unable to load organization' }, { status: 500 })
  }
}
