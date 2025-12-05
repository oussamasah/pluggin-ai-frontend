// app/(dashboard)/layout.tsx
// Dashboard layout - includes sidebar for all protected routes
import { SessionProvider } from '@/context/SessionContext'
import { EnhancedSidebar } from '@/components/EnhancedSidebar'
import { ThemeProvider } from '@/context/ThemeContext'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect all dashboard routes
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <ThemeProvider>
      <SessionProvider>
        <div className="flex h-full min-h-screen">
          <div className="relative bg-white dark:bg-[#0F0F0F]">
            <EnhancedSidebar />
          </div>
          <main className="ml-64 md:ml-80 w-full min-h-screen bg-white dark:bg-[#0F0F0F]">
            {children}
          </main>
        </div>
      </SessionProvider>
    </ThemeProvider>
  )
}
