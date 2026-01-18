import { format } from "date-fns";

const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateParam(value?: string) {
	if (!value || !DATE_PARAM_REGEX.test(value)) return undefined;

	const [year, month, day] = value.split("-").map(Number);
	const parsed = new Date(year, month - 1, day);

	if (Number.isNaN(parsed.getTime())) return undefined;

	return parsed;
}

export function formatDateParam(date?: Date) {
	return date ? format(date, "yyyy-MM-dd") : undefined;
}

export function toDateKey(date: Date) {
	return format(date, "yyyy-MM-dd");
}
