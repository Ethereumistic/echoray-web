import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { auth } from "./auth";
import { computeMemberPermissions, hasPermissionBit, PERMISSION_BITS, isSystemAdmin } from "./permissions";

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

        const org = await ctx.db.get(organizationId);
        if (!org) throw new Error("Organization not found");

        // Compute caller's permissions
        const permissions = await computeMemberPermissions(ctx, userId, organizationId);

        // === HIERARCHY ENFORCEMENT FOR INVITES ===

        // Staff Admin/Owner bypasses specific bit checks but we still check the roles assigned
        for (const roleId of roleIds) {
            const role = await ctx.db.get(roleId);
            if (!role) continue;

            const isStaffAdminUser = await isSystemAdmin(ctx, userId);
            if (isStaffAdminUser) continue; // God mode

            if (role.systemRoleType === 'admin') {
                if (!hasPermissionBit(permissions, PERMISSION_BITS['o.admin.invite'])) {
                    throw new Error("You don't have permission to invite users with the 'Admin' role.");
                }
            } else if (role.systemRoleType === 'moderator') {
                if (!hasPermissionBit(permissions, PERMISSION_BITS['o.editor.invite'])) {
                    throw new Error("You don't have permission to invite users with the 'Editor' role.");
                }
            } else {
                // For member or custom roles
                if (!hasPermissionBit(permissions, PERMISSION_BITS['o.member.invite'])) {
                    throw new Error("You don't have permission to invite users to this organization.");
                }
            }
        }

        // Check if user already exists by email
        const targetUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        // If user doesn't exist yet, we can't fully invite them in this simple flow
        // In a real app, you'd store the email and link it on signup
        if (!targetUser) {
            throw new Error(`User with email ${email} not found. They must sign up first.`);
        }

        // Check if already a member or invited
        const existingMembership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", organizationId).eq("userId", targetUser._id)
            )
            .first();

        if (existingMembership) {
            if (existingMembership.status === 'active') throw new Error("User is already a member");
            if (existingMembership.status === 'invited') throw new Error("User is already invited");
            // Suspended status: Allow re-invite by deleting the old record
            if (existingMembership.status === 'suspended') {
                await ctx.db.delete(existingMembership._id);
            }
        }

        const memberId = await ctx.db.insert("organizationMembers", {
            organizationId,
            userId: targetUser._id,
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

        const org = await ctx.db.get(organizationId);
        if (!org) throw new Error("Organization not found");

        const isSelf = userId === targetUserId;

        // Permission check
        if (!isSelf) {
            const permissions = await computeMemberPermissions(ctx, userId, organizationId);

            // Get target's roles to check if they are an Admin
            const targetMembership = await ctx.db
                .query("organizationMembers")
                .withIndex("by_org_user", (q) =>
                    q.eq("organizationId", organizationId).eq("userId", targetUserId)
                )
                .first();

            if (targetMembership) {
                const targetRoles = await ctx.db
                    .query("memberRoles")
                    .withIndex("by_memberId", (q: any) => q.eq("memberId", targetMembership._id))
                    .collect();

                let targetIsAdmin = false;
                for (const mr of targetRoles) {
                    const r = await ctx.db.get(mr.roleId);
                    if (r?.isSystemRole && r.systemRoleType === 'admin') targetIsAdmin = true;
                }

                if (targetIsAdmin) {
                    if (!hasPermissionBit(permissions, PERMISSION_BITS['o.admin.remove'])) {
                        throw new Error("Only the Organization Owner can remove an Admin.");
                    }
                } else {
                    if (!hasPermissionBit(permissions, PERMISSION_BITS['o.member.remove'])) {
                        throw new Error("You don't have permission to remove members from this organization");
                    }
                }
            }
        }

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
        if (org.ownerId === targetUserId) {
            throw new Error("You need to transfer ownership to another user to leave the organization!");
        }

        // Delete member roles
        const memberRoles = await ctx.db
            .query("memberRoles")
            .withIndex("by_memberId", (q) => q.eq("memberId", membership._id))
            .collect();
        for (const mr of memberRoles) {
            await ctx.db.delete(mr._id);
        }

        // Delete permission overrides
        const overrides = await ctx.db
            .query("memberPermissionOverrides")
            .withIndex("by_memberId", (q) => q.eq("memberId", membership._id))
            .collect();
        for (const override of overrides) {
            await ctx.db.delete(override._id);
        }

        // Delete the membership record entirely
        await ctx.db.delete(membership._id);

        return { success: true };
    },
});

/**
 * Update a member's roles
 * 
 * Hierarchy: Member < Editor < Admin < Owner
 * - Members/Editors: Cannot manage roles at all
 * - Admins: Can only manage Editors and Members
 * - Owner: Can manage anyone (including Admins)
 */
