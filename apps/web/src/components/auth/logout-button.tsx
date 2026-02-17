'use client'

import { useAuthActions } from "@convex-dev/auth/react"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export function LogoutButton() {
  const router = useRouter()
  const { signOut: convexSignOut } = useAuthActions()
  const { signOut: clearStore } = useAuthStore()

  const logout = async () => {
    await convexSignOut()
    clearStore()
    router.push('/auth/login')
  }

  return <Button onClick={logout}>Logout</Button>
}
