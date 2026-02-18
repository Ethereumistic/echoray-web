"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { cn } from "@echoray/ui/lib/utils";
import { Calendar } from "@echoray/ui/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  TrendingUp,
  Ghost,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Ban,
  Plus,
  Trash2,
  Settings,
  List,
  Save,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@echoray/ui/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@echoray/ui/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@echoray/ui/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@echoray/ui/components/ui/tabs";
import { Badge } from "@echoray/ui/components/ui/badge";
import { Skeleton } from "@echoray/ui/components/ui/skeleton";
import { Input } from "@echoray/ui/components/ui/input";
import { Label } from "@echoray/ui/components/ui/label";
import { Button } from "@echoray/ui/components/ui/button";
import { Switch } from "@echoray/ui/components/ui/switch";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@echoray/ui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@echoray/ui/components/ui/popover";
import { BOOKING_STATUS_CONFIG, TIME_SLOTS, type BookingStatus } from "@/lib/validations";

type Booking = {
  _id: Id<"meeting_bookings">;
  fullName: string;
  email: string;
  phone: string;
  meetingDate: number;
  timeSlot: string;
  timezone: string;
  status: BookingStatus;
  notes?: string;
  createdAt: number;
};

export default function MeetingsAdminPage() {
  const stats = useQuery(api.meetings.getBookingStats);
  const bookings = useQuery(api.meetings.listBookings, {});
  const blockedDates = useQuery(api.meetings.listBlockedDates);
  const weekendBlockStatus = useQuery(api.meetings.getWeekendBlockStatus);

  const updateStatus = useMutation(api.meetings.updateBookingStatus);
  const rescheduleBooking = useMutation(api.meetings.rescheduleBooking);
  const createBlockedDate = useMutation(api.meetings.createBlockedDate);
  const deleteBlockedDate = useMutation(api.meetings.deleteBlockedDate);
  const toggleWeekendBlock = useMutation(api.meetings.toggleWeekendBlock);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockDateEnd, setNewBlockDateEnd] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState<string | undefined>(undefined);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const filteredBookings = bookings?.filter(
    (b) => statusFilter === "all" || b.status === statusFilter
  );

  const handleStatusChange = async (bookingId: Id<"meeting_bookings">, newStatus: BookingStatus) => {
    setIsUpdating(true);
    try {
      await updateStatus({ id: bookingId, status: newStatus });
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !rescheduleDate || !rescheduleTime) return;

    setIsRescheduling(true);
    setRescheduleError(null);

    try {
      const meetingDate = new Date(
        rescheduleDate.getFullYear(),
        rescheduleDate.getMonth(),
        rescheduleDate.getDate()
      ).getTime();

      await rescheduleBooking({
        id: selectedBooking._id,
        meetingDate,
        timeSlot: rescheduleTime,
      });

      setSelectedBooking({
        ...selectedBooking,
        meetingDate,
        timeSlot: rescheduleTime,
      });
    } catch (err: any) {
      setRescheduleError(err.message || "Failed to reschedule");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockDate) return;
    setIsAddingBlock(true);
    try {
      const dateStart = new Date(newBlockDate).getTime();
      const dateEnd = newBlockDateEnd ? new Date(newBlockDateEnd).getTime() : dateStart;

      await createBlockedDate({
        date: !newBlockDateEnd ? dateStart : undefined,
        dateStart: newBlockDateEnd ? dateStart : undefined,
        dateEnd: newBlockDateEnd ? dateEnd : undefined,
        reason: newBlockReason || undefined,
      });

      setNewBlockDate("");
      setNewBlockDateEnd("");
      setNewBlockReason("");
    } catch (err) {
      console.error("Failed to add blocked date:", err);
    } finally {
      setIsAddingBlock(false);
    }
  };

  const handleToggleWeekend = async (enable: boolean) => {
    try {
      await toggleWeekendBlock({ enable });
    } catch (err) {
      console.error("Failed to toggle weekend block:", err);
    }
  };

  const handleDeleteBlock = async (id: Id<"meeting_book_blocked_dates">) => {
    try {
      await deleteBlockedDate({ id });
    } catch (err) {
      console.error("Failed to delete blocked date:", err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setRescheduleDate(new Date(booking.meetingDate));
    setRescheduleTime(booking.timeSlot);
    setRescheduleError(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black tracking-tight flex items-center gap-3"
        >
          <CalendarIcon className="size-8 text-blue-400" />
          Meeting <span className="text-blue-500">Bookings</span>
        </motion.h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Manage client meeting bookings and availability
        </p>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="bg-zinc-900/60 border border-zinc-800/60">
          <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-600/10 data-[state=active]:text-blue-400">
            <List className="size-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="availability" className="data-[state=active]:bg-blue-600/10 data-[state=active]:text-blue-400">
            <Settings className="size-4 mr-2" />
            Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={CalendarIcon}
              label="Total"
              value={stats?.total}
              color="text-blue-400"
              delay={0}
            />
            <StatCard
              icon={Clock}
              label="Awaiting"
              value={stats?.awaiting}
              color="text-amber-400"
              delay={0.05}
            />
            <StatCard
              icon={CheckCircle2}
              label="Confirmed"
              value={stats?.confirmed}
              color="text-emerald-400"
              delay={0.1}
            />
            <StatCard
              icon={TrendingUp}
              label="Successful"
              value={stats?.successful}
              color="text-green-400"
              delay={0.15}
            />
            <StatCard
              icon={Ghost}
              label="Ghosted"
              value={stats?.ghosted}
              color="text-orange-400"
              delay={0.2}
            />
          </div>

          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="awaiting">Awaiting</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="ghosted">Ghosted</SelectItem>
              </SelectContent>
            </Select>

            {stats && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Conversion: <span className="text-emerald-400 font-bold">{stats.conversionRate}%</span></span>
                <span>Ghost Rate: <span className="text-orange-400 font-bold">{stats.ghostRate}%</span></span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800/60 overflow-hidden">
            {!filteredBookings ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-zinc-900" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <CalendarIcon className="size-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No bookings found</p>
                <p className="text-sm">Bookings will appear here when clients submit the form</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/50 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Client</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Date & Time</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking: Booking, i: number) => {
                    const statusConfig = BOOKING_STATUS_CONFIG[booking.status];
                    return (
                      <motion.tr
                        key={booking._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-zinc-800/30 hover:bg-zinc-800/20 cursor-pointer"
                        onClick={() => handleOpenModal(booking)}
                      >
                        <TableCell>
                          <div className="font-medium text-sm">{booking.fullName}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3" />
                            {booking.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{formatDate(booking.meetingDate)}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {booking.timeSlot} ({booking.timezone})
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px] font-bold border", statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(booking.createdAt)}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="availability" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Settings className="size-5 text-blue-400" />
                Availability Settings
              </h3>

              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                <div>
                  <div className="font-medium text-sm">Block Weekends</div>
                  <div className="text-[11px] text-muted-foreground">Prevent bookings on Saturday & Sunday</div>
                </div>
                <Switch
                  checked={weekendBlockStatus ?? false}
                  onCheckedChange={handleToggleWeekend}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Add Blocked Date Range
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-500">Start Date</Label>
                    <Input
                      type="date"
                      value={newBlockDate}
                      onChange={(e) => setNewBlockDate(e.target.value)}
                      className="bg-zinc-950 border-zinc-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-500">End Date (optional)</Label>
                    <Input
                      type="date"
                      value={newBlockDateEnd}
                      onChange={(e) => setNewBlockDateEnd(e.target.value)}
                      className="bg-zinc-950 border-zinc-800"
                    />
                  </div>
                </div>
                <Input
                  placeholder="Reason (e.g., Holiday, Vacation)"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  className="bg-zinc-950 border-zinc-800"
                />
                <Button
                  onClick={handleAddBlockedDate}
                  disabled={!newBlockDate || isAddingBlock}
                  className="w-full bg-blue-600 hover:bg-blue-500"
                >
                  {isAddingBlock ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="size-4 mr-2" />
                  )}
                  Add Blocked Date
                </Button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Ban className="size-5 text-red-400" />
                Blocked Dates
              </h3>

              {!blockedDates ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : blockedDates.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No blocked dates configured
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {blockedDates.map((block: any) => (
                    <div
                      key={block._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/50"
                    >
                      <div>
                        {block.isWeekend ? (
                          <div className="font-medium text-sm">Weekends</div>
                        ) : block.dateStart && block.dateEnd ? (
                          <div className="font-medium text-sm">
                            {formatDate(block.dateStart)} - {formatDate(block.dateEnd)}
                          </div>
                        ) : block.date ? (
                          <div className="font-medium text-sm">{formatDate(block.date)}</div>
                        ) : null}
                        {block.reason && (
                          <div className="text-[11px] text-muted-foreground">{block.reason}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBlock(block._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-6xl bg-zinc-950 border-zinc-800 px-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5 text-blue-400" />
              Booking Details
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Top Row: 3 Columns */}
              <div className="grid grid-cols-3 gap-6">
                {/* Column 1: Client Info */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 space-y-3">
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest text-zinc-500">Client</Label>
                      <div className="font-medium text-lg">{selectedBooking.fullName}</div>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest text-zinc-500">Email</Label>
                      <div className="text-sm flex items-center gap-2 mt-1">
                        <Mail className="size-4 text-muted-foreground" />
                        <a href={`mailto:${selectedBooking.email}`} className="text-blue-400 hover:underline">
                          {selectedBooking.email}
                        </a>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest text-zinc-500">Phone</Label>
                      <div className="text-sm flex items-center gap-2 mt-1">
                        <Phone className="size-4 text-muted-foreground" />
                        <a href={`tel:${selectedBooking.phone}`} className="text-blue-400 hover:underline">
                          {selectedBooking.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {selectedBooking.notes && (
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                      <Label className="text-[10px] uppercase tracking-widest text-zinc-500">Notes</Label>
                      <div className="text-sm text-muted-foreground mt-1">{selectedBooking.notes}</div>
                    </div>
                  )}

                  <div className="text-[11px] text-muted-foreground">
                    Created: {formatDateTime(selectedBooking.createdAt)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Current: {formatDate(selectedBooking.meetingDate)} at {selectedBooking.timeSlot}
                  </div>
                </div>

                {/* Column 2: Calendar */}
                <div className="flex flex-col">
                  <div className="flex justify-center h-[384px]">
                    <Calendar
                      mode="single"
                      selected={rescheduleDate}
                      onSelect={setRescheduleDate}
                      fixedWeeks
                      disabled={[
                        { before: new Date() },
                      ]}
                      className="rounded-md border shadow-sm bg-zinc-900 border-zinc-800"
                    />
                  </div>
                </div>

                {/* Column 3: Time Slots Grid */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-zinc-500">Select Time Slot</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-[350px] overflow-y-auto pr-2">
                    {TIME_SLOTS.map((time) => (
                      <Button
                        key={time}
                        variant="ghost"
                        size="sm"
                        onClick={() => setRescheduleTime(time)}
                        className={cn(
                          "text-xs font-medium border h-auto py-2 px-2",
                          rescheduleTime === time
                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-500"
                            : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                        )}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>

                  {rescheduleError && (
                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-2 rounded-md mt-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{rescheduleError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row: Status (2 cols) + Save Button (1 col) */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-zinc-800">
                {/* Status Options - Spanning 2 Columns */}
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-zinc-500">Status</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(["awaiting", "confirmed", "cancelled", "passed", "successful", "ghosted"] as BookingStatus[]).map(
                      (status) => {
                        const config = BOOKING_STATUS_CONFIG[status];
                        const isActive = selectedBooking.status === status;
                        return (
                          <Button
                            key={status}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(selectedBooking._id, status)}
                            disabled={isUpdating || isActive}
                            className={cn(
                              "text-[10px] font-bold border h-auto py-1.5 px-3",
                              isActive
                                ? config.color
                                : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                            )}
                          >
                            {config.label}
                          </Button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Save Button - Column 3 */}
                <div className="flex items-end">
                  <Button
                    onClick={handleReschedule}
                    disabled={isRescheduling || !rescheduleDate || !rescheduleTime}
                    className="w-full bg-blue-600 hover:bg-blue-500"
                  >
                    {isRescheduling ? (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                      <Save className="size-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: typeof CalendarIcon;
  label: string;
  value?: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className={cn("size-5", color)} />
        <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      {value !== undefined ? (
        <p className="text-2xl font-black tabular-nums">{value}</p>
      ) : (
        <Skeleton className="h-8 w-16 bg-zinc-800" />
      )}
    </motion.div>
  );
}