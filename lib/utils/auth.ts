import { auth } from "@/auth"
import { redirect } from "next/navigation"

/**
 * Get the current session or redirect to auth page
 */
export async function getSessionOrRedirect() {
  const session = await auth()
  
  if (!session) {
    redirect("/auth")
  }
  
  return session
}

/**
 * Get the current user ID from session
 */
export async function getCurrentUserId() {
  const session = await auth()
  return session?.user?.id
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await auth()
  return !!session
}