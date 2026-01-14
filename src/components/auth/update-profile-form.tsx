'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '../../../convex/_generated/api'
import { toast } from 'sonner'

interface UpdateProfileFormProps {
    initialDisplayName?: string
}

export function UpdateProfileForm({ initialDisplayName = '' }: UpdateProfileFormProps) {
    const [displayName, setDisplayName] = useState(initialDisplayName)
    const [isLoading, setIsLoading] = useState(false)
    const { setProfile, profile } = useAuthStore()

    const updateDisplayName = useMutation(api.users.updateDisplayName)

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await updateDisplayName({ displayName })

            // Update local store
            if (profile) {
                setProfile({
                    ...profile,
                    displayName,
                })
            }

            toast.success('Profile updated successfully')
        } catch (error: unknown) {
            console.error('Error updating profile:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to update profile')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                    id="displayName"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
        </form>
    )
}
