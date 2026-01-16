"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import {
    Bell,
    Check,
    X,
    Building2,
    Mail,
    Clock,
    Loader2
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * OrgInviteNotifications displays pending organization invitations 
 * in a dropdown menu with accept/decline actions.
 */
export function OrgInviteNotifications() {
    const invites = useQuery(api.members.listMyInvites)
    const acceptInvite = useMutation(api.members.acceptInvite)
    const declineInvite = useMutation(api.members.declineInvite)

    const [isActioning, setIsActioning] = useState<string | null>(null)

    const handleAccept = async (e: React.MouseEvent, inviteId: Id<"organizationMembers">) => {
        e.preventDefault()
        e.stopPropagation()
        setIsActioning(inviteId)
        try {
            await acceptInvite({ inviteId })
            toast.success("Joined organization!")
        } catch (_err) {
            toast.error("Failed to join organization")
        } finally {
            setIsActioning(null)
        }
    }

    const handleDecline = async (e: React.MouseEvent, inviteId: Id<"organizationMembers">) => {
        e.preventDefault()
        e.stopPropagation()
        setIsActioning(inviteId)
        try {
            await declineInvite({ inviteId })
            toast.success("Invite declined")
        } catch (err) {
            toast.error("Failed to decline invite")
        } finally {
            setIsActioning(null)
        }
    }

    const hasInvites = invites && invites.length > 0

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    {hasInvites && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 border-border/50 bg-card/95 backdrop-blur-md shadow-2xl">
                <DropdownMenuLabel className="p-4 flex items-center justify-between border-b border-border/40">
                    <span className="font-bold tracking-tight">Notifications</span>
                    {hasInvites && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase">
                            {invites.length} Pending
                        </Badge>
                    )}
                </DropdownMenuLabel>

                <ScrollArea className="max-h-[400px]">
                    {!invites ? (
                        <div className="p-8 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : invites.length === 0 ? (
                        <div className="p-12 text-center space-y-2">
                            <div className="mx-auto w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                                <Mail className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium">No new invites</p>
                            <p className="text-[11px] text-muted-foreground">You&apos;re all caught up!</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {invites.map((invite) => (
                                <div
                                    key={invite._id}
                                    className="p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/40 group"
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1 h-8 w-8 rounded-md bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                                            <Building2 className="h-4 w-4 text-indigo-400" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs font-bold leading-none">
                                                {invite.organization?.name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                From {invite.inviter?.name || invite.inviter?.email || "Someone"}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(invite.invitedAt)} ago
                                            </p>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    className="h-7 px-3 bg-primary/90 hover:bg-primary text-[11px] font-bold"
                                                    onClick={(e) => handleAccept(e, invite._id)}
                                                    disabled={isActioning === invite._id}
                                                >
                                                    {isActioning === invite._id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Check className="mr-1 h-3 w-3" />
                                                            Accept
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-3 border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-[11px] font-semibold"
                                                    onClick={(e) => handleDecline(e, invite._id)}
                                                    disabled={isActioning === invite._id}
                                                >
                                                    <X className="mr-1 h-3 w-3" />
                                                    Decline
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem className="p-3 justify-center text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    View all activities
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