export const updateMemberRoles = mutation({
    args: {
        memberId: v.id("organizationMembers"),
        roleIds: v.array(v.id("roles")),
    },
    handler: async (ctx, { memberId, roleIds }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const member = await ctx.db.get(memberId);
        if (!member) throw new Error("Member not found");

        const org = await ctx.db.get(member.organizationId);
        if (!org) throw new Error("Organization not found");

        // Get caller's membership and roles
        const callerMembership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q: any) =>
                q.eq("organizationId", member.organizationId).eq("userId", userId)
            )
            .first();

        if (!callerMembership) {
            throw new Error("You are not a member of this organization");
        }

        // Determine caller's highest role level
        const isOrgOwner = org.ownerId === userId;
        const isStaffAdmin = await isSystemAdmin(ctx, userId);

        // Get caller's roles
        const callerRoles = await ctx.db
            .query("memberRoles")
            .withIndex("by_memberId", (q: any) => q.eq("memberId", callerMembership._id))
            .collect();

        let callerIsAdmin = false;
        let callerIsEditor = false;
        for (const mr of callerRoles) {
            const r = await ctx.db.get(mr.roleId);
            if (r?.isSystemRole && r.systemRoleType === 'admin') callerIsAdmin = true;
            if (r?.isSystemRole && r.systemRoleType === 'moderator') callerIsEditor = true;
        }

        // Get target's current roles
        const targetRoles = await ctx.db
            .query("memberRoles")
            .withIndex("by_memberId", (q: any) => q.eq("memberId", memberId))
            .collect();

        let targetIsAdmin = false;
        let targetIsEditor = false;
        for (const mr of targetRoles) {
            const r = await ctx.db.get(mr.roleId);
            if (r?.isSystemRole && r.systemRoleType === 'admin') targetIsAdmin = true;
            if (r?.isSystemRole && r.systemRoleType === 'moderator') targetIsEditor = true;
        }

        const targetIsOwner = org.ownerId === member.userId;

        // === HIERARCHY ENFORCEMENT ===

        // Rule 1: Cannot edit your own roles (unless Owner or Staff Admin)
        if (member.userId === userId && !isOrgOwner && !isStaffAdmin) {
            throw new Error("You cannot edit your own roles");
        }

        // Rule 2: Cannot edit the Owner's roles
        if (targetIsOwner && !isStaffAdmin) {
            throw new Error("Cannot modify the organization owner's roles");
        }

        // Rule 3: Staff admins can do anything
        if (isStaffAdmin) {
            // Proceed
        }
        // Rule 4: Org Owner can manage anyone
        else if (isOrgOwner) {
            // Proceed
        }
        // Rule 5: Admins can only manage Editors and Members (not other Admins)
        else if (callerIsAdmin) {
            if (targetIsAdmin) {
                throw new Error("Admins cannot manage other Admins. Only the Organization Owner can do this.");
            }
            // Can manage Editors and Members
        }
        // Rule 6: Editors cannot manage roles at all
        else if (callerIsEditor) {
            throw new Error("Editors cannot manage roles. Only Admins and the Organization Owner can do this.");
        }
        // Rule 7: Members cannot manage roles at all
        else {
            throw new Error("You don't have permission to manage roles in this organization.");
        }

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

/**
 * List all pending invites for the current user
 */
export const listMyInvites = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        const invites = await ctx.db
            .query("organizationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("status"), "invited"))
            .collect();

        const enrichedInvites = await Promise.all(
            invites.map(async (invite) => {
                const org = await ctx.db.get(invite.organizationId);
                const inviter = invite.invitedBy ? await ctx.db.get(invite.invitedBy) : null;

                return {
                    ...invite,
                    organization: org,
                    inviter: inviter ? {
                        name: inviter.name,
                        email: inviter.email,
                    } : null
                };
            })
        );

        return enrichedInvites;
    },
});

/**
 * Accept an organization invite
 */
export const acceptInvite = mutation({
    args: { inviteId: v.id("organizationMembers") },
    handler: async (ctx, { inviteId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const invite = await ctx.db.get(inviteId);
        if (!invite || invite.userId !== userId || invite.status !== "invited") {
            throw new Error("Invalid or expired invite");
        }

        await ctx.db.patch(inviteId, {
            status: "active",
            joinedAt: Date.now(),
        });

        return { success: true };
    },
});

/**
 * Decline an organization invite
 */
export const declineInvite = mutation({
    args: { inviteId: v.id("organizationMembers") },
    handler: async (ctx, { inviteId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const invite = await ctx.db.get(inviteId);
        if (!invite || invite.userId !== userId || invite.status !== "invited") {
            throw new Error("Invalid or expired invite");
        }

        // Delete member roles (if any were pre-assigned)
        const memberRoles = await ctx.db
            .query("memberRoles")
            .withIndex("by_memberId", (q) => q.eq("memberId", inviteId))
            .collect();
        for (const mr of memberRoles) {
            await ctx.db.delete(mr._id);
        }

        // Delete the invite record entirely
        await ctx.db.delete(inviteId);

        return { success: true };
    },
});
