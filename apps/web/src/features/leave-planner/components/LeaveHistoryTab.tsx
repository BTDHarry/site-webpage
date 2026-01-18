import { differenceInCalendarDays, format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { leaveTypes } from "@/features/leave-planner/leave-types";
import type {
	LeaveRequest,
	RequestStatus,
	User,
} from "@/features/leave-planner/types";
import { cn } from "@/lib/utils";
import LeaveTag from "./shared/LeaveTag";
import NoticeCard from "./shared/NoticeCard";

const statusStyles: Record<RequestStatus, { className: string; dot: string }> =
	{
		Pending: {
			className: "border-amber-200/80 bg-amber-50 text-amber-900",
			dot: "bg-amber-500",
		},
		Approved: {
			className: "border-emerald-200/80 bg-emerald-50 text-emerald-900",
			dot: "bg-emerald-500",
		},
		Declined: {
			className: "border-rose-200/80 bg-rose-50 text-rose-900",
			dot: "bg-rose-500",
		},
	};

function formatRange(start: Date, end: Date) {
	if (isSameDay(start, end)) return format(start, "MMM d, yyyy");
	const sameYear = start.getFullYear() === end.getFullYear();
	const startLabel = format(start, sameYear ? "MMM d" : "MMM d, yyyy");
	return `${startLabel} - ${format(end, "MMM d, yyyy")}`;
}

function getDurationLabel(request: LeaveRequest) {
	if (request.partialDay) return request.partialDay;
	if (isSameDay(request.start, request.end)) return "Full day";
	const days = differenceInCalendarDays(request.end, request.start) + 1;
	return `${days} days`;
}

type LeaveHistoryTabProps = {
	currentUserId?: string | null;
	visibleRequests: LeaveRequest[];
	hasAnyRequests: boolean;
	users: User[];
};

function LeaveHistoryTab({
	currentUserId,
	visibleRequests,
	hasAnyRequests,
	users,
}: LeaveHistoryTabProps) {
	if (!currentUserId) {
		return (
			<NoticeCard>
				Log in to view request history for a specific user.
			</NoticeCard>
		);
	}

	if (visibleRequests.length === 0) {
		return (
			<NoticeCard>
				{hasAnyRequests
					? "No requests match the selected filters."
					: "No requests yet for this user."}
			</NoticeCard>
		);
	}

	return (
		<div className="space-y-3">
			{visibleRequests.map((request) => {
				const leaveType =
					leaveTypes.find((type) => type.label === request.type) ??
					leaveTypes[0];
				const statusStyle = statusStyles[request.status];
				const durationLabel = getDurationLabel(request);
				const managerName = request.managerId
					? users.find((user) => user.id === request.managerId)?.name
					: undefined;
				const note =
					request.status === "Pending"
						? "Awaiting manager review"
						: `${request.status} by ${managerName ?? "Manager"}`;

				return (
					<div
						key={request.id}
						className="rounded-xl border border-border/60 bg-white/70 p-3 shadow-sm"
					>
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div>
								<div className="text-sm font-semibold">
									{formatRange(request.start, request.end)}
								</div>
								<div className="text-xs text-muted-foreground">
									Submitted {format(request.submittedAt, "MMM d")}
								</div>
							</div>
							<Badge
								variant="outline"
								className={cn(
									"gap-2 border text-xs font-semibold",
									statusStyle.className,
								)}
							>
								<span
									className={cn(
										"size-1.5 rounded-full",
										statusStyle.dot,
									)}
								/>
								{request.status}
							</Badge>
						</div>
						<div className="mt-3 flex flex-wrap items-center gap-2">
							<LeaveTag className={leaveType.color}>
								<span>{leaveType.emoji}</span>
								<span>{leaveType.label}</span>
							</LeaveTag>
							<span className="text-xs text-muted-foreground">
								{durationLabel}
							</span>
						</div>
						<div className="mt-2 text-xs text-muted-foreground">
							{note}
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default LeaveHistoryTab;
