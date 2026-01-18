import type { User } from "@/features/leave-planner/types";

export function getCurrentUser(
	users: User[],
	currentUserId?: string | null,
) {
	if (!currentUserId) return null;
	return users.find((user) => user.id === currentUserId) ?? null;
}
