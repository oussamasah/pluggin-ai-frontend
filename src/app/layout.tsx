// app/layout.tsx
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-[#0F0F0F] dark:via-[#0F0F0F] dark:to-[#0F0F0F]">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#006239',
              colorTextOnPrimaryBackground: '#ffffff',
            },
          }}
        >
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] shadow-lg text-gray-900 dark:text-[#EDEDED]',
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  )
}
