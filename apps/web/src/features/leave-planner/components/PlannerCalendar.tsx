import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	addDays,
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isBefore,
	isSameDay,
	isWithinInterval,
	startOfDay,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useLeavePlannerData } from "@/features/leave-planner/hooks/useLeavePlannerData";
import { useLeaveRange } from "@/features/leave-planner/hooks/useLeaveRange";
import { leaveTypes } from "@/features/leave-planner/leave-types";
import type { LeaveEvent } from "@/features/leave-planner/types";
import { toDateKey } from "@/features/leave-planner/utils/date";
import { getCurrentUser } from "@/features/leave-planner/utils/users";
import { cn } from "@/lib/utils";
import LeaveTag from "./shared/LeaveTag";
import NoticeCard from "./shared/NoticeCard";

type ViewMode = "month" | "week";

const viewOptions: Array<{ value: ViewMode; label: string }> = [
	{ value: "month", label: "Month" },
	{ value: "week", label: "Week" },
];

type PlannerCalendarProps = {
	currentUserId?: string | null;
};

// 生成月份视图的日期网格（包含前后补齐天数）
function getMonthCells(date: Date) {
	const month = date.getMonth();
	const start = startOfWeek(startOfMonth(date));
	const end = endOfWeek(endOfMonth(date));

	const days = eachDayOfInterval({ start, end });

	return days.map((d) => ({
		date: d,
		inMonth: d.getMonth() === month,
	}));
}

// 获取当前周的星期列表
function getWeekDays(date: Date) {
	const start = startOfWeek(startOfDay(date));
	const end = addDays(start, 6);
	return eachDayOfInterval({ start, end });
}

// 判断当前日期是否落在选择范围内
function isWithinRange(date: Date, range?: { from?: Date; to?: Date }) {
	if (!range?.from || !range?.to) return false;

	const current = startOfDay(date);
	const from = startOfDay(range.from);
	const to = startOfDay(range.to);
	return isWithinInterval(current, { start: from, end: to });
}

// 将事件按日期分组，便于日历渲染
function groupEventsByDate(events: LeaveEvent[]) {
	const map = new Map<string, LeaveEvent[]>();

	for (const event of events) {
		const list = map.get(event.date) ?? [];
		list.push(event);
		map.set(event.date, list);
	}

	return map;
}

