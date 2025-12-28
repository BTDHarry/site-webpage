import CalendarBody from "./CalendarBody";
import CalendarHeader from "./CalendarHeader";
import type { LeaveTypeItem } from "./types";

const leaveTypes: Array<LeaveTypeItem> = [
	{
		value: "annual leave",
		emoji: "🏝️",
		color: "border-emerald-300/60 bg-emerald-400/50",
	},
	{
		value: "sick leave",
		emoji: "🤒",
		color: "border-orange-300/60 bg-orange-400/50",
	},
	{
		value: "remote",
		emoji: "🏠",
		color: "border-indigo-300/60 bg-indigo-400/50",
	},
	{
		value: "other",
		emoji: "⛔️",
		color: "border-cyan-300/60 bg-cyan-400/50",
	},
];

function Calendar() {
	return (
		<section className="min-h-svh border-2">
			{/* background pattern */}

			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:gap-8 lg:py-14">
				<CalendarHeader />
				<CalendarBody leaveTypes={leaveTypes} />
			</div>
		</section>
	);
}

export default Calendar;
