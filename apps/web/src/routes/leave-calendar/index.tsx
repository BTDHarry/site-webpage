import { createFileRoute } from "@tanstack/react-router";
import Calendar from "@/components/Calendar/Calendar";

export const Route = createFileRoute("/leave-calendar/")({
	component: LeaveCalendar,
});

// 生成 leave-calendar 下页面内容
function LeaveCalendar() {
	return (
		<div className="min-h-svh flex justify-center items-center">
			<Calendar />
		</div>
	);
}
