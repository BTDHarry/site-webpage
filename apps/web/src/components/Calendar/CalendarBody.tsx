import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import LeaveTag from "./LeaveTag";
import type { LeaveTypeItem } from "./types";

type ViewMode = "month" | "week";

const viewOptins: Array<{ value: ViewMode; label: string }> = [
	{ value: "month", label: "Month" },
	{ value: "week", label: "Week" },
];

type CalendarBodyProps = {
	leaveTypes: Array<LeaveTypeItem>;
};

function CalendarBody({ leaveTypes }: CalendarBodyProps) {
	const today = new Date();
	const [focusDate, setFocusDate] = useState<Date>(today);
	const [view, setView] = useState<ViewMode>("month");

	return (
		<div>
			{/* backdrop-blur 产生毛玻璃效果 */}
			<Card className="border border-border/60 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur">
				{/* card header */}
				<CardHeader className="flex flex-col items-center justify-center gap-5 border-b border-border/60">
					{/* description */}
					<div className="flex flex-col items-center justify-center">
						<CardTitle className="text-lg">Leave Calendar</CardTitle>
						<CardDescription>
							Switch between month and week views.
						</CardDescription>
					</div>

					{/* 月份调节 */}
					<div className="flex items-center gap-2 mx-auto">
						<Button variant="outline" size="icon-sm" onClick={() => {}}>
							<HugeiconsIcon icon={ArrowLeft02Icon} size={4} />
						</Button>
						<Button
							variant="outline"
							className="min-w-35 text-center text-sm font-medium"
						>
							[January]
						</Button>
						<Button variant="outline" size="icon-sm" onClick={() => {}}>
							<HugeiconsIcon icon={ArrowRight02Icon} size={4} />
						</Button>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						{/* 切换周月视角 */}
						<div className="rounded-full border border-border/60 bg-white/80 p-1 shadow-sm">
							{viewOptins.map((option) => (
								<Button
									key={option.value}
									onClick={() => setView(option.value)}
									size="sm"
									variant={view === option.value ? "secondary" : "ghost"}
									className={cn(
										"rounded-full px-3 text-sm",
										view === option.value
											? "shadow-sm bg-stone-300/50 hover:bg-stone-300/60"
											: "hover:bg-stone-200/60",
									)}
								>
									{option.label}
								</Button>
							))}
						</div>
						{/* 按钮回到今天 */}
						<Button
							variant="ghost"
							size="sm"
							className="text-sm"
							onClick={() => setFocusDate(today)}
						>
							Today
						</Button>
						{/* legend 展示图例 */}
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-xs font-semibold uppercase text-muted-foreground">
								Legend
							</span>
							{leaveTypes.map((leaveType) => (
								<LeaveTag key={leaveType.value} className={leaveType.color}>
									{leaveType.emoji} {leaveType.value}
								</LeaveTag>
							))}
						</div>
					</div>
				</CardHeader>
			</Card>
		</div>
	);
}

export default CalendarBody;

function addMonths(date: Date, months: number) {
	const next = new Date(date);
	next.setMonth(next.getMonth() + months);
	return next;
}
