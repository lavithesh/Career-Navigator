import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET

  // Get the pathname
  const path = request.nextUrl.pathname

  // Get the session token
  const token = await getToken({ req: request, secret })

  // For auth routes, if user is already logged in, redirect to home
  if (token && (path === '/auth/signin' || path === '/auth/error')) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  // For authenticated users, check if they need to be redirected to welcome page
  if (token) {
    try {
      // Check if user needs profile setup 
      // First, check if user has the isNewUser flag from NextAuth
      const isNewUser = token.isNewUser === true
      
      // Check if user is not on welcome page and needs to be redirected
      if (isNewUser && path !== '/welcome') {
        const welcomeUrl = new URL('/welcome', request.url)
        return NextResponse.redirect(welcomeUrl)
      }
    } catch (error) {
      console.error('Middleware error:', error)
    }
  }

  // Allow all requests to proceed without authentication
  return NextResponse.next()
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Only run middleware on routes that might need:
     * - New user redirection
     * - Auth page redirects when already logged in
     */
    '/welcome',
    '/auth/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
} 