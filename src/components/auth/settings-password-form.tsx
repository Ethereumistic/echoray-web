'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsPasswordForm() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        const supabase = createClient()
        setIsLoading(true)

        try {
            // 1. Verify user's identity by re-signing in
            const { data: { user } } = await supabase.auth.getUser()

            if (!user?.email) {
                throw new Error('User email not found')
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            })

            if (signInError) {
                throw new Error('Current password is incorrect')
            }

            // 2. If verification succeeds, update password
            const { error: updateError } = await supabase.auth.updateUser({ password })
            if (updateError) throw updateError

            setSuccess(true)
            setCurrentPassword('')
            setPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            setError(error.message || 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                        id="newPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-500">Password updated successfully!</p>}
            <Button type="submit" variant="outline" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
        </form>
    )
}
