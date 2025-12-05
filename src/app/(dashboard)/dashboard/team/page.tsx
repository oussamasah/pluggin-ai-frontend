'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser, useOrganization, useOrganizationList } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  Shield, 
  MoreVertical,
  X,
  AlertCircle,
  Building2,
  Trash2,
  Clock,
  Send,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export default function TeamPage() {
  const { user } = useUser()
  const { organization, isLoaded: isOrgLoaded, membership, memberships } = useOrganization({
    memberships: { infinite: true }
  })
  const { userMemberships, isLoaded: isMembershipsLoaded } = useOrganizationList({
    userMemberships: { infinite: true }
  })
 
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'basic_member'>('basic_member')
  const [isLoading, setIsLoading] = useState(false)
  const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null)
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])

  const isAdmin = membership?.role === 'org:admin'

  // Get plan from organization metadata
  const planData = organization?.publicMetadata as { 
    id: string
    name: string
    limits: { members: number | string }
  } | undefined

  const memberCount = memberships?.count || 0
  const memberLimit = planData?.limits?.members || 1
  console.log( organization?.publicMetadata)
  const canInviteMore = memberLimit === 'Unlimited' || memberCount < (memberLimit as number)

  // Load pending invitations
  useEffect(() => {
    const loadInvitations = async () => {
      if (organization && isAdmin) {
        try {
          const invites = await organization.getInvitations()
          console.log("invites")
          console.log(invites)
          setPendingInvitations(invites.data || [])
        } catch (error) {
          console.error('Failed to load invitations:', error)
        }
      }
    }
    loadInvitations()
  }, [organization, isAdmin])

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !organization) return
    
    setIsLoading(true)
    try {
      await organization.inviteMember({
        emailAddress: inviteEmail,
        role: inviteRole === 'admin' ? 'org:admin' : 'org:member'
      })
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setIsInviting(false)
      
      // Reload invitations
      const invites = await organization.getInvitations()
      setPendingInvitations(invites.data || [])
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || 'Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!organization) return
    
    try {
      const invitation = pendingInvitations.find(inv => inv.id === invitationId)
      if (invitation) {
        await invitation.revoke()
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId))
        toast.success('Invitation revoked')
      }
    } catch (error: any) {
      toast.error('Failed to revoke invitation')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!organization) return
    
    try {
      const member = memberships?.data?.find(m => m.id === memberId)
      if (member) {
        await member.destroy()
        toast.success('Member removed')
        setShowMemberMenu(null)
      }
    } catch (error: any) {
      toast.error('Failed to remove member')
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!organization) return
    
    try {
      const member = memberships?.data?.find(m => m.id === memberId)
      if (member) {
        await member.update({
          role: newRole === 'admin' ? 'org:admin' : 'org:member'
        })
        toast.success('Role updated')
        setShowMemberMenu(null)
      }
    } catch (error: any) {
      toast.error('Failed to update role')
    }
  }

  // Personal account (no organization)
  if (isOrgLoaded && !organization) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-[#0F0F0F]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED] mb-3">
            Personal Account
          </h2>
          <p className="text-gray-600 dark:text-[#9CA3AF] mb-6">
            You're currently on a Solo plan with a personal account. 
            Upgrade to a Pro or Business plan to create a team and invite members.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 text-white bg-[#006239] hover:bg-[#25a843] rounded-xl font-medium transition-all duration-300"
          >
            View Upgrade Options
          </button>
        </div>
      </div>
    )
  }

  if (!isOrgLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-[#0F0F0F]">
        <RefreshCw className="w-6 h-6 text-[#006239] animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 bg-white dark:bg-[#0F0F0F] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#006239]/10 dark:bg-[#006239]/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#006239]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED]">
                {organization?.name || 'Team'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">
                Manage your team members and invitations
              </p>
            </div>
          </div>
        </div>

        {/* Plan Info Card */}
        <div className={cn(
          "p-6 rounded-2xl border mb-8",
          "bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-[#9CA3AF] mb-1">Current Plan</p>
              <p className="text-xl font-bold text-gray-900 dark:text-[#EDEDED] flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#006239]" />
                {planData?.name || 'Team Plan'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-[#9CA3AF] mb-1">Team Members</p>
              <p className="text-xl font-bold text-gray-900 dark:text-[#EDEDED]">
                {memberCount} / {memberLimit === 'Unlimited' ? '∞' : memberLimit}
              </p>
            </div>
          </div>
        </div>

        {/* Invite Section */}
        {isAdmin && (
          <div className="mb-8">
            {!isInviting ? (
              <button
                onClick={() => setIsInviting(true)}
                disabled={!canInviteMore}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
                  canInviteMore
                    ? "text-white bg-[#006239] hover:bg-[#25a843]"
                    : "text-gray-400 bg-gray-200 dark:bg-[#2A2A2A] cursor-not-allowed"
                )}
              >
                <UserPlus className="w-5 h-5" />
                Invite Member
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-6 rounded-2xl border",
                  "bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED]">
                    Invite Team Member
                  </h3>
                  <button
                    onClick={() => setIsInviting(false)}
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#EDEDED] mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className={cn(
                          "w-full pl-11 pr-4 py-3 rounded-xl border text-gray-900 dark:text-[#EDEDED]",
                          "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]",
                          "focus:ring-2 focus:ring-[#006239] focus:border-transparent outline-none"
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#EDEDED] mb-2">
                      Role
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setInviteRole('basic_member')}
                        className={cn(
                          "flex-1 p-3 rounded-xl border transition-all duration-200",
                          inviteRole === 'basic_member'
                            ? "border-[#006239] bg-[#006239]/10"
                            : "border-gray-200 dark:border-[#2A2A2A] hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-[#006239]" />
                          <span className="font-medium text-gray-900 dark:text-[#EDEDED]">Member</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-[#9CA3AF] mt-1 text-left">
                          Can view and use platform features
                        </p>
                      </button>
                      <button
                        onClick={() => setInviteRole('admin')}
                        className={cn(
                          "flex-1 p-3 rounded-xl border transition-all duration-200",
                          inviteRole === 'admin'
                            ? "border-[#006239] bg-[#006239]/10"
                            : "border-gray-200 dark:border-[#2A2A2A] hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-[#006239]" />
                          <span className="font-medium text-gray-900 dark:text-[#EDEDED]">Admin</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-[#9CA3AF] mt-1 text-left">
                          Full access including team management
                        </p>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim() || isLoading}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300",
                      inviteEmail.trim() && !isLoading
                        ? "text-white bg-[#006239] hover:bg-[#25a843]"
                        : "text-gray-400 bg-gray-200 dark:bg-[#2A2A2A] cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {!canInviteMore && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                You've reached the member limit for your plan. Upgrade to invite more members.
              </p>
            )}
          </div>
        )}

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#006239]" />
              Pending Invitations
            </h2>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                invitation.status == "pending" && (
                <div
                  key={invitation.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border",
                    "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-[#EDEDED]">
                        {invitation.emailAddress}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">
                        {invitation.role === 'org:admin' ? 'Admin' : 'Member'} • Pending
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleRevokeInvitation(invitation.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Team Members */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#006239]" />
            Team Members
          </h2>
          <div className="space-y-3">
            {memberships?.data?.map((member) => {
              const isCurrentUser = member.publicUserData?.userId === user?.id
              const memberRole = member.role === 'org:admin' ? 'Admin' : 'Member'
              
              return (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                    "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]",
                    "hover:border-gray-300 dark:hover:border-[#3A3A3A]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {member.publicUserData?.imageUrl ? (
                      <img 
                        src={member.publicUserData.imageUrl} 
                        alt="" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#006239] flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {member.publicUserData?.firstName?.[0] || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-[#EDEDED] flex items-center gap-2">
                        {member.publicUserData?.firstName} {member.publicUserData?.lastName}
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#006239]/10 text-[#006239]">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-[#9CA3AF] flex items-center gap-2">
                        {member.publicUserData?.identifier}
                        <span className="text-gray-300 dark:text-[#3A3A3A]">•</span>
                        <span className={cn(
                          "flex items-center gap-1",
                          member.role === 'org:admin' && "text-[#006239]"
                        )}>
                          {member.role === 'org:admin' ? (
                            <Crown className="w-3 h-3" />
                          ) : (
                            <Users className="w-3 h-3" />
                          )}
                          {memberRole}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {isAdmin && !isCurrentUser && (
                    <div className="relative">
                      <button
                        onClick={() => setShowMemberMenu(showMemberMenu === member.id ? null : member.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                      
                      <AnimatePresence>
                        {showMemberMenu === member.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              "absolute right-0 top-full mt-1 w-48 p-2 rounded-xl shadow-xl border z-50",
                              "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
                            )}
                          >
                            <button
                              onClick={() => handleUpdateRole(
                                member.id, 
                                member.role === 'org:admin' ? 'member' : 'admin'
                              )}
                              className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-gray-700 dark:text-[#EDEDED] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                            >
                              <Shield className="w-4 h-4" />
                              {member.role === 'org:admin' ? 'Make Member' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove Member
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
