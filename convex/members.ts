import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Member management Convex functions
 * Handles organization membership operations
 */

/**
 * Get all members of an organization
 */
export const listMembers = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, { organizationId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if user is a member of this org
        const userMembership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", organizationId).eq("userId", userId)
            )
            .first();

        if (!userMembership || userMembership.status !== "active") {
            throw new Error("Not a member of this organization");
        }

        // Get all members
        const members = await ctx.db
            .query("organizationMembers")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
            .collect();

        // Enrich with user data and roles
        const enrichedMembers = await Promise.all(
            members.map(async (member) => {
                // Get user directly from unified users table
                const user = await ctx.db.get(member.userId);

                // Get member roles
                const memberRoles = await ctx.db
                    .query("memberRoles")
                    .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
                    .collect();

                // Get role details
                const roles = await Promise.all(
                    memberRoles.map(async (mr) => {
                        return await ctx.db.get(mr.roleId);
                    })
                );

                return {
                    ...member,
                    user: {
                        id: member.userId,
                        email: user?.email,
                        fullName: user?.name,
                        username: user?.username,
                        avatarUrl: user?.image,
                    },
                    memberRoles: roles.filter(Boolean).map((role) => ({ role })),
                    roles: roles.filter(Boolean),
                };
            })
        );

        return enrichedMembers;
    },
});

/**
 * Get a single member by ID
 */
export const getMember = query({
    args: { memberId: v.id("organizationMembers") },
    handler: async (ctx, { memberId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const member = await ctx.db.get(memberId);
        if (!member) throw new Error("Member not found");

        // Check if user is in the same org
        const userMembership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", member.organizationId).eq("userId", userId)
            )
            .first();

        if (!userMembership) {
            throw new Error("Not authorized");
        }

        return member;
    },
});

/**
 * Invite a new member to an organization
 */
export const inviteMember = mutation({
    args: {
        organizationId: v.id("organizations"),
        email: v.string(),
        roleIds: v.array(v.id("roles")),
    },
    handler: async (ctx, { organizationId, email, roleIds }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // TODO: Check if user has members.invite permission

        // For now, just create the membership record in invited status
        // In a real implementation, you'd send an email invitation

        // Check if user already exists by email
        // Note: In Convex Auth, users are created on signup, so we store the invite
        // and the user can claim it when they sign up with that email

        const memberId = await ctx.db.insert("organizationMembers", {
            organizationId,
            userId, // Placeholder - will need to be updated when invited user signs up
            status: "invited",
            invitedBy: userId,
            invitedAt: Date.now(),
            computedPermissions: 0,
        });

        // Assign roles
        for (const roleId of roleIds) {
            await ctx.db.insert("memberRoles", {
                memberId,
                roleId,
                assignedBy: userId,
                assignedAt: Date.now(),
            });
        }

        return { memberId, success: true };
    },
});

/**
 * Remove a member from an organization
 */
export const removeMember = mutation({
    args: {
        organizationId: v.id("organizations"),
        targetUserId: v.id("users"),
    },
    handler: async (ctx, { organizationId, targetUserId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // TODO: Check if user has members.remove permission

        // Get the membership
        const membership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", organizationId).eq("userId", targetUserId)
            )
            .first();

        if (!membership) {
            throw new Error("Member not found");
        }

        // Check if trying to remove the owner
        const org = await ctx.db.get(organizationId);
        if (org?.ownerId === targetUserId) {
            throw new Error("Cannot remove the organization owner");
        }

        // Update status to "left"
        await ctx.db.patch(membership._id, { status: "left" });

        return { success: true };
    },
});

/**
 * Update a member's roles
 */
export const updateMemberRoles = mutation({
    args: {
        memberId: v.id("organizationMembers"),
        roleIds: v.array(v.id("roles")),
    },
    handler: async (ctx, { memberId, roleIds }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // TODO: Check if user has roles.manage permission

        const member = await ctx.db.get(memberId);
        if (!member) throw new Error("Member not found");

        // Remove existing roles
        const existingRoles = await ctx.db
            .query("memberRoles")
            .withIndex("by_memberId", (q) => q.eq("memberId", memberId))
            .collect();

        for (const role of existingRoles) {
            await ctx.db.delete(role._id);
        }

        // Add new roles
        for (const roleId of roleIds) {
            await ctx.db.insert("memberRoles", {
                memberId,
                roleId,
                assignedBy: userId,
                assignedAt: Date.now(),
            });
        }

        // Invalidate computed permissions
        await ctx.db.patch(memberId, {
            permissionsLastComputedAt: undefined,
            computedPermissions: 0,
        });

        return { success: true };
    },
});
