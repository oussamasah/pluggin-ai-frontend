import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/sign-in(.*)', '/sign-up(.*)'],
  ignoredRoutes: ['/api/webhooks(.*)'],
  signInUrl: '/sign-in',
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/'],
}
