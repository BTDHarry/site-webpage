import { createFileRoute, redirect } from "@tanstack/react-router";
import { getStoredUserId, useAuthUser } from "@/features/auth/auth";
import LeavePlanner from "@/features/leave-planner/components/LeavePlanner";
import {
	leaveCalendarSearchSchema,
	type LeaveCalendarSearch,
} from "@/features/leave-planner/search";

export const Route = createFileRoute("/leave-calendar/")({
	validateSearch: (search: Record<string, unknown>): LeaveCalendarSearch =>
		leaveCalendarSearchSchema.parse(search),
	beforeLoad: () => {
		if (typeof window === "undefined") return;
		if (!getStoredUserId()) {
			throw redirect({ to: "/login" });
		}
	},
	component: LeaveCalendar,
});

// 生成 leave-calendar 下页面内容
function LeaveCalendar() {
	const { userId } = useAuthUser();

	return (
		<div className="min-h-svh flex justify-center items-center">
			<LeavePlanner currentUserId={userId} />
		</div>
	);
}
