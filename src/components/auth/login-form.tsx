'use client'

import { cn } from '@/lib/utils'
import { useAuthActions } from "@convex-dev/auth/react"
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OTPInput } from '@/components/ui/otp-input'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { AnimatePresence, motion } from 'framer-motion'
import { LogIn } from 'lucide-react'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'login' | { email: string }>('login')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuthActions()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("password", {
        email,
        password,
        flow: "signIn",
      })

      // If result is returned, it means sign-in is pending verification
      if (result) {
        setStep({ email })
        toast.info('Verification required. We\'ve sent a code previously, or a new one just now if yours expired.')
        return
      }

      // If result is truthy, redirect to dashboard or intended destination
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

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (code.length !== 6) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('email', typeof step === 'object' ? step.email : email)
      formData.append('code', code)
      formData.append('flow', 'email-verification')

      await signIn("password", formData)

      toast.success('Email verified! Welcome!')

      const redirectTo = searchParams.get('redirectTo')
      const safeRedirect = (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('/auth'))
        ? redirectTo
        : '/dashboard'
      router.push(safeRedirect)
    } catch (error: unknown) {
      console.error('Verification error:', error)
      setError(error instanceof Error ? error.message : 'Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (code.length === 6 && typeof step === 'object' && !isLoading) {
      handleVerify()
    }
  }, [code])

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <AnimatePresence mode="wait">
        {typeof step === 'object' ? (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/10 bg-background/60 backdrop-blur-xl shadow-2xl shadow-primary/5">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold tracking-tight">Verify Your Email</CardTitle>
                <CardDescription className="text-balance">
                  We sent a verification code to <span className="font-medium text-foreground">{step.email}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify}>
                  <div className="flex flex-col gap-8">
                    <div className="grid gap-4">
                      <Label className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        Verification Code
                      </Label>
                      <OTPInput
                        value={code}
                        onChange={setCode}
                        length={6}
                        disabled={isLoading}
                      />
                      <p className="text-sm text-muted-foreground text-center animate-pulse">
                        Check your email for the 6-digit code
                      </p>
                    </div>
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                        {error}
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                    </Button>
                  </div>
                  <div className="mt-8 text-center text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('login')
                        setCode('')
                        setError(null)
                      }}
                      className="text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
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
        )}
      </AnimatePresence>
    </div>
  )
}
