import { useLeavePlannerUsers } from "@/features/leave-planner/hooks/useLeavePlannerData";
import { getCurrentUser } from "@/features/leave-planner/utils/users";
import LeavePlannerSidebar from "./LeavePlannerSidebar";
import PlannerCalendar from "./PlannerCalendar";
import PlannerHeader from "./PlannerHeader";

type LeavePlannerProps = {
	currentUserId?: string | null;
};

function LeavePlanner({ currentUserId }: LeavePlannerProps) {
	const { data } = useLeavePlannerUsers();
	const users = data ?? [];
	const currentUser = getCurrentUser(users, currentUserId);

	return (
		<section className="relative min-h-svh min-w-svw overflow-hidden bg-linear-to-br from-stone-50 via-white to-amber-50">
			{/* background pattern */}
			<div className="absolute -left-20 top-0 size-72 rounded-full bg-amber-200/40 blur-3xl" />
			<div className="absolute -right-12 top-24 size-96 rounded-full bg-sky-200/40 blur-3xl" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.06),transparent_65%)]" />

			<div className="mx-auto flex w-full max-w-350 flex-col gap-6 px-6 py-10 lg:gap-8 lg:py-14">
				<PlannerHeader currentUser={currentUser} />
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start">
					<PlannerCalendar currentUserId={currentUserId} />
					<div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
						<LeavePlannerSidebar currentUserId={currentUserId} users={users} />
					</div>
				</div>
			</div>
		</section>
	);
}

export default LeavePlanner;
