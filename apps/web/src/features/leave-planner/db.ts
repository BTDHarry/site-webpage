import { createCollection, localOnlyCollectionOptions } from "@tanstack/db";
import type { LeaveRequest } from "./types";

export const leaveRequestsCollection = createCollection(
	localOnlyCollectionOptions<LeaveRequest>({
		id: "leave-requests",
		getKey: (request) => request.id,
		autoIndex: "eager",
	}),
);

leaveRequestsCollection.createIndex((row) => row.userId, {
	name: "leave-requests-user",
});
leaveRequestsCollection.createIndex((row) => row.type, {
	name: "leave-requests-type",
});
leaveRequestsCollection.createIndex((row) => row.submittedAt, {
	name: "leave-requests-submitted",
});

export function syncLeaveRequests(requests: LeaveRequest[]) {
	const nextById = new Map(requests.map((request) => [request.id, request]));
	const current = leaveRequestsCollection.state;

	for (const key of current.keys()) {
		if (!nextById.has(key as string)) {
			leaveRequestsCollection.delete(key as string);
		}
	}

	for (const request of requests) {
		if (leaveRequestsCollection.has(request.id)) {
			leaveRequestsCollection.update(request.id, (draft) => {
				Object.assign(draft, request);
			});
		} else {
			leaveRequestsCollection.insert(request);
		}
	}
}
