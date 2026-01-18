import type { User } from "@/features/leave-planner/types";

type PlannerHeaderProps = {
	currentUser: User | null;
};

function PlannerHeader({ currentUser }: PlannerHeaderProps) {
	const welcomeLabel = currentUser
		? `Welcome, ${currentUser.name}`
		: "Welcome";

	return (
		<div>
			<header className="flex flex-col gap-4">
				<h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
					{welcomeLabel}
				</h1>
			</header>
		</div>
	);
}

export default PlannerHeader;
