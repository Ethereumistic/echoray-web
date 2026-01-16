import { z } from "zod"

/**
 * Common Zod schemas for the application.
 * Using Zod allows us to define schemas and infer Typescript types automatically.
 */

// Schema for organization creation/update
export const organizationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    description: z.string().max(500).optional().nullable(),
})

export type OrganizationFormValues = z.infer<typeof organizationSchema>

// Schema for member invitation
export const inviteMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
    roleIds: z.array(z.string()).min(1, "At least one role must be selected"),
})

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>

// Schema for profile update
export const profileSchema = z.object({
    displayName: z.string().min(2).max(50).optional(),
    avatarUrl: z.string().url().optional().nullable(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
