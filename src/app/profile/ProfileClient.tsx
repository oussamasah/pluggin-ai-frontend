'use client'

import { UserProfile } from '@clerk/nextjs'

export default function ProfileClient() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-[#2A2A2A] dark:bg-[#0f0f0f]/90">
      <UserProfile
        routing="hash"
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-[#006239] text-white hover:bg-[#034427] focus:ring-[#006239] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0f0f0f]',
            card: 'bg-transparent shadow-none',
            headerTitle: 'text-gray-900 dark:text-white',
            headerSubtitle: 'text-gray-500 dark:text-gray-400',
            profileSectionTitleText: 'text-gray-900 dark:text-white',
            profileSectionTitle__danger:
              'text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40',
            navbar: 'bg-transparent border-b border-gray-100 dark:border-[#1f1f1f]',
            navbarButton:
              'text-gray-600 dark:text-gray-400 data-[active=true]:text-[#006239] data-[active=true]:border-b-2 data-[active=true]:border-[#006239]',
          },
        }}
      />
    </div>
  )
}
