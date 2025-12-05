'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 py-10 dark:from-[#050505] dark:via-[#0f0f0f] dark:to-[#050505]">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-[#006239] text-white hover:bg-[#034427] focus:ring-[#006239] focus:ring-offset-2 focus:ring-offset-white',
            footerActionLink: 'text-[#006239]',
          },
        }}
      />
    </div>
  )
}
