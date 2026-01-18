import { z } from "zod";
import { type LeaveType, leaveTypes } from "@/features/leave-planner/leave-types";
import { parseDateParam } from "@/features/leave-planner/utils/date";

export const historyTimeValues = ["latest", "oldest"] as const;
export type HistoryTimeFilter = (typeof historyTimeValues)[number];

export type HistoryTypeFilter = "all" | LeaveType;

export type LeaveCalendarSearch = {
	start?: string;
	end?: string;
	historyTime?: HistoryTimeFilter;
	historyType?: HistoryTypeFilter;
};

export const isHistoryTimeFilter = (
	value: string,
): value is HistoryTimeFilter =>
	historyTimeValues.includes(value as HistoryTimeFilter);

export const isHistoryTypeFilter = (
	value: string,
): value is HistoryTypeFilter =>
	value === "all" || leaveTypes.some((type) => type.label === value);

const dateParamSchema = z.preprocess((value) => {
	if (typeof value !== "string") return undefined;
	return parseDateParam(value) ? value : undefined;
}, z.string().optional());

const historyTimeSchema: z.ZodType<HistoryTimeFilter | undefined> =
	z.preprocess((value) => {
		if (typeof value !== "string") return undefined;
		return isHistoryTimeFilter(value) ? value : undefined;
	}, z.enum(historyTimeValues).optional());

const historyTypeSchema: z.ZodType<HistoryTypeFilter | undefined> =
	z.preprocess((value) => {
		if (typeof value !== "string") return undefined;
		return isHistoryTypeFilter(value) ? value : undefined;
	}, z.string().optional());

export const leaveCalendarSearchSchema = z.object({
	start: dateParamSchema,
	end: dateParamSchema,
	historyTime: historyTimeSchema,
	historyType: historyTypeSchema,
});
