import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const adminAuthCookie = request.cookies.get('admin_auth')
  const isLoginPage = request.nextUrl.pathname.startsWith('/admin/login')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute && !isLoginPage && (!adminAuthCookie || adminAuthCookie.value !== 'authenticated')) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Redirect authenticated users away from the login page
  if (isLoginPage && adminAuthCookie?.value === 'authenticated') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
