import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	Clock,
	Sparkles,
} from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ViewMode = "month" | "week" | "day";

type LeaveEvent = {
	id: string;
	date: string;
	label: string;
	type: string;
	person: string;
	duration: string;
	tone: string;
	dot: string;
};

const viewOptions: Array<{ value: ViewMode; label: string }> = [
	{ value: "month", label: "Month" },
	{ value: "week", label: "Week" },
	{ value: "day", label: "Day" },
];

const leaveTypes = [
	"Annual Leave",
	"Sick Leave",
	"Personal Leave",
	"Remote Work",
];

const monthFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
});
const longDateFormatter = new Intl.DateTimeFormat("en-US", {
	weekday: "long",
	month: "short",
	day: "numeric",
});

export function LeaveCalendar() {
	const today = React.useMemo(() => new Date(), []);
	const [view, setView] = React.useState<ViewMode>("month");
	const [focusDate, setFocusDate] = React.useState<Date>(today);
	const [range, setRange] = React.useState<DateRange | undefined>({
		from: addDays(today, 2),
		to: addDays(today, 5),
	});
	const [leaveType, setLeaveType] = React.useState(leaveTypes[0]);

	const events = React.useMemo(() => createSampleEvents(today), [today]);
	const eventsByDate = React.useMemo(() => groupEventsByDate(events), [events]);
	const monthCells = React.useMemo(() => getMonthCells(focusDate), [focusDate]);
	const weekDays = React.useMemo(() => getWeekDays(focusDate), [focusDate]);

	const focusKey = toDateKey(focusDate);
	const focusEvents = eventsByDate.get(focusKey) ?? [];
	const monthLabel = monthFormatter.format(focusDate);
	const startValue = range?.from ? shortDateFormatter.format(range.from) : "";
	const endValue = range?.to ? shortDateFormatter.format(range.to) : "";

	return (
		<section
			className="relative min-h-screen overflow-hidden bg-gradient-to-br from-stone-50 via-white to-amber-50"
			style={{ fontFamily: "var(--font-display)" }}
		>
			<div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
			<div className="absolute -right-12 top-24 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.06),transparent_65%)]" />

			<div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:gap-8 lg:py-14">
				<header className="flex flex-wrap items-end justify-between gap-4">
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
							Leave Planner
						</p>
						<h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
							Time Off Calendar
						</h1>
						<p className="max-w-xl text-sm text-muted-foreground">
							Track team availability, compare month and week views, and submit
							new time off requests in one place.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Badge
							variant="secondary"
							className="border border-border/60 bg-white/80 px-3 py-1.5 text-xs text-foreground shadow-sm"
						>
							12 days available
						</Badge>
						<Button className="shadow-sm">
							<Sparkles className="mr-1 h-4 w-4" />
							New Request
						</Button>
					</div>
				</header>

				<div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
					<Card className="border border-border/60 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur">
						<CardHeader className="gap-4 border-b border-border/60">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div>
									<CardTitle className="text-lg">Leave Calendar</CardTitle>
									<CardDescription>
										Switch between month, week, and day views.
									</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="icon-sm"
										onClick={() => setFocusDate(addMonths(focusDate, -1))}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<div className="min-w-[140px] text-center text-sm font-medium">
										{monthLabel}
									</div>
									<Button
										variant="outline"
										size="icon-sm"
										onClick={() => setFocusDate(addMonths(focusDate, 1))}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-3">
								<div className="flex rounded-full border border-border/60 bg-white/80 p-1 shadow-sm">
									{viewOptions.map((option) => (
										<Button
											key={option.value}
											variant={view === option.value ? "secondary" : "ghost"}
											size="sm"
											className={cn(
												"rounded-full px-3 text-xs",
												view === option.value && "shadow-sm",
											)}
											onClick={() => setView(option.value)}
										>
											{option.label}
										</Button>
									))}
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="text-xs"
									onClick={() => setFocusDate(today)}
								>
									Today
								</Button>
								<div className="ml-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
									<span className="uppercase tracking-[0.2em]">Legend</span>
									<LegendPill color="bg-emerald-500" label="Annual" />
									<LegendPill color="bg-rose-500" label="Sick" />
									<LegendPill color="bg-sky-500" label="Remote" />
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-6 pt-6">
							{view === "month" && (
								<div className="space-y-4">
									<div className="grid grid-cols-7 gap-2 text-xs uppercase text-muted-foreground">
										{weekDays.map((day) => (
											<div key={toDateKey(day)} className="px-2">
												{weekdayFormatter.format(day)}
											</div>
										))}
									</div>
									<div className="grid grid-cols-7 gap-2">
										{monthCells.map(({ date, inMonth }) => {
											const dateKey = toDateKey(date);
											const dayEvents = eventsByDate.get(dateKey) ?? [];
											const isToday = isSameDay(date, today);
											const isInRange = isWithinRange(date, range);
											const isFocused = isSameDay(date, focusDate);

											return (
												<button
													key={dateKey}
													type="button"
													onClick={() => setFocusDate(date)}
													className={cn(
														"group flex min-h-[96px] flex-col rounded-xl border border-transparent bg-white/70 p-2 text-left text-xs transition hover:border-border/70 hover:bg-white",
														!inMonth && "text-muted-foreground/60",
														isInRange && "bg-primary/5",
														isFocused &&
															"border-primary/40 ring-1 ring-primary/20",
														isToday && "border-amber-300/70 bg-amber-50",
													)}
												>
													<div className="flex items-center justify-between">
														<span className="text-xs font-semibold">
															{date.getDate()}
														</span>
														{dayEvents.length > 0 && (
															<span className="text-[10px] text-muted-foreground">
																{dayEvents.length}x
															</span>
														)}
													</div>
													<div className="mt-auto flex flex-wrap items-center gap-1 pt-3">
														{dayEvents.slice(0, 3).map((event) => (
															<span
																key={event.id}
																className={cn(
																	"h-2 w-2 rounded-full",
																	event.dot,
																)}
															/>
														))}
														{dayEvents.length > 3 && (
															<span className="text-[10px] text-muted-foreground">
																+{dayEvents.length - 3}
															</span>
														)}
													</div>
												</button>
											);
										})}
									</div>
								</div>
							)}

							{view === "week" && (
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
									{weekDays.map((day) => {
										const dateKey = toDateKey(day);
										const dayEvents = eventsByDate.get(dateKey) ?? [];
										return (
											<div
												key={dateKey}
												className="rounded-xl border border-border/60 bg-white/70 p-3"
											>
												<div className="flex items-center justify-between text-xs text-muted-foreground">
													<span>{weekdayFormatter.format(day)}</span>
													<span className="text-sm font-semibold text-foreground">
														{day.getDate()}
													</span>
												</div>
												<div className="mt-3 space-y-2">
													{dayEvents.length === 0 && (
														<div className="rounded-lg border border-dashed border-border/60 px-2 py-3 text-[11px] text-muted-foreground">
															No leave scheduled.
														</div>
													)}
													{dayEvents.map((event) => (
														<EventPill key={event.id} event={event} />
													))}
												</div>
											</div>
										);
									})}
								</div>
							)}

							{view === "day" && (
								<div className="space-y-4">
									<div className="rounded-xl border border-border/60 bg-white/70 p-4">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<CalendarDays className="h-4 w-4" />
											<span className="font-medium text-foreground">
												{longDateFormatter.format(focusDate)}
											</span>
										</div>
										<div className="mt-4 space-y-3">
											{focusEvents.length === 0 && (
												<div className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-sm text-muted-foreground">
													No leave scheduled for this date.
												</div>
											)}
											{focusEvents.map((event) => (
												<div
													key={event.id}
													className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-white px-3 py-2"
												>
													<div>
														<p className="text-sm font-semibold">
															{event.label}
														</p>
														<p className="text-xs text-muted-foreground">
															{event.person} - {event.duration}
														</p>
													</div>
													<Badge
														variant="secondary"
														className={cn(
															"border border-transparent px-2 text-[11px] font-semibold",
															event.tone,
														)}
													>
														{event.type}
													</Badge>
												</div>
											))}
										</div>
									</div>
									<div className="grid gap-3 sm:grid-cols-2">
										<SummaryCard
											title="Pending approvals"
											value="3 requests"
											detail="Review before Friday"
										/>
										<SummaryCard
											title="Next on leave"
											value="Maya Collins"
											detail="Starts in 2 days"
										/>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="border border-border/60 bg-white/85 shadow-lg shadow-slate-200/60 backdrop-blur">
						<CardHeader className="gap-2 border-b border-border/60">
							<CardTitle className="text-lg">Request time off</CardTitle>
							<CardDescription>
								Select a range and confirm the request details.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5 pt-6">
							<div className="rounded-xl border border-border/60 bg-amber-50/70 p-3">
								<div className="flex items-start gap-3">
									<div className="rounded-lg bg-amber-100 p-2 text-amber-700">
										<Clock className="h-4 w-4" />
									</div>
									<div>
										<p className="text-xs font-semibold uppercase text-muted-foreground">
											Balance
										</p>
										<p className="text-lg font-semibold text-foreground">
											12.5 days left
										</p>
										<p className="text-xs text-muted-foreground">
											Includes carryover until Jun 30.
										</p>
									</div>
								</div>
							</div>

							<Calendar
								mode="range"
								selected={range}
								onSelect={setRange}
								className="rounded-xl border border-border/60 bg-white"
							/>

							<FieldGroup className="gap-4">
								<Field>
									<FieldLabel>Start date</FieldLabel>
									<Input readOnly value={startValue} placeholder="Select" />
								</Field>
								<Field>
									<FieldLabel>End date</FieldLabel>
									<Input readOnly value={endValue} placeholder="Select" />
								</Field>
							</FieldGroup>

							<FieldGroup className="gap-4">
								<Field>
									<FieldLabel>Leave type</FieldLabel>
									<Select value={leaveType} onValueChange={setLeaveType}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											{leaveTypes.map((type) => (
												<SelectItem key={type} value={type}>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabel>Reason</FieldLabel>
									<Textarea
										placeholder="Add a short note"
										className="min-h-[84px]"
									/>
								</Field>
							</FieldGroup>

							<div className="space-y-3">
								<Button className="w-full">Confirm request</Button>
								<p className="text-xs text-muted-foreground">
									The request will be sent to your manager for approval.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}

function LegendPill({ color, label }: { color: string; label: string }) {
	return (
		<span className="flex items-center gap-1 text-[11px] text-muted-foreground">
			<span className={cn("h-2 w-2 rounded-full", color)} />
			{label}
		</span>
	);
}

function EventPill({ event }: { event: LeaveEvent }) {
	return (
		<div className="rounded-lg border border-border/60 bg-white/80 px-2 py-2 text-xs">
			<div className="flex items-center justify-between gap-2">
				<div>
					<div className="font-semibold text-foreground">{event.label}</div>
					<div className="text-[11px] text-muted-foreground">
						{event.person} - {event.duration}
					</div>
				</div>
				<Badge
					variant="secondary"
					className={cn("px-2 text-[10px] font-semibold", event.tone)}
				>
					{event.type}
				</Badge>
			</div>
		</div>
	);
}

function SummaryCard({
	title,
	value,
	detail,
}: {
	title: string;
	value: string;
	detail: string;
}) {
	return (
		<div className="rounded-xl border border-border/60 bg-white/70 p-4">
			<p className="text-xs font-semibold uppercase text-muted-foreground">
				{title}
			</p>
			<p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
			<p className="text-xs text-muted-foreground">{detail}</p>
		</div>
	);
}

function createSampleEvents(base: Date): LeaveEvent[] {
	const templates = [
		{
			label: "Annual Leave",
			type: "Annual",
			person: "Ava Chen",
			duration: "Full day",
			tone: "bg-emerald-500/10 text-emerald-700",
			dot: "bg-emerald-500",
		},
		{
			label: "Sick Leave",
			type: "Sick",
			person: "Leo Park",
			duration: "AM",
			tone: "bg-rose-500/10 text-rose-700",
			dot: "bg-rose-500",
		},
		{
			label: "Remote Work",
			type: "Remote",
			person: "Maya Collins",
			duration: "Full day",
			tone: "bg-sky-500/10 text-sky-700",
			dot: "bg-sky-500",
		},
		{
			label: "Personal Leave",
			type: "Personal",
			person: "Jordan Lee",
			duration: "PM",
			tone: "bg-amber-500/10 text-amber-700",
			dot: "bg-amber-500",
		},
	];
	const offsets = [-6, -3, -1, 2, 4, 7, 9, 12, 15];

	return offsets.map((offset, index) => {
		const template = templates[index % templates.length];
		const date = addDays(base, offset);
		return {
			id: `leave-${index}`,
			date: toDateKey(date),
			...template,
		};
	});
}

function groupEventsByDate(events: LeaveEvent[]) {
	const map = new Map<string, LeaveEvent[]>();
	for (const event of events) {
		const list = map.get(event.date) ?? [];
		list.push(event);
		map.set(event.date, list);
	}
	return map;
}

function getMonthCells(date: Date) {
	const year = date.getFullYear();
	const month = date.getMonth();
	const firstDay = new Date(year, month, 1);
	const startDay = firstDay.getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

	return Array.from({ length: totalCells }, (_, index) => {
		const dayNumber = index - startDay + 1;
		const cellDate = new Date(year, month, dayNumber);
		return {
			date: cellDate,
			inMonth: dayNumber >= 1 && dayNumber <= daysInMonth,
		};
	});
}

function getWeekDays(date: Date) {
	const start = startOfWeek(date);
	return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function startOfWeek(date: Date) {
	const normalized = startOfDay(date);
	const day = normalized.getDay();
	normalized.setDate(normalized.getDate() - day);
	return normalized;
}

function addMonths(date: Date, months: number) {
	const next = new Date(date);
	next.setMonth(next.getMonth() + months);
	return next;
}

function addDays(date: Date, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

function startOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	return next;
}

function isSameDay(a: Date, b?: Date) {
	if (!b) {
		return false;
	}
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function isWithinRange(date: Date, range?: DateRange) {
	if (!range?.from || !range?.to) {
		return false;
	}
	const current = startOfDay(date).getTime();
	const from = startOfDay(range.from).getTime();
	const to = startOfDay(range.to).getTime();
	return current >= from && current <= to;
}

function toDateKey(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}
