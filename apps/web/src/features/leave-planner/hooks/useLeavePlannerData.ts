import { useQuery } from "@tanstack/react-query";
import { leavePlannerQueryOptions } from "@/features/leave-planner/data";

export function useLeavePlannerData() {
	return useQuery(leavePlannerQueryOptions());
}

export function useLeavePlannerUsers() {
	return useQuery({
		...leavePlannerQueryOptions(),
		select: (plannerData) => plannerData.users,
	});
}
