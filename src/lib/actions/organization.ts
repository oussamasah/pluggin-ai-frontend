'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

interface PlanData {
  id: string
  name: string
  limits: {
    members: number | string
    projects: number | string
    searches: number | string
    features: string[]
  }
}

// Update user's plan metadata (for Solo plan)
export async function updateUserPlan(planData: PlanData, id: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const client = await clerkClient()
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      plan: {
        ...planData,
        activatedAt: new Date().toISOString()
      }
    }
  })

  return { success: true }
}

// Update organization's plan metadata
export async function updateOrganizationPlan(
  organizationId: string,
  planData: PlanData
) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const client = await clerkClient()
  
  await client.organizations.updateOrganization(organizationId, {
    publicMetadata: {
      plan: {
        ...planData,
        activatedAt: new Date().toISOString()
      }
    }
  })

  return { success: true }
}

// Create organization with plan (for Pro/Business plans)
export async function createOrganizationWithPlan(name: string, planData: PlanData, id: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const client = await clerkClient()
  
  // Create organization
  const organization = await client.organizations.createOrganization({
    name,
    createdBy: userId,
    publicMetadata: {
      plan: {
        ...planData,
        activatedAt: new Date().toISOString()
      }
    }
  })

  return { 
    success: true, 
    organizationId: organization.id 
  }
}

// Get organization members
export async function getOrganizationMembers(organizationId: string) {
  const { userId, orgId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  if (orgId !== organizationId) {
    throw new Error('Unauthorized - Not a member of this organization')
  }

  const client = await clerkClient()
  
  const members = await client.organizations.getOrganizationMembershipList({
    organizationId
  })

  return members
}

// Send organization invitation
export async function sendOrganizationInvitation(
  organizationId: string,
  emailAddress: string,
  role: 'admin' | 'member' = 'member'
) {
  const { userId, orgId, orgRole } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  if (orgId !== organizationId) {
    throw new Error('Unauthorized - Not a member of this organization')
  }

  // Only admins can send invitations
  if (orgRole !== 'org:admin') {
    throw new Error('Unauthorized - Only admins can invite members')
  }

  const client = await clerkClient()

  // Check organization's member limit
  const organization = await client.organizations.getOrganization({
    organizationId
  })

  const planData = organization.publicMetadata?.plan as PlanData | undefined
  const memberLimit = planData?.limits?.members

  if (memberLimit && memberLimit !== 'Unlimited') {
    const members = await client.organizations.getOrganizationMembershipList({
      organizationId
    })

    const pendingInvitations = await client.organizations.getOrganizationInvitationList({
      organizationId,
      status: ['pending']
    })

    const totalCount = (members.totalCount || 0) + (pendingInvitations.totalCount || 0)

    if (totalCount >= (memberLimit as number)) {
      throw new Error('Member limit reached. Please upgrade your plan.')
    }
  }
  const host = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

  const invitation = await client.organizations.createOrganizationInvitation({
    organizationId,
    emailAddress,
    role: role === 'admin' ? 'org:admin' : 'org:member',
    inviterUserId: userId,
    redirectUrl: `${host}/dashboard`
  })

  return { 
    success: true, 
    invitationId: invitation.id 
  }
}

// Revoke organization invitation
export async function revokeOrganizationInvitation(
  organizationId: string,
  invitationId: string
) {
  const { userId, orgId, orgRole } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  if (orgId !== organizationId) {
    throw new Error('Unauthorized - Not a member of this organization')
  }

  if (orgRole !== 'org:admin') {
    throw new Error('Unauthorized - Only admins can revoke invitations')
  }

  const client = await clerkClient()

  await client.organizations.revokeOrganizationInvitation({
    organizationId,
    invitationId,
    requestingUserId: userId
  })

  return { success: true }
}

// Get pending invitations
export async function getOrganizationInvitations(organizationId: string) {
  const { userId, orgId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  if (orgId !== organizationId) {
    throw new Error('Unauthorized - Not a member of this organization')
  }

  const client = await clerkClient()

  const invitations = await client.organizations.getOrganizationInvitationList({
    organizationId,
    status: ['pending']
  })

  return invitations
}

// Update member role
export async function updateMemberRole(
  organizationId: string,
  userId: string,
  newRole: 'admin' | 'member'
) {
  const { userId: currentUserId, orgId, orgRole } = await auth()
  
  if (!currentUserId) {
    throw new Error('Unauthorized')
  }

  if (orgId !== organizationId) {
    throw new Error('Unauthorized - Not a member of this organization')
  }

  if (orgRole !== 'org:admin') {
    throw new Error('Unauthorized - Only admins can update roles')
  }

  // Prevent self-demotion
  if (currentUserId === userId && newRole !== 'admin') {
    throw new Error('Cannot demote yourself')
  }

  const client = await clerkClient()

  await client.organizations.updateOrganizationMembership({
    organizationId,
    userId,
    role: newRole === 'admin' ? 'org:admin' : 'org:member'
  })

  return { success: true }
}

// Remove member from organization
// Remove member from organization
export async function removeMember(
    organizationId: string,
    memberUserId: string
  ) {
    const { userId: currentUserId, orgId, orgRole } = await auth()
    
    if (!currentUserId) {
      throw new Error('Unauthorized')
    }
  
    if (orgId !== organizationId) {
      throw new Error('Unauthorized - Not a member of this organization')
    }
  
    if (orgRole !== 'org:admin') {
      throw new Error('Unauthorized - Only admins can remove members')
    }
  
    // Prevent self-removal
    if (currentUserId === memberUserId) {
      throw new Error('Cannot remove yourself. Use leave organization instead.')
    }
  
    const client = await clerkClient()
  
    // ✅ CORRECT METHOD: Use the membership list to find and delete
    try {
      const memberships = await client.organizations.getOrganizationMembershipList({
        organizationId
      })
  
      // Find the specific membership
      const membership = memberships.data.find(
        m => m.publicUserData?.userId === memberUserId
      )
  
      if (!membership) {
        throw new Error('Member not found in organization')
      }
  
      // Delete using the membership ID
      await client.organizations.deleteOrganizationMembership({
        organizationId,
        userId: memberUserId
      })
  
      return { success: true }
    } catch (error) {
      console.error('Error removing member:', error)
      throw error
    }
  }

// Get current user's organization info
export async function getCurrentOrganization() {
  const { userId, orgId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  if (!orgId) {
    return null
  }

  const client = await clerkClient()

  const organization = await client.organizations.getOrganization({
    organizationId: orgId
  })

  return organization
}

// Get user's plan info (either from user metadata or organization)
export async function getCurrentPlan() {
  const { userId, orgId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const client = await clerkClient()

  if (orgId) {
    // User is in an organization, get org plan
    const organization = await client.organizations.getOrganization({
      organizationId: orgId
    })
    return organization.publicMetadata?.plan as PlanData | undefined
  } else {
    // Personal account, get user plan
    const user = await client.users.getUser(userId)
    return user.publicMetadata?.plan as PlanData | undefined
  }
}
