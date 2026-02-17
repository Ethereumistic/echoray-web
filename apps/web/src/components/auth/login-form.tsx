'use client'

import { cn } from "@echoray/ui/lib/utils"
import { useAuthActions } from "@convex-dev/auth/react"
import { Button } from '@echoray/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@echoray/ui/components/ui/card'
import { Input } from '@echoray/ui/components/ui/input'
import { Label } from '@echoray/ui/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { AnimatePresence, motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuthActions()

  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      const redirectTo = searchParams.get('redirectTo')
      const safeRedirect = (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('/auth'))
        ? redirectTo
        : '/dashboard'
      router.push(safeRedirect)
    }
  }, [isAuthenticated, isAuthLoading, router, searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await signIn("password", {
        email,
        password,
        flow: "signIn",
      })

      // If successful, the redirect in useEffect will handle it, or we handle it here
      const redirectTo = searchParams.get('redirectTo')
      const safeRedirect = (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('/auth'))
        ? redirectTo
        : '/dashboard'

      router.push(safeRedirect)
    } catch (error: unknown) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-primary/10 bg-background/60 backdrop-blur-xl shadow-2xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">Login</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="ml-auto inline-block text-sm text-primary hover:underline underline-offset-4 font-medium"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                  </div>
                  <Link href="/auth/sign-up" className="flex items-center justify-center gap-2 text-primary hover:underline underline-offset-4 font-medium">
                    <LogIn className="size-4" /> Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
