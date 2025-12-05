import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { ORG_PLANS } from '@/lib/constants'
import { OrgPlanId } from '@/types/organization'
import { toSlug } from '@/lib/utils'
import { fetchPlanSummary } from '@/lib/server/organizations'

export async function GET() {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const memberships = await clerkClient.users.getOrganizationMembershipList({
      userId,
      limit: 100,
    })

    const organizations = await Promise.all(
      memberships.data.map(async (membership) => fetchPlanSummary(membership.organization.id))
    )

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Failed to load organizations', error)
    return NextResponse.json({ error: 'Unable to fetch organizations' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()
    const { name, slug, plan }: { name?: string; slug?: string; plan?: OrgPlanId } = payload

    if (!name || !plan) {
      return NextResponse.json({ error: 'Missing name or plan' }, { status: 400 })
    }

    if (!(plan in ORG_PLANS)) {
      return NextResponse.json({ error: 'Unknown plan selection' }, { status: 400 })
    }

    const planDefinition = ORG_PLANS[plan]
    const candidateSlug = slug ? toSlug(slug) : toSlug(name)

    const organization = await clerkClient.organizations.createOrganization({
      name,
      slug: candidateSlug,
      createdBy: userId,
      maxAllowedMemberships: planDefinition.limits.maxSeats,
      publicMetadata: {
        plan,
        limits: planDefinition.limits,
        planLabel: planDefinition.label,
      },
    })

    const summary = await fetchPlanSummary(organization.id)

    return NextResponse.json({ organization: summary }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create organization', error)

    if (error?.errors?.length) {
      return NextResponse.json({ error: error.errors[0].message }, { status: error.status || 422 })
    }

    return NextResponse.json({ error: 'Unable to create organization' }, { status: 500 })
  }
}
