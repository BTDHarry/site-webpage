export type LeaveType = "annual leave" | "sick leave" | "remote" | "other";

export type LeaveTypeItem = {
	value: LeaveType;
	emoji: string;
	color: string;
};
