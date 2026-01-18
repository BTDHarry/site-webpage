import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { eachDayOfInterval, format, isSameDay, startOfDay } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	leavePlannerQueryKey,
} from "@/features/leave-planner/data";
import { useLeavePlannerUsers } from "@/features/leave-planner/hooks/useLeavePlannerData";
import { useLeaveRange } from "@/features/leave-planner/hooks/useLeaveRange";
import {
	type LeaveType,
	leaveTypes,
} from "@/features/leave-planner/leave-types";
import type { LeavePlannerData } from "@/features/leave-planner/types";
import { toDateKey } from "@/features/leave-planner/utils/date";
import { getCurrentUser } from "@/features/leave-planner/utils/users";
import { cn } from "@/lib/utils";

type LeaveRequestTabProps = {
	currentUserId?: string | null;
	variant?: "card" | "embedded";
};

function LeaveRequestTab({
	currentUserId,
	variant = "embedded",
}: LeaveRequestTabProps) {
	const { range, setRange } = useLeaveRange();
	const [halfDay, setHalfDay] = useState<"AM" | "PM">("AM");
	const queryClient = useQueryClient();
	const { data: users } = useLeavePlannerUsers();
	const currentUser = getCurrentUser(users ?? [], currentUserId);

	const defaultLeaveType: LeaveType = leaveTypes[0]?.label ?? "Annual";
	const [leaveType, setLeaveType] = useState<LeaveType>(defaultLeaveType);

	const startDate = range?.from;
	const endDate = range?.to;
	const isSingleDay = !!startDate && !!endDate && isSameDay(startDate, endDate);
	const isSubmitDisabled = !startDate || !endDate || !currentUserId;

	const formatDate = (date?: Date) =>
		date ? format(date, "MMM d, yyyy") : "choose a date";

	const handleClearStart = () => {
		if (!endDate) {
			setRange(undefined);
			return;
		}
		setRange({ from: undefined, to: endDate });
	};
	const handleClearEnd = () => {
		if (!startDate) {
			setRange(undefined);
			return;
		}
		setRange({ from: startDate, to: undefined });
	};
	const handleSubmit = () => {
		if (!startDate || !endDate || !currentUserId) return;

		const startDay = startOfDay(startDate);
		const endDay = startOfDay(endDate);
		const isSingleDaySelection = isSameDay(startDay, endDay);
		const submittedAt = new Date();
		const requestId = `req-${submittedAt.getTime()}`;
		const partialDay = isSingleDaySelection ? halfDay : undefined;
		const nextEvents = eachDayOfInterval({
			start: startDay,
			end: endDay,
		}).map((day, index) => ({
			id: `${requestId}-event-${index}`,
			userId: currentUserId,
			date: toDateKey(day),
			type: leaveType,
			person: currentUser?.name ?? "Unknown",
			duration: isSingleDaySelection ? halfDay : "Full Day",
			status: "Pending",
		}));

		queryClient.setQueryData<LeavePlannerData>(
			leavePlannerQueryKey,
			(previous) => {
				if (!previous) return previous;
				return {
					...previous,
					requests: [
						{
							id: requestId,
							userId: currentUserId,
							type: leaveType,
							start: startDay,
							end: endDay,
							submittedAt,
							status: "Pending",
							managerId: currentUser?.managerId,
							partialDay,
						},
						...previous.requests,
					],
					events: [...previous.events, ...nextEvents],
				};
			},
		);

		setRange(undefined);
	};

	const content = (
		<div className="space-y-5">
			<div className="grid gap-4">
				<div className="grid gap-2">
					<Label htmlFor="start-date" className="px-1">
						Start Date
					</Label>
					<div className="relative">
						<Input
							readOnly
							value={formatDate(startDate)}
							className="bg-white/60 pr-9"
						/>
						{startDate && (
							<button
								type="button"
								aria-label="Clear start date"
								onClick={handleClearStart}
								className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground/70 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							>
								<HugeiconsIcon
									icon={Cancel01Icon}
									strokeWidth={2}
									className="size-4"
								/>
							</button>
						)}
					</div>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="end-date" className="px-1">
						End Date
					</Label>
					<div className="relative">
						<Input
							readOnly
							value={formatDate(endDate)}
							className="bg-white/60 pr-9"
						/>
						{endDate && (
							<button
								type="button"
								aria-label="Clear end date"
								onClick={handleClearEnd}
								className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground/70 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							>
								<HugeiconsIcon
									icon={Cancel01Icon}
									strokeWidth={2}
									className="size-4"
								/>
							</button>
						)}
					</div>
				</div>
			</div>

			{isSingleDay ? (
				<div className="space-y-2">
					<Label className="px-1">Half Day</Label>
					<ButtonGroup>
						<Button
							variant={halfDay === "AM" ? "secondary" : "ghost"}
							size="sm"
							className={cn(
								"px-4 text-xs",
								halfDay === "AM" && "bg-stone-300/60 hover:bg-stone-300/70",
							)}
							onClick={() => setHalfDay("AM")}
						>
							AM
						</Button>
						<Button
							variant={halfDay === "PM" ? "secondary" : "ghost"}
							size="sm"
							className={cn(
								"px-4 text-xs",
								halfDay === "PM" && "bg-stone-300/60 hover:bg-stone-300/70",
							)}
							onClick={() => setHalfDay("PM")}
						>
							PM
						</Button>
					</ButtonGroup>
				</div>
			) : (
				<div className="px-1 text-xs text-muted-foreground">
					{startDate && endDate
						? "Duration: Full days"
						: "Pick a start and end date on the calendar."}
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="leave-type" className="px-1">
					Leave Type
				</Label>
				<Select
					value={leaveType}
					onValueChange={(value) => setLeaveType(value as LeaveType)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select leave type" />
					</SelectTrigger>
					<SelectContent>
						{leaveTypes.map((leaveType) => (
							<SelectItem key={leaveType.label} value={leaveType.label}>
								{leaveType.emoji} {leaveType.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Button
				type="button"
				className="w-full"
				disabled={isSubmitDisabled}
				onClick={handleSubmit}
			>
				Submit Request
			</Button>
		</div>
	);

	if (variant === "embedded") {
		return content;
	}

	return (
		<Card className="w-full border border-border/60 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur lg:w-80 lg:shrink-0">
			<CardHeader className="gap-2 border-b border-border/60">
				<CardTitle className="text-lg">Request time off</CardTitle>
				<CardDescription>
					Select a range in the calendar and confirm the request details.
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-5 pt-6">{content}</CardContent>
		</Card>
	);
}

export default LeaveRequestTab;
