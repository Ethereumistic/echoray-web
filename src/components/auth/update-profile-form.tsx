'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, extractProfileFromUser } from '@/stores/auth-store'

interface UpdateProfileFormProps {
    initialDisplayName?: string
}

export function UpdateProfileForm({ initialDisplayName = '' }: UpdateProfileFormProps) {
    const [displayName, setDisplayName] = useState(initialDisplayName)
    const [isLoading, setIsLoading] = useState(false)
    const { setProfile } = useAuthStore()

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)

        try {
            const { data: { user }, error } = await supabase.auth.updateUser({
                data: { display_name: displayName }
            })

            if (error) throw error

            if (user) {
                // Update local store
                setProfile(extractProfileFromUser(user))
                // You might want to use a toast here
                console.log('Profile updated successfully')
            }
        } catch (error: any) {
            console.error('Error updating profile:', error)
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
