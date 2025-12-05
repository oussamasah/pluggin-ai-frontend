'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOrganization, useOrganizationList } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Loader2, MailPlus, ShieldCheck, Users } from 'lucide-react'
import { ORG_PLANS } from '@/lib/constants'
import type { OrgPlanId, OrganizationPlanSummary } from '@/types/organization'
import { cn } from '@/lib/utils'

const ROLE_OPTIONS = [
  { label: 'Workspace admin', value: 'admin' },
  { label: 'Contributor', value: 'basic_member' },
]

export function OrganizationManager() {
  const { organization } = useOrganization()
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { limit: 10 },
  })

  const [selectedPlan, setSelectedPlan] = useState<OrgPlanId>('starter')
  const [orgName, setOrgName] = useState('')
  const [slug, setSlug] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('basic_member')
  const [isInviting, setIsInviting] = useState(false)
  const [isAssigningPlan, setIsAssigningPlan] = useState(false)

  const [planSummary, setPlanSummary] = useState<OrganizationPlanSummary | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)

  const activeOrganizationId = organization?.id ?? null

  const refreshPlanSummary = useCallback(async () => {
    if (!activeOrganizationId) {
      setPlanSummary(null)
      return
    }

    try {
      setIsSummaryLoading(true)
      const response = await fetch(`/api/organizations/${activeOrganizationId}`)
      if (!response.ok) {
        const message = (await response.json().catch(() => ({}))).error || 'Unable to load limits'
        throw new Error(message)
      }
      const payload = await response.json()
      setPlanSummary(payload.organization)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load organization limits')
    } finally {
      setIsSummaryLoading(false)
    }
  }, [activeOrganizationId])

  useEffect(() => {
    refreshPlanSummary()
  }, [refreshPlanSummary])

  const handleCreateOrganization = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!orgName.trim()) {
      toast.error('Please provide a workspace name')
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: orgName.trim(),
          slug: slug.trim() || undefined,
          plan: selectedPlan,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to create organization')
      }

      toast.success('Workspace created. Select it from the switcher to start collaborating.')
      setOrgName('')
      setSlug('')

      if (payload.organization?.organizationId && setActive) {
        await setActive({ organization: payload.organization.organizationId })
        await refreshPlanSummary()
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeOrganizationId) {
      toast.error('Select an active organization first')
      return
    }
    if (!inviteEmail.trim()) {
      toast.error('Enter an email address')
      return
    }

    try {
      setIsInviting(true)
      const response = await fetch(`/api/organizations/${activeOrganizationId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to send invite')
      }

      toast.success('Invitation sent')
      setInviteEmail('')
      await refreshPlanSummary()
    } catch (error: any) {
      toast.error(error.message || 'Unable to send invite')
    } finally {
      setIsInviting(false)
    }
  }

  const handleAssignPlan = async () => {
    if (!activeOrganizationId) {
      toast.error('Select an active workspace first')
      return
    }

    try {
      setIsAssigningPlan(true)
      const response = await fetch(`/api/organizations/${activeOrganizationId}/plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to update plan')
      }

      toast.success(`${ORG_PLANS[selectedPlan].label} plan applied to your workspace`)
      await refreshPlanSummary()
    } catch (error: any) {
      toast.error(error.message || 'Unable to update plan')
    } finally {
      setIsAssigningPlan(false)
    }
  }

  const activePlanDefinition = useMemo(() => {
    if (planSummary) {
      return ORG_PLANS[planSummary.plan]
    }
    return null
  }, [planSummary])

  const seatsUsed = planSummary ? planSummary.memberCount + planSummary.pendingInvites : 0
  const seatsTotal = planSummary ? planSummary.limits.maxSeats : ORG_PLANS[selectedPlan].limits.maxSeats
  const planNeedsAssignment = !!planSummary && !planSummary.planAssigned

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-[#2A2A2A] dark:bg-[#111]/80">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Active organization</p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {organization?.name || 'No workspace selected'}
              </h2>
            </div>
            <ShieldCheck className="h-10 w-10 text-emerald-500" />
          </div>
          {organization && (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Plan</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {planSummary
                    ? planSummary.planAssigned
                      ? activePlanDefinition?.label
                      : `${activePlanDefinition?.label} (unassigned)`
                    : 'Not set'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Slug</dt>
                <dd className="font-mono text-gray-900 dark:text-white">{organization.slug}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Seats used</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {isSummaryLoading ? 'Loading…' : `${seatsUsed}/${seatsTotal}`}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Pending invites</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {planSummary?.pendingInvites ?? '—'}
                </dd>
              </div>
            </dl>
          )}
          {planSummary && !planSummary.planAssigned && (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-100">
              <p>This workspace was created without selecting a GTM plan. Clerk caps it at 1 member until a plan is assigned.</p>
              <p className="mt-1 text-xs">Pick a plan below and click &ldquo;Assign plan to active workspace&rdquo; to unlock the correct limits.</p>
            </div>
          )}
          {!organization && (
            <p className="text-sm text-gray-500 mt-4">
              Use the switcher on the left to activate an organization or create a new workspace below.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-[#2A2A2A] dark:bg-[#111]/80">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Seat usage</p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Workspace limits</h2>
            </div>
            <Users className="h-10 w-10 text-sky-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Seats</span>
                <span>
                  {seatsUsed}/{seatsTotal}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 transition-all"
                  style={{
                    width: `${Math.min((seatsUsed / Math.max(seatsTotal, 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400">
              {(activePlanDefinition?.features || ORG_PLANS[selectedPlan].features).map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-[#2A2A2A] dark:bg-[#0f0f0f]/90">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Workspace plans</p>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Create a new organization</h3>
          <p className="text-sm text-gray-500">
            Plans map to the limits we enforce through Clerk metadata. Choose the level that matches your GTM team.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.values(ORG_PLANS).map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                'rounded-2xl border p-4 text-left transition shadow-sm',
                selectedPlan === plan.id
                  ? 'border-[#006239] bg-emerald-50/60 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-[#2A2A2A]'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{plan.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}</p>
                </div>
                <input
                  type="radio"
                  checked={selectedPlan === plan.id}
                  readOnly
                  className="h-4 w-4 accent-[#006239]"
                />
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
              <div className="mt-4 text-xs text-gray-500">
                Seats: <span className="font-semibold text-gray-900 dark:text-white">{plan.limits.maxSeats}</span>
              </div>
            </button>
          ))}
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={handleCreateOrganization}>
          <label className="md:col-span-1">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500">Workspace name</span>
            <input
              type="text"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-[#006239] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#0F0F0F]"
              placeholder="Ex: Plugging AI GTM"
            />
          </label>
          <label className="md:col-span-1">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500">Custom slug (optional)</span>
            <input
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-[#006239] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#0F0F0F]"
              placeholder="plugging-ai"
            />
          </label>
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full rounded-2xl bg-[#006239] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/30 transition hover:bg-[#034427] disabled:opacity-60"
            >
              {isCreating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create workspace'
              )}
            </button>
          </div>
        </form>
        {activeOrganizationId && (
          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
            <button
              type="button"
              onClick={handleAssignPlan}
              disabled={isAssigningPlan}
              className={cn(
                'rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-wide transition',
                'border-[#006239] text-[#006239] hover:bg-emerald-50 disabled:opacity-60 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/20'
              )}
            >
              {isAssigningPlan
                ? 'Applying plan...'
                : planNeedsAssignment
                  ? 'Assign plan to active workspace'
                  : 'Update plan for active workspace'}
            </button>
            {planNeedsAssignment && (
              <p className="text-xs text-amber-600 dark:text-amber-300">
                Assigning a plan raises Clerk&rsquo;s default seat cap from 1 to your selected limit.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-[#2A2A2A] dark:bg-[#0f0f0f]/90">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Invite teammates</p>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Send Clerk invitations</h3>
            <p className="text-sm text-gray-500">
              Invitations respect the per-plan seat limits enforced on the server. Pending invites count toward
              available seats.
            </p>
          </div>
          <MailPlus className="h-10 w-10 text-indigo-500" />
        </div>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleInvite}>
          <label className="md:col-span-1">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500">Email address</span>
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-[#006239] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#0F0F0F]"
              placeholder="partner@company.com"
              disabled={!activeOrganizationId}
            />
          </label>
          <label className="md:col-span-1">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500">Role</span>
            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-[#006239] focus:outline-none dark:border-[#2A2A2A] dark:bg-[#0F0F0F]"
              disabled={!activeOrganizationId}
            >
              {ROLE_OPTIONS.map((role) => (
                <option value={role.value} key={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={!activeOrganizationId || isInviting}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-900 shadow-sm transition hover:border-gray-300 disabled:opacity-50 dark:border-[#2A2A2A] dark:bg-[#0F0F0F] dark:text-white"
            >
              {isInviting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send invite'
              )}
            </button>
          </div>
        </form>
        {!activeOrganizationId && (
          <p className="mt-4 text-sm text-amber-600">
            Activate a workspace with the organization switcher before inviting collaborators.
          </p>
        )}
      </section>

      {isLoaded && userMemberships?.data && userMemberships.data.length > 0 && (
        <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-[#2A2A2A] dark:bg-[#111]/80">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            Your organizations
          </h3>
          <div className="divide-y divide-gray-200 text-sm dark:divide-[#1f1f1f]">
            {userMemberships.data.map((membership) => (
              <div
                key={membership.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{membership.organization.name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{membership.role}</p>
                </div>
                <button
                  onClick={() => setActive?.({ organization: membership.organization.id })}
                  className="rounded-full border border-gray-200 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-900 transition hover:border-gray-300 dark:border-[#2A2A2A] dark:text-white"
                >
                  Switch
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
