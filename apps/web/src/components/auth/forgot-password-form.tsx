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
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

/**
 * ForgotPasswordForm for Convex Auth with Resend OTP
 * 
 * Two-step password reset flow:
 * 1. Enter email -> sends OTP code via Resend
 * 2. Enter OTP + new password -> resets password
 */
import { AnimatePresence, motion } from 'framer-motion'
import { LogIn } from 'lucide-react'

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<'email' | { email: string } | 'success'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('flow', 'reset')

      await signIn('password', formData)

      setStep({ email })
      toast.success('Reset code sent! Check your email.')
    } catch (error: unknown) {
      console.error('Password reset request error:', error)
      setError('If an account exists with that email, you will receive a reset code.')
      setStep({ email })
    } finally {
      setIsLoading(false)
    }
  }


  const handleVerifyAndReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Guard for programmatic calls
    if (code.length !== 6) return
    if (newPassword !== confirmPassword || newPassword.length < 8) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('email', typeof step === 'object' ? step.email : email)
      formData.append('code', code)
      formData.append('newPassword', newPassword)
      formData.append('flow', 'reset-verification')

      await signIn('password', formData)

      setStep('success')
      toast.success('Password reset successfully!')
    } catch (error: unknown) {
      console.error('Password reset verification error:', error)
      setError(error instanceof Error ? error.message : 'Invalid code or an error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-verify when 6 digits are entered and passwords are valid
  useEffect(() => {
    if (code.length === 6 && typeof step === 'object' && !isLoading) {
      if (newPassword === confirmPassword && newPassword.length >= 8) {
        handleVerifyAndReset()
      }
    }
  }, [code, newPassword, confirmPassword])

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <AnimatePresence mode="wait">
        {step === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/10 bg-background/60 backdrop-blur-xl shadow-2xl shadow-primary/5">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold tracking-tight text-primary">Success</CardTitle>
                <CardDescription>Your password has been successfully updated</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  You can now log in with your new password and access your dashboard.
                </p>
                <Link href="/auth/login" className="block">
                  <Button className="w-full">Go to Login</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : typeof step === 'object' ? (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/10 bg-background/60 backdrop-blur-xl shadow-2xl shadow-primary/5">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold tracking-tight">Reset Password</CardTitle>
                <CardDescription>
                  Enter the code sent to <span className="font-medium text-foreground">{step.email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyAndReset}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-4">
                      <Label className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        Reset Code
                      </Label>
                      <OTPInput
                        value={code}
                        onChange={setCode}
                        length={6}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          required
                          minLength={8}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
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
                      {isLoading ? 'Resetting...' : 'Update Password'}
                    </Button>
                  </div>
                  <div className="mt-8 flex justify-between items-center text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email')
                        setCode('')
                        setNewPassword('')
                        setConfirmPassword('')
                        setError(null)
                      }}
                      className="text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      Back
                    </button>
                    <Link href="/auth/login" className="text-primary hover:underline underline-offset-4 font-medium transition-all">
                      Cancel
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="email"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/10 bg-background/60 backdrop-blur-xl shadow-2xl shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tight">Reset Password</CardTitle>
                <CardDescription>
                  Enter your email and we&apos;ll send you a code to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestReset}>
                  <div className="flex flex-col gap-6">
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
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                        {error}
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send Reset Code'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-center text-sm text-muted-foreground">
                      Remember your password?{' '}
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
