import LeaveTag from "./LeaveTag";

function CalendarHeader() {
	return (
		<div>
			{/* 开头介绍 */}
			<header className="flex flex-col justify-between items-start gap-4">
				<div className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Leave Planner
					</p>
					<h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
						Time Off Calendar
					</h1>
				</div>

				{/* 展示目前申请的假期总数以及详细信息 */}
				<div className="flex items-center gap-3">
					<LeaveTag className="border-emerald-300/60 bg-emerald-400/50">
						🏝️ 5 days annual leave
					</LeaveTag>
					<LeaveTag className="border-b-orange-300/60 bg-orange-400/50">
						🤒 2 days sick leave
					</LeaveTag>
					<LeaveTag className="border-indigo-300/60 bg-indigo-400/50">
						🏠 2 weeks remote
					</LeaveTag>
					<LeaveTag className="border-b-cyan-300/60 bg-cyan-400/50">
						⛔️ 2 days [ohter] leave
					</LeaveTag>
				</div>
			</header>
		</div>
	);
}

export default CalendarHeader;
