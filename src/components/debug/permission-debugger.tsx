"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { useQuery, useMutation, useConvexAuth } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { cn } from "@/lib/utils"
import { PERMISSION_BITS } from "@/types/permissions"

/**
 * Permission Debugger - Staff/Dev tool for debugging permissions
 * 
 * Features:
 * - Full context information (user, org, membership, roles)
 * - Permission breakdown by scope (Global, Org, App, System)
 * - Tier switching (staff only)
 * - Bitwise representation
 */
export function PermissionDebugger() {
    const { isAuthenticated } = useConvexAuth()
    const { profile, activeOrganization, permissions, isLoading, memberProfile } = useAuthStore()

    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<"context" | "permissions" | "bits">("context")

    // Always fetch breakdown for toggle button display (not dependent on isOpen)
    const breakdown = useQuery(
        api.debug.getPermissionBreakdown,
        isAuthenticated
            ? { organizationId: activeOrganization?._id }
            : "skip"
    )
    const allTiers = useQuery(api.debug.getAllTiers, isAuthenticated && isOpen ? {} : "skip")
    const changeTier = useMutation(api.debug.changeTier)

    // Only show in development or for staff admins
    const isDev = process.env.NODE_ENV === "development"
    const isStaff = permissions["system.admin"] === true

    // Set body overflow when panel is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [isOpen])

    if (isLoading && !isAuthenticated) return null
    if (!isAuthenticated) return null
    if (!isDev && !isStaff) return null

    const handleTierChange = async (tierSlug: string) => {
        if (!confirm(`Change your tier to "${tierSlug}"? This affects your permissions.`)) return
        try {
            await changeTier({ tierSlug })
        } catch (err) {
            console.error("Failed to change tier:", err)
            alert("Failed to change tier. See console for details.")
        }
    }

    // Group permissions by scope
    const groupedPermissions = {
        global: Object.entries(permissions).filter(([code]) =>
            !code.startsWith("o.") && !code.startsWith("app.") && !code.startsWith("system.")
        ),
        org: Object.entries(permissions).filter(([code]) => code.startsWith("o.")),
        app: Object.entries(permissions).filter(([code]) => code.startsWith("app.")),
        system: Object.entries(permissions).filter(([code]) => code.startsWith("system.")),
    }

    // Get tier display name (shortened) - use profile from auth-store as fallback
    const getTierDisplay = () => {
        // Try breakdown first (more accurate), fall back to profile from auth-store
        const tierName = breakdown?.userTier?.name || profile?.subscriptionTier?.name
        if (!tierName) return "..."
        if (tierName === "Staff Admin") return "S. Admin"
        return tierName
    }

    // Get org role display - find highest role from memberProfile
    const getOrgRoleDisplay = () => {
        if (!activeOrganization) return "—"
        if (breakdown?.organizationContext?.isOwner) return "Owner"

        // Use memberProfile roles from auth-store as fallback
        const roles = breakdown?.organizationContext?.roles || memberProfile?.roles
        if (!roles || roles.length === 0) return "Member"

        // Return highest role (first one, assuming sorted by position)
        const firstRole = roles[0]
        return firstRole?.name || "Member"
    }

    // Get scope display - P for Personal, O for Organization
    const getScopeDisplay = () => {
        return activeOrganization ? "O" : "P"
    }

    return (
        <>
            {/* Toggle Button - Format: [tier] | [org role] | [scope] */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-4 right-4 z-9999 px-3 py-2 rounded-lg text-xs font-mono transition-colors",
                    "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800",
                    isOpen && "bg-blue-900 border-blue-600 text-blue-200"
                )}
            >
                🔐 {getTierDisplay()} | {getOrgRoleDisplay()} | {getScopeDisplay()}
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="fixed inset-0 z-9998 flex items-end justify-end p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel Content */}
                    <div className="relative w-full max-w-md h-[80vh] bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                            <div>
                                <h2 className="text-sm font-bold text-white">Permission Debugger</h2>
                                <p className="text-xs text-zinc-500 font-mono">
                                    {isStaff ? "STAFF_ADMIN" : "DEV_MODE"} • v1.1
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-500 hover:text-white text-lg"
                            >
                                ×
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-zinc-800 bg-zinc-900/50">
                            {(["context", "permissions", "bits"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors",
                                        activeTab === tab
                                            ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/5"
                                            : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeTab === "context" && (
                                <ContextTab
                                    breakdown={breakdown}
                                    profile={profile}
                                    activeOrganization={activeOrganization}
                                    allTiers={allTiers}
                                    isStaff={isStaff}
                                    onTierChange={handleTierChange}
                                />
                            )}

                            {activeTab === "permissions" && (
                                <PermissionsTab groupedPermissions={groupedPermissions} />
                            )}

                            {activeTab === "bits" && (
                                <BitsTab permissions={permissions} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// Type definitions for the breakdown and tiers data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BreakdownData = any;

type TierData = {
    _id: string;
    name: string;
    slug: string;
    basePermissions: number;
    orgFeatures?: number;
}[] | undefined;

interface ContextTabProps {
    breakdown: BreakdownData;
    profile: { email?: string; subscriptionTier?: { name: string; slug: string } } | null;
    activeOrganization: { _id: string; name: string } | null;
    allTiers: TierData;
    isStaff: boolean;
    onTierChange: (slug: string) => void;
}

// Context Tab - Full user/org/membership info
function ContextTab({
    breakdown,
    profile,
    activeOrganization,
    allTiers,
    isStaff,
    onTierChange,
}: ContextTabProps) {
    // Handle loading state
    if (breakdown === undefined) {
        return <p className="text-zinc-500 text-xs">Loading context...</p>
    }

    // Handle null (permission denied or error)
    if (breakdown === null) {
        return (
            <div className="space-y-4">
                <Section title="User">
                    <Row label="Email" value={profile?.email || "—"} />
                    <Row label="Tier" value={profile?.subscriptionTier?.name || "Unknown"} />
                    <p className="text-xs text-zinc-500 mt-2 italic">
                        Full breakdown unavailable. Ensure you have debug permissions.
                    </p>
                </Section>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* User Info */}
            <Section title="User">
                <Row label="ID" value={String(breakdown.userId).slice(0, 20) + "..."} />
                <Row label="Email" value={breakdown.userEmail || "—"} />
                <Row
                    label="Tier"
                    value={breakdown.userTier?.name || "None"}
                    highlight={breakdown.isStaffAdmin ? "staff" : undefined}
                />
                <Row label="Slug" value={breakdown.userTier?.slug || "—"} mono />
                <Row label="Base Perms" value={breakdown.userTier?.basePermissions?.toString() || "0"} mono />
                <Row label="Org Features" value={breakdown.userTier?.orgFeatures?.toString() || "0"} mono />
                <Row label="Max Orgs" value={breakdown.userTier?.maxOrganizations?.toString() || "0"} />
            </Section>

            {/* Tier Switcher (Staff Only) */}
            {isStaff && allTiers && allTiers.length > 0 && (
                <Section title="Tier Switcher (Staff Only)">
                    <div className="flex flex-wrap gap-1">
                        {allTiers.map((tier) => (
                            <button
                                key={tier._id}
                                onClick={() => onTierChange(tier.slug)}
                                className={cn(
                                    "px-2 py-1 text-xs rounded font-mono transition-colors",
                                    tier.slug === breakdown.userTier?.slug
                                        ? "bg-blue-600 text-white"
                                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                )}
                            >
                                {tier.slug}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-red-400 mt-2">
                        ⚠️ Changing away from staff_admin requires manual DB restore!
                    </p>
                </Section>
            )}

            {/* Organization Context */}
            {activeOrganization ? (
                <Section title="Organization Context">
                    <Row label="Org ID" value={String(activeOrganization._id).slice(0, 20) + "..."} />
                    <Row label="Name" value={breakdown.organizationContext?.orgName || "—"} />
                    <Row
                        label="You Are"
                        value={breakdown.organizationContext?.isOwner ? "OWNER" : "MEMBER"}
                        highlight={breakdown.organizationContext?.isOwner ? "owner" : undefined}
                    />
                    <Row label="Owner Email" value={breakdown.organizationContext?.ownerEmail || "—"} />
                    <Row label="Owner Tier" value={breakdown.organizationContext?.ownerTier?.name || "—"} />
                    <Row
                        label="Org Features Cap"
                        value={breakdown.organizationContext?.ownerTier?.orgFeatures?.toString() || "0"}
                        mono
                    />

                    {/* Membership */}
                    {breakdown.organizationContext?.membership && (
                        <>
                            <div className="h-px bg-zinc-800 my-2" />
                            <Row label="Status" value={breakdown.organizationContext.membership.status} />
                            <Row
                                label="Computed"
                                value={breakdown.organizationContext.membership.computedPermissions.toString()}
                                mono
                            />
                        </>
                    )}

                    {/* Roles */}
                    {breakdown.organizationContext?.roles && breakdown.organizationContext.roles.length > 0 && (
                        <>
                            <div className="h-px bg-zinc-800 my-2" />
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Roles</p>
                            {breakdown.organizationContext.roles.map((role: { name: string; permissions: number; color?: string }, i: number) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <span
                                        className="font-medium"
                                        style={{ color: role.color || "#a1a1aa" }}
                                    >
                                        {role.name}
                                    </span>
                                    <span className="text-zinc-600 font-mono">{role.permissions}</span>
                                </div>
                            ))}
                        </>
                    )}
                </Section>
            ) : (
                <Section title="Organization Context">
                    <p className="text-xs text-zinc-500 italic">No organization selected (personal context)</p>
                </Section>
            )}
        </div>
    )
}

// Permissions Tab - Grouped by scope
function PermissionsTab({
    groupedPermissions,
}: {
    groupedPermissions: Record<string, [string, boolean][]>
}) {
    return (
        <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([scope, perms]) => (
                <Section key={scope} title={`${scope.toUpperCase()} (${perms.filter(([, v]) => v).length}/${perms.length})`}>
                    <div className="space-y-0.5">
                        {perms.length === 0 ? (
                            <p className="text-xs text-zinc-600 italic">No permissions in this scope</p>
                        ) : (
                            perms.sort((a, b) => (b[1] ? 1 : 0) - (a[1] ? 1 : 0)).map(([code, granted]) => (
                                <div
                                    key={code}
                                    className={cn(
                                        "flex items-center justify-between px-2 py-1 rounded text-xs",
                                        granted ? "bg-green-900/20 text-green-400" : "bg-zinc-900 text-zinc-600"
                                    )}
                                >
                                    <span className="font-mono">{code}</span>
                                    <span>{granted ? "✓" : "✗"}</span>
                                </div>
                            ))
                        )}
                    </div>
                </Section>
            ))}
        </div>
    )
}

// Bits Tab - Raw bitwise representation
function BitsTab({ permissions }: { permissions: Record<string, boolean> }) {
    return (
        <Section title="Bitwise Representation">
            <div className="space-y-0.5 max-h-[50vh] overflow-y-auto">
                {Object.entries(PERMISSION_BITS)
                    .sort((a, b) => a[1] - b[1])
                    .map(([code, bit]) => {
                        const granted = permissions[code] === true
                        return (
                            <div
                                key={code}
                                className={cn(
                                    "flex items-center justify-between px-2 py-1 rounded text-xs font-mono",
                                    granted ? "bg-blue-900/20 text-blue-300" : "bg-zinc-900/50 text-zinc-600"
                                )}
                            >
                                <span className="text-zinc-500 w-8">{bit}</span>
                                <span className="flex-1 truncate px-2">{code}</span>
                                <span className={granted ? "text-green-400" : "text-zinc-700"}>
                                    {granted ? "1" : "0"}
                                </span>
                            </div>
                        )
                    })}
            </div>
        </Section>
    )
}

// Helper components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
            <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">{title}</h3>
            {children}
        </div>
    )
}

function Row({
    label,
    value,
    mono,
    highlight,
}: {
    label: string
    value: string
    mono?: boolean
    highlight?: "staff" | "owner"
}) {
    return (
        <div className="flex items-center justify-between text-xs py-0.5">
            <span className="text-zinc-500">{label}</span>
            <span
                className={cn(
                    mono && "font-mono",
                    highlight === "staff" && "text-red-400 font-bold",
                    highlight === "owner" && "text-yellow-400 font-bold",
                    !highlight && "text-zinc-300"
                )}
            >
                {value}
            </span>
        </div>
    )
}
