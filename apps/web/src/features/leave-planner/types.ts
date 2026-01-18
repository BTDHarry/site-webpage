import type { LeaveType } from "./leave-types";

export type RequestStatus = "Pending" | "Approved" | "Declined";

export type UserRole = "team member" | "manager";

export type User = {
	id: string;
	name: string;
	role: UserRole;
	managerId?: string;
};

export type LeaveRequest = {
	id: string;
	userId: string;
	type: LeaveType;
	start: Date;
	end: Date;
	submittedAt: Date;
	status: RequestStatus;
	managerId?: string;
	partialDay?: "AM" | "PM";
};

export type Duration = "Full Day" | "AM" | "PM";

export type LeaveEvent = {
	id: string;
	userId: string;
	date: string;
	type: LeaveType;
	person: string;
	duration: Duration;
	status?: RequestStatus;
};

export type LeaveSummaryItem = {
	id: string;
	label: string;
	className: string;
};

export type LeavePlannerData = {
	summary: LeaveSummaryItem[];
	events: LeaveEvent[];
	requests: LeaveRequest[];
	users: User[];
};
