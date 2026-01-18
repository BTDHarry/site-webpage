export function formatDayCount(value: number) {
	const rounded = Math.round(value * 2) / 2;
	const label = Number.isInteger(rounded)
		? rounded.toString()
		: rounded.toFixed(1);
	return `${label} ${rounded === 1 ? "day" : "days"}`;
}
