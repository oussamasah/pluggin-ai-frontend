import { OrganizationManager } from '@/components/OrganizationManager'

export const metadata = {
  title: 'Organizations | ICP Scout',
  description: 'Create Clerk organizations, assign plans, and invite your GTM team.',
}

export default function OrganizationsPage() {
  return (
    <div className="p-6 md:p-10">
      <OrganizationManager />
    </div>
  )
}
