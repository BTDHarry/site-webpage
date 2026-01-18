import { and, eq } from "@tanstack/db";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { isBefore, startOfDay } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	leaveRequestsCollection,
	syncLeaveRequests,
} from "@/features/leave-planner/db";
import { useLeavePlannerData } from "@/features/leave-planner/hooks/useLeavePlannerData";
import { type LeaveType, leaveTypes } from "@/features/leave-planner/leave-types";
import type {
	HistoryTimeFilter,
	HistoryTypeFilter,
} from "@/features/leave-planner/search";
import type { LeaveEvent, LeaveRequest, User } from "@/features/leave-planner/types";
import { parseDateParam } from "@/features/leave-planner/utils/date";
import { cn } from "@/lib/utils";
import LeaveHistoryFilters from "./LeaveHistoryFilters";
import LeaveHistoryTab from "./LeaveHistoryTab";
import LeaveRequestTab from "./LeaveRequestTab";
import LeaveTotalsTab, { type UpcomingTotal } from "./LeaveTotalsTab";

type UpcomingEvent = {
	type: LeaveType;
	eventDate: Date;
	dayValue: number;
};

function sortRequestsByTime(
	requests: LeaveRequest[],
	order: HistoryTimeFilter,
) {
	const direction = order === "latest" ? -1 : 1;
	return [...requests].sort(
		(a, b) => direction * (a.submittedAt.getTime() - b.submittedAt.getTime()),
	);
}

function toUpcomingEvent(
	event: LeaveEvent,
	todayStart: Date,
): UpcomingEvent | null {
	if (event.status === "Pending") return null;
	const eventDate = parseDateParam(event.date);
	if (!eventDate) return null;
	const eventStart = startOfDay(eventDate);
	if (isBefore(eventStart, todayStart)) return null;
	const dayValue = event.duration === "Full Day" ? 1 : 0.5;
	return { type: event.type, eventDate: eventStart, dayValue };
}

type LeavePlannerSidebarProps = {
	currentUserId?: string | null;
	users: User[];
};

function LeavePlannerSidebar({
	currentUserId,
	users,
}: LeavePlannerSidebarProps) {
	const search = useSearch({ from: "/leave-calendar/" });
	const navigate = useNavigate({ from: "/leave-calendar/" });
	const historyTime: HistoryTimeFilter = search.historyTime ?? "latest";
	const historyType: HistoryTypeFilter = search.historyType ?? "all";
	const { data } = useLeavePlannerData();
	const requestItems = data?.requests ?? [];
	const eventItems = data?.events ?? [];
	const [activeTab, setActiveTab] = useState<
		"history" | "totals" | "request"
	>("request");
	const [requests, setRequests] = useState<LeaveRequest[]>([]);
	const requestMapRef = useRef<Map<string, LeaveRequest>>(new Map());
	const hasAnyRequests = useMemo(() => {
		if (!currentUserId) return false;
		return requestItems.some((request) => request.userId === currentUserId);
	}, [currentUserId, requestItems]);
	const upcomingTotals = useMemo<UpcomingTotal[]>(() => {
		if (!currentUserId) return [];
		const todayStart = startOfDay(new Date());
		const upcomingEvents = eventItems
			.filter((event) => event.userId === currentUserId)
			.map((event) => toUpcomingEvent(event, todayStart))
			.filter((event): event is UpcomingEvent => event !== null);

		return leaveTypes.map((type) => {
			const typeEvents = upcomingEvents.filter(
				(event) => event.type === type.label,
			);
			const totalDays = typeEvents.reduce(
				(sum, event) => sum + event.dayValue,
				0,
			);
			const nextDate = typeEvents.reduce<Date | null>(
				(earliest, event) =>
					!earliest || event.eventDate < earliest
						? event.eventDate
						: earliest,
				null,
			);

			return { type, totalDays, nextDate };
		});
	}, [currentUserId, eventItems]);

	useEffect(() => {
		syncLeaveRequests(requestItems);
	}, [requestItems]);

	useEffect(() => {
		requestMapRef.current = new Map();
		setRequests([]);

		if (!currentUserId) return;

		const where = (row) => {
			const userMatch = eq(row.userId, currentUserId);
			if (historyType === "all") return userMatch;
			return and(userMatch, eq(row.type, historyType));
		};

		const subscription = leaveRequestsCollection.subscribeChanges(
			(changes) => {
				const map = requestMapRef.current;
				for (const change of changes) {
					const key = String(change.key);
					if (change.type === "delete") {
						map.delete(key);
						continue;
					}
					if (change.value) {
						map.set(key, change.value);
					}
				}
				setRequests(Array.from(map.values()));
			},
			{ includeInitialState: true, where },
		);

		return () => subscription.unsubscribe();
	}, [currentUserId, historyType]);

	const visibleRequests = useMemo(
		() => sortRequestsByTime(requests, historyTime),
		[requests, historyTime],
	);
	const handleTimeChange = (value: HistoryTimeFilter) => {
		navigate({
			search: (prev) => ({
				...prev,
				historyTime: value,
			}),
		});
	};
	const handleTypeChange = (value: HistoryTypeFilter) => {
		navigate({
			search: (prev) => ({
				...prev,
				historyType: value,
			}),
		});
	};
	const headerTitle =
		activeTab === "history"
			? "Request history"
			: activeTab === "totals"
				? "Upcoming leave totals"
				: "Request time off";
	const headerDescription =
		activeTab === "history"
			? "Track submitted requests and manager decisions."
			: activeTab === "totals"
				? "Review scheduled time off by leave type."
				: "Select a range in the calendar and confirm the request details.";

	return (
		<Card className="flex w-full flex-col border border-border/60 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur lg:h-[780px]">
			<CardHeader className="gap-3 border-b border-border/60">
				<div className="space-y-1">
					<CardTitle className="text-lg">{headerTitle}</CardTitle>
					<CardDescription>{headerDescription}</CardDescription>
				</div>
				<ButtonGroup className="w-full">
					<Button
						type="button"
						variant={activeTab === "request" ? "secondary" : "ghost"}
						size="sm"
						className={cn(
							"flex-1 px-3 text-[11px] sm:text-xs",
							activeTab === "request" &&
								"bg-stone-300/60 hover:bg-stone-300/70",
						)}
						onClick={() => setActiveTab("request")}
					>
						Request
					</Button>
					<Button
						type="button"
						variant={activeTab === "history" ? "secondary" : "ghost"}
						size="sm"
						className={cn(
							"flex-1 px-3 text-[11px] sm:text-xs",
							activeTab === "history" &&
								"bg-stone-300/60 hover:bg-stone-300/70",
						)}
						onClick={() => setActiveTab("history")}
					>
						History
					</Button>
					<Button
						type="button"
						variant={activeTab === "totals" ? "secondary" : "ghost"}
						size="sm"
						className={cn(
							"flex-1 px-3 text-[11px] sm:text-xs",
							activeTab === "totals" &&
								"bg-stone-300/60 hover:bg-stone-300/70",
						)}
						onClick={() => setActiveTab("totals")}
					>
						Totals
					</Button>
				</ButtonGroup>
				{activeTab === "history" ? (
					<LeaveHistoryFilters
						historyTime={historyTime}
						historyType={historyType}
						onTimeChange={handleTimeChange}
						onTypeChange={handleTypeChange}
					/>
				) : null}
			</CardHeader>

			<CardContent className="min-h-0 flex-1 space-y-3 overflow-auto pt-5">
				{activeTab === "request" ? (
					<LeaveRequestTab currentUserId={currentUserId} />
				) : activeTab === "history" ? (
					<LeaveHistoryTab
						currentUserId={currentUserId}
						visibleRequests={visibleRequests}
						hasAnyRequests={hasAnyRequests}
						users={users}
					/>
				) : (
					<LeaveTotalsTab
						currentUserId={currentUserId}
						upcomingTotals={upcomingTotals}
					/>
				)}
			</CardContent>
		</Card>
	);
}

export default LeavePlannerSidebar;