function PlannerCalendar({ currentUserId }: PlannerCalendarProps) {
	const today = new Date();
	const { range, setRange } = useLeaveRange();
	const [focusDate, setFocusDate] = useState<Date>(range?.from ?? today);

	const [view, setView] = useState<ViewMode>("month");
	const [monthPickerOpen, setMonthPickerOpen] = useState(false);
	const [monthPickerYear, setMonthPickerYear] = useState(
		focusDate.getFullYear(),
	);
	const { data } = useLeavePlannerData();

	const todayStart = startOfDay(today);
	const monthLabel = format(focusDate, "MMMM yyyy");
	const monthCells = getMonthCells(focusDate);
	const weekDays = getWeekDays(focusDate);
	const users = data?.users ?? [];
	const currentUser = getCurrentUser(users, currentUserId);
	const events = currentUserId
		? (data?.events ?? []).filter((event) => event.userId === currentUserId)
		: [];
	const eventsByDate = groupEventsByDate(events);
	const isUserLocked = !currentUserId;
	const showViewToggle = currentUser?.role === "manager";
	const pendingTagClassName =
		"border-slate-300/70 bg-slate-200/70 text-slate-700";

	const renderEventTag = (event: LeaveEvent) => {
		const leaveType =
			leaveTypes.find((type) => type.label === event.type) ?? leaveTypes[0];
		const tagClassName =
			event.status === "Pending" ? pendingTagClassName : leaveType.color;
		const durationLabel =
			event.duration === "Full Day" ? null : event.duration;

		return (
			<LeaveTag
				key={event.id}
				className={cn("w-full justify-center", tagClassName)}
			>
				<span>{leaveType.emoji}</span>
				<span>{leaveType.label}</span>
				{durationLabel && (
					<span className="text-[10px] font-semibold uppercase text-slate-600/80">
						{durationLabel}
					</span>
				)}
			</LeaveTag>
		);
	};

	// 不可选日期：今天之前或已有请假事件
	const isBlockedDate = (date: Date) => {
		if (isUserLocked) return true;
		const current = startOfDay(date);
		if (isBefore(current, todayStart)) return true;
		return eventsByDate.has(toDateKey(current));
	};

	// 选中范围内是否包含不可选日期
	const rangeHasBlockedDates = (start: Date, end: Date) => {
		const days = eachDayOfInterval({
			start: startOfDay(start),
			end: startOfDay(end),
		});

		return days.some((day) => isBlockedDate(day));
	};

	useEffect(() => {
		if (range?.from) setFocusDate(range.from);
	}, [range?.from]);

	// 日历点击选择逻辑：阻止非法日期、维护范围选择
	const handleDaySelect = (date: Date) => {
		if (isUserLocked) return;
		if (isBlockedDate(date)) return;

		if (!range?.from && range?.to) {
			const [start, end] = isBefore(date, range.to)
				? [date, range.to]
				: [range.to, date];

			if (rangeHasBlockedDates(start, end)) return;

			setFocusDate(date);
			setRange({ from: start, to: end });
			return;
		}

		if (!range?.from || range?.to || isBlockedDate(range.from)) {
			setFocusDate(date);
			setRange({ from: date, to: undefined });
			return;
		}

		const [start, end] = isBefore(date, range.from)
			? [date, range.from]
			: [range.from, date];

		if (rangeHasBlockedDates(start, end)) return;

		setFocusDate(date);
		setRange({ from: start, to: end });
	};

	return (
		<div>
			{/* backdrop-blur 产生毛玻璃效果 */}
			<Card className="flex w-full flex-col border border-border/60 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur lg:h-[780px] lg:w-[920px] lg:shrink-0">
				{/* card header */}
				<CardHeader className="gap-4 border-b border-border/60">
					<div className="flex flex-wrap items-center gap-3">
						<CardTitle className="text-2xl font-semibold">
							Time Off Calendar
						</CardTitle>

						<div className="flex flex-wrap items-center gap-2 sm:ml-auto">
							{/* 月份调节 */}
							<ButtonGroup>
								<Button
									size="sm"
									variant="outline"
									onClick={() => setFocusDate(addMonths(focusDate, -1))}
								>
									<HugeiconsIcon icon={ArrowLeft02Icon} size={4} />
								</Button>

								<Popover
									open={monthPickerOpen}
									onOpenChange={(open) => {
										setMonthPickerOpen(open);
										if (open) {
											setMonthPickerYear(focusDate.getFullYear());
										}
									}}
								>
									<PopoverTrigger asChild>
										<Button
											size="sm"
											variant="outline"
											className="min-w-35 text-center text-sm font-medium"
										>
											{monthLabel}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-64 p-3" align="center">
										<div className="flex items-center justify-between">
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => setMonthPickerYear((prev) => prev - 1)}
												aria-label="Previous year"
											>
												<HugeiconsIcon icon={ArrowLeft02Icon} size={4} />
											</Button>
											<div className="text-sm font-semibold">
												{monthPickerYear}
											</div>
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => setMonthPickerYear((prev) => prev + 1)}
												aria-label="Next year"
											>
												<HugeiconsIcon icon={ArrowRight02Icon} size={4} />
											</Button>
										</div>
										<div className="mt-3 grid grid-cols-3 gap-2">
											{Array.from({ length: 12 }, (_, index) => {
												const date = new Date(monthPickerYear, index, 1);
												const isActive =
													focusDate.getFullYear() === monthPickerYear &&
													focusDate.getMonth() === index;

												return (
													<Button
														key={`${monthPickerYear}-${index}`}
														variant={isActive ? "secondary" : "ghost"}
														size="sm"
														className={cn(
															"justify-center text-xs",
															isActive &&
																"bg-stone-300/60 hover:bg-stone-300/70",
														)}
														onClick={() => {
															setFocusDate(date);
															setMonthPickerOpen(false);
														}}
													>
														{format(date, "MMM")}
													</Button>
												);
											})}
										</div>
									</PopoverContent>
								</Popover>
								<Button
									size="sm"
									variant="outline"
									onClick={() => setFocusDate(addMonths(focusDate, 1))}
								>
									<HugeiconsIcon icon={ArrowRight02Icon} size={4} />
								</Button>
							</ButtonGroup>

							{/* 切换周月视角 */}
							{showViewToggle ? (
								<div className="rounded-full border border-border/60 bg-white/80 p-1 shadow-sm">
									{viewOptions.map((option) => (
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
							) : null}

							{/* 按钮回到今天 */}
							<Button
								variant="outline"
								size="sm"
								className="text-sm"
								onClick={() => setFocusDate(today)}
							>
								Today
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent className="min-h-0 flex-1 space-y-6 overflow-auto pt-6">
					{isUserLocked && (
						<NoticeCard>
							Log in to view time off events for a specific user.
						</NoticeCard>
					)}
					{/* 具体的星期标识 SUN - SAT */}
					<div className="space-y-4">
						<div className="grid grid-cols-7 gap-2 text-xs uppercase text-muted-foreground">
							{weekDays.map((day) => (
								<div key={toDateKey(day)} className="px-2">
									{format(day, "EEE")}
								</div>
							))}
						</div>

						{/* 生成日历网格 */}
						<div className="grid grid-cols-7 gap-2">
							{monthCells.map(({ date, inMonth }) => {
								const dateKey = toDateKey(date);
								const dayEvents = eventsByDate.get(dateKey) ?? [];
								const isToday = isSameDay(date, today);
								const isFocused = !range?.from && isSameDay(date, focusDate);
								const isBeforeToday = isBefore(date, startOfDay(today));
								const isInRange = isWithinRange(date, range);
								const isRangeStart =
									// 两次取反强制结果是 bool，而不是 undefined
									!!range?.from && isSameDay(date, range.from);
								const isRangeEnd = !!range?.to && isSameDay(date, range.to);
								const isRangeEdge = isRangeStart || isRangeEnd;
								const isDisabled = isBlockedDate(date);
								const displayEvents = dayEvents.slice(0, 3);

								return (
									<button
										key={dateKey}
										type="button"
										disabled={isDisabled}
										onClick={() => handleDaySelect(date)}
										className={cn(
											"group relative flex min-h-24 flex-col rounded-xl border border-transparent bg-primary/5 p-2 text-left text-xs transition",
											!isDisabled && "hover:border-border/70 hover:bg-white",
											!inMonth && "text-muted-foreground/60 bg-white",
											isInRange && "border-primary/30 bg-primary/10",
											isRangeEdge && "border-primary/60 ring-1 ring-primary/20",
											isFocused && "border-primary/40 ring-1 ring-primary/20",
											isToday && "border-amber-300/70 bg-amber-50",
											isBeforeToday &&
												"opacity-50 hover:border-transparent hover:bg-primary/5",
											isDisabled && "cursor-not-allowed",
										)}
									>
										<div className="flex items-center justify-between">
											<span className="text-xs font-semibold">
												{date.getDate()}
											</span>
										</div>

										{/* 生成对应的请假图例 */}
										<div className="mt-2 flex flex-1 flex-col">
											<div className="mt-auto flex flex-col gap-1">
												{displayEvents.map(renderEventTag)}
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default PlannerCalendar;
