// Import URL polyfill to fix URL.canParse error
import "@/lib/utils/url-polyfill";

import { NextResponse, NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const secret = process.env.NEXTAUTH_SECRET
if (!secret) {
  throw new Error("NEXTAUTH_SECRET is not set in environment variables")
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret })

  const isLoggedIn = !!token
  const isPublicRoute = pathname === "/auth" || pathname === "/"
  const isProtectedRoute =
    pathname.startsWith("/home") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/assistant")

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth", req.url))
  }

  if (pathname === "/auth" && isLoggedIn) {
    return NextResponse.redirect(new URL("/home", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}