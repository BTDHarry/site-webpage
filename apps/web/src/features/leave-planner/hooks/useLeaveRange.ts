import { useNavigate, useSearch } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import { formatDateParam, parseDateParam } from "../utils/date";

export function useLeaveRange() {
	const search = useSearch({ from: "/leave-calendar/" });
	const navigate = useNavigate({ from: "/leave-calendar/" });

	const range = {
		from: parseDateParam(search.start),
		to: parseDateParam(search.end),
	};

	const setRange = (next: DateRange | undefined) => {
		navigate({
			search: (prev) => ({
				...prev,
				start: formatDateParam(next?.from),
				end: formatDateParam(next?.to),
			}),
		});
	};

	return { range, setRange };
}
