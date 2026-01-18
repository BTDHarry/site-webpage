export const leaveTypes = [
	{
		label: "Annual",
		emoji: "🏝️",
		color: "border-emerald-300/60 bg-emerald-400/50",
	},
	{
		label: "Sick",
		emoji: "🤒",
		color: "border-orange-300/60 bg-orange-400/50",
	},
	{
		label: "Remote",
		emoji: "🏠",
		color: "border-indigo-300/60 bg-indigo-400/50",
	},
	{
		label: "Other",
		emoji: "⛔️",
		color: "border-cyan-300/60 bg-cyan-400/50",
	},
] as const;

export type LeaveType = (typeof leaveTypes)[number]["label"];
export type LeaveTypeItem = (typeof leaveTypes)[number];
