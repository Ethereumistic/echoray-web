'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

/**
 * SettingsPasswordForm for changing password while logged in
 * 
 * Note: This requires implementing a custom password change flow in Convex.
 * For security, it should verify the current password before allowing a change.
 */
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

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setIsLoading(true)

        try {
            // TODO: Implement password change in Convex
            // This would need a custom mutation that:
            // 1. Verifies the current password
            // 2. Hashes and stores the new password

            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

            setSuccess(true)
            setCurrentPassword('')
            setPassword('')
            setConfirmPassword('')
            toast.success('Password updated successfully!')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An error occurred'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid gap-4">
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
                            minLength={8}
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
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-500">Password updated successfully!</p>}
            <Button type="submit" variant="outline" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
        </form>
    )
}
