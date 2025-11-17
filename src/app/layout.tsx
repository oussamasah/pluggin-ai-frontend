// app/layout.tsx
import { SessionProvider } from '@/context/SessionContext'
import { EnhancedSidebar } from '@/components/EnhancedSidebar'
import { Toaster } from 'sonner'
import './globals.css'
import { BackendHealthCheck } from '@/components/BackendHealthCheck'

import { ThemeProvider } from '@/context/ThemeContext'
export const metadata = {
  title: 'ICP Scout - AI-Powered Company Discovery',
  description: 'Find your ideal customers with AI-powered search and ICP matching',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
    
        <SessionProvider>
        <ThemeProvider>
          <div className="flex h-full">
            <div className=" relative bg-white dark:bg-[#0F0F0F]">
            <EnhancedSidebar />
            </div>
            <main className="ml-64 md:ml-80  w-full">

              {children}
            </main>
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'bg-white border border-gray-200 shadow-lg',
            }}
          />
        </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}