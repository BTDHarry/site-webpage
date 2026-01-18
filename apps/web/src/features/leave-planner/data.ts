import { createServerFn } from "@tanstack/react-start";
import { addDays, isBefore, startOfDay } from "date-fns";
import {
	type LeaveType,
	leaveTypes,
} from "@/features/leave-planner/leave-types";
import type {
	Duration,
	LeaveEvent,
	LeavePlannerData,
	LeaveRequest,
	LeaveSummaryItem,
	User,
} from "@/features/leave-planner/types";
import { parseDateParam, toDateKey } from "@/features/leave-planner/utils/date";
import { formatDayCount } from "@/features/leave-planner/utils/format";

const leavePlannerUsers: User[] = [
	{
		id: "user-ava",
		name: "Ava Chen",
		role: "team member",
		managerId: "user-mira",
	},
	{
		id: "user-leo",
		name: "Leo Park",
		role: "team member",
		managerId: "user-mira",
	},
	{
		id: "user-jordan",
		name: "Jordan Lee",
		role: "team member",
		managerId: "user-evan",
	},
	{
		id: "user-mira",
		name: "Mira Singh",
		role: "manager",
	},
	{
		id: "user-evan",
		name: "Evan Cho",
		role: "manager",
	},
];

const usersById = new Map(
	leavePlannerUsers.map((user) => [user.id, user.name]),
);

const getUserName = (userId: string) => usersById.get(userId) ?? "Unknown";

const eventTemplates: Array<{
	type: LeaveType;
	userId: string;
	duration: Duration;
}> = [
	{
		type: "Annual",
		userId: "user-ava",
		duration: "Full Day",
	},
	{
		type: "Sick",
		userId: "user-leo",
		duration: "AM",
	},
	{
		type: "Remote",
		userId: "user-mira",
		duration: "Full Day",
	},
	{
		type: "Other",
		userId: "user-jordan",
		duration: "PM",
	},
];

const eventOffsets = [-6, -3, -1, 2, 4, 7, 9, 12, 15];

const extraAvaEvents: Array<{
	offset: number;
	type: LeaveType;
	duration: Duration;
}> = [
	{ offset: -8, type: "Annual", duration: "Full Day" },
	{ offset: -4, type: "Remote", duration: "Full Day" },
	{ offset: 1, type: "Sick", duration: "AM" },
	{ offset: 5, type: "Annual", duration: "PM" },
	{ offset: 10, type: "Other", duration: "Full Day" },
	{ offset: 13, type: "Remote", duration: "Full Day" },
];

const createLeaveEvents = (base: Date): LeaveEvent[] => {
	const baseEvents = eventOffsets.map((offset, index) => {
		const template = eventTemplates[index % eventTemplates.length];
		const date = addDays(base, offset);
		return {
			id: `leave-${index}`,
			date: toDateKey(date),
			...template,
			person: getUserName(template.userId),
		};
	});
	const avaExtra = extraAvaEvents.map((entry, index) => {
		const date = addDays(base, entry.offset);
		return {
			id: `leave-ava-${index}`,
			date: toDateKey(date),
			userId: "user-ava",
			person: getUserName("user-ava"),
			type: entry.type,
			duration: entry.duration,
		};
	});

	return [...baseEvents, ...avaExtra];
};

const createLeaveRequests = (base: Date): LeaveRequest[] => [
	{
		id: "req-1001",
		userId: "user-ava",
		type: "Annual",
		start: addDays(base, 4),
		end: addDays(base, 8),
		submittedAt: addDays(base, -2),
		status: "Pending",
		managerId: "user-mira",
	},
	{
		id: "req-1002",
		userId: "user-ava",
		type: "Sick",
		start: addDays(base, -3),
		end: addDays(base, -3),
		submittedAt: addDays(base, -5),
		status: "Approved",
		managerId: "user-mira",
		partialDay: "AM",
	},
	{
		id: "req-1003",
		userId: "user-leo",
		type: "Sick",
		start: addDays(base, -6),
		end: addDays(base, -6),
		submittedAt: addDays(base, -7),
		status: "Approved",
		managerId: "user-mira",
		partialDay: "AM",
	},
	{
		id: "req-1004",
		userId: "user-jordan",
		type: "Remote",
		start: addDays(base, 12),
		end: addDays(base, 12),
		submittedAt: addDays(base, -4),
		status: "Declined",
		managerId: "user-evan",
	},
	{
		id: "req-1005",
		userId: "user-ava",
		type: "Other",
		start: addDays(base, 20),
		end: addDays(base, 22),
		submittedAt: addDays(base, -12),
		status: "Approved",
		managerId: "user-mira",
	},
	{
		id: "req-1006",
		userId: "user-ava",
		type: "Remote",
		start: addDays(base, 2),
		end: addDays(base, 2),
		submittedAt: addDays(base, -1),
		status: "Approved",
		managerId: "user-mira",
	},
	{
		id: "req-1007",
		userId: "user-ava",
		type: "Annual",
		start: addDays(base, 16),
		end: addDays(base, 17),
		submittedAt: addDays(base, -9),
		status: "Declined",
		managerId: "user-mira",
	},
];

const createLeavePlannerData = (baseDate: Date): LeavePlannerData => {
	const requests = createLeaveRequests(baseDate);
	const events = createLeaveEvents(baseDate);

	return {
		events,
		requests,
		summary: buildLeaveSummary(events, baseDate),
		users: leavePlannerUsers,
	};
};

const defaultLeavePlannerData = createLeavePlannerData(new Date());

const leavePlannerApiUrl =
	typeof process !== "undefined"
		? process.env.LEAVE_PLANNER_API_URL
		: undefined;

const toDate = (value: Date | string | number) =>
	value instanceof Date ? value : new Date(value);

const normalizeLeavePlannerData = (
	data: LeavePlannerData,
): LeavePlannerData => {
	const events = Array.isArray(data.events)
		? data.events
		: defaultLeavePlannerData.events;
	const requests = Array.isArray(data.requests)
		? data.requests
		: defaultLeavePlannerData.requests;
	const users = Array.isArray(data.users)
		? data.users
		: defaultLeavePlannerData.users;
	const normalizedRequests = requests.map((request) => ({
		...request,
		start: toDate(request.start),
		end: toDate(request.end),
		submittedAt: toDate(request.submittedAt),
	}));

	return {
		summary: buildLeaveSummary(events, new Date()),
		events,
		requests: normalizedRequests,
		users,
	};
};

const fetchLeavePlannerData = async () => {
	if (!leavePlannerApiUrl) return defaultLeavePlannerData;

	const response = await fetch(leavePlannerApiUrl, {
		headers: { Accept: "application/json" },
	});

	if (!response.ok) {
		throw new Error("Failed to fetch leave planner data.");
	}

	const data = (await response.json()) as LeavePlannerData;
	return normalizeLeavePlannerData(data);
};

export const getLeavePlannerData = createServerFn({
	method: "GET",
}).handler(async () => {
	try {
		return await fetchLeavePlannerData();
	} catch {
		return defaultLeavePlannerData;
	}
});

export const leavePlannerQueryKey = ["leave-planner", "mock"];

export const leavePlannerQueryOptions = () => ({
	queryKey: leavePlannerQueryKey,
	queryFn: getLeavePlannerData,
	initialData: defaultLeavePlannerData,
	staleTime: 5 * 60 * 1000,
});

export function buildLeaveSummary(
	events: LeaveEvent[],
	baseDate: Date,
): LeaveSummaryItem[] {
	const totals = new Map<LeaveType, number>(
		leaveTypes.map((type) => [type.label, 0]),
	);
	const todayStart = startOfDay(baseDate);

	for (const event of events) {
		if (event.status === "Pending") continue;
		const upcomingDays = getUpcomingEventDays(event, todayStart);
		if (upcomingDays <= 0) continue;

		totals.set(event.type, (totals.get(event.type) ?? 0) + upcomingDays);
	}

	return leaveTypes.map((type) => ({
		id: `summary-${type.label.toLowerCase().replace(/\s+/g, "-")}`,
		label: `${type.emoji} ${formatDayCount(totals.get(type.label) ?? 0)} ${type.label.toLowerCase()}`,
		className: type.color,
	}));
}

function getUpcomingEventDays(event: LeaveEvent, todayStart: Date) {
	const eventDate = parseDateParam(event.date);
	if (!eventDate) return 0;

	const start = startOfDay(eventDate);
	if (isBefore(start, todayStart)) return 0;

	return event.duration === "Full Day" ? 1 : 0.5;
}
