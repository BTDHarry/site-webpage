import { format } from "date-fns";
import type { LeaveTypeItem } from "@/features/leave-planner/leave-types";
import { formatDayCount } from "@/features/leave-planner/utils/format";
import { cn } from "@/lib/utils";
import NoticeCard from "./shared/NoticeCard";

export type UpcomingTotal = {
	type: LeaveTypeItem;
	totalDays: number;
	nextDate: Date | null;
};

type LeaveTotalsTabProps = {
	currentUserId?: string | null;
	upcomingTotals: UpcomingTotal[];
};

function LeaveTotalsTab({ currentUserId, upcomingTotals }: LeaveTotalsTabProps) {
	if (!currentUserId) {
		return (
			<NoticeCard>
				Log in to view upcoming leave totals for a specific user.
			</NoticeCard>
		);
	}

	return (
		<div className="space-y-3">
			{upcomingTotals.map((item) => (
				<div
					key={item.type.label}
					className="rounded-xl border border-border/60 bg-white/70 p-3 shadow-sm"
				>
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div className="flex items-center gap-3">
							<span
								className={cn(
									"flex size-9 items-center justify-center rounded-full border text-base",
									item.type.color,
								)}
							>
								{item.type.emoji}
							</span>
							<div>
								<div className="text-sm font-semibold">
									{item.type.label}
								</div>
								<div className="text-xs text-muted-foreground">
									Upcoming total
								</div>
							</div>
						</div>
						<div
							className={cn(
								"text-sm font-semibold",
								item.totalDays === 0 && "text-muted-foreground",
							)}
						>
							{formatDayCount(item.totalDays)}
						</div>
					</div>
					<div className="mt-2 text-xs text-muted-foreground">
						{item.nextDate
							? `Next leave: ${format(item.nextDate, "MMM d")}`
							: "No upcoming dates scheduled."}
					</div>
				</div>
			))}
		</div>
	);
}

export default LeaveTotalsTab;
