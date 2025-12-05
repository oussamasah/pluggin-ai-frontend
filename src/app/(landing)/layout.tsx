// app/(landing)/layout.tsx
// Landing page layout - public, no sidebar
import { ThemeProvider } from '@/context/ThemeContext'

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-[#0F0F0F] dark:via-[#0F0F0F] dark:to-[#0F0F0F]">
        {children}
      </div>
    </ThemeProvider>
  )
}
