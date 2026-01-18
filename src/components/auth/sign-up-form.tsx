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
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { AnimatePresence, motion } from 'framer-motion'
import { LogIn } from 'lucide-react'

/**
 * SignUpForm with Email Verification
 */
export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'signup' | { email: string }>('signup')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuthActions()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      await signIn("password", {
        email,
        password,
        flow: "signUp",
        name: displayName,
      })

      setStep({ email })
      toast.success('Account created! Check your email for the verification code.')
    } catch (error: unknown) {
      console.error('Sign up error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign up'

      if (errorMessage.toLowerCase().includes('verification') || errorMessage.toLowerCase().includes('verify')) {
        setStep({ email })
        toast.info('Please check your email for the verification code.')
      } else {
        setError(errorMessage)
      }
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

      toast.success('Email verified! Welcome to Echoray!')
      router.push('/dashboard')
    } catch (error: unknown) {
      console.error('Verification error:', error)
      setError(error instanceof Error ? error.message : 'Invalid code or an error occurred')
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
                  We sent a verification code to <span className="font-medium text-foreground">{step.email}</span>
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
                      {isLoading ? 'Verifying...' : 'Verify Email'}
                    </Button>
                  </div>
                  <div className="mt-8 flex justify-between items-center text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('signup')
                        setCode('')
                        setError(null)
                      }}
                      className="text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      Back to signup
                    </button>
                    <Link href="/auth/login" className="text-primary hover:underline underline-offset-4 font-medium transition-all">
                      Already have an account?
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/10 bg-background/60 backdrop-blur-xl shadow-2xl shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tight">Create an Account</CardTitle>
                <CardDescription>Join Echoray and start exploring the future.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp}>
                  <div className="flex flex-col gap-5">

                    <div className="grid gap-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="John Doe"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
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
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="repeat-password">Repeat</Label>
                        <Input
                          id="repeat-password"
                          type="password"
                          required
                          value={repeatPassword}
                          onChange={(e) => setRepeatPassword(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                        {error}
                      </div>
                    )}
                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Sign up'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-center text-sm text-muted-foreground">
                      Already have an account?{' '}
                    </div>
                    <Link href="/auth/login" className="flex items-center justify-center gap-2 text-primary hover:underline underline-offset-4 font-medium">
                      <LogIn className="size-4" /> Login
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
