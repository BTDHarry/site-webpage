import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthUser } from "@/features/auth/auth";
import { useLeavePlannerUsers } from "@/features/leave-planner/hooks/useLeavePlannerData";
import { getCurrentUser } from "@/features/leave-planner/utils/users";

const loginSchema = z.object({
	username: z.string().min(1, "Please enter a username."),
	password: z.string().min(1, "Please enter a password."),
});

export const Route = createFileRoute("/login/")({
	component: LoginRoute,
});

function LoginRoute() {
	const navigate = useNavigate();
	const { login, userId } = useAuthUser();
	const { data: users } = useLeavePlannerUsers();
	const currentUser = getCurrentUser(users ?? [], userId);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const list = users ?? [];
	const userLookup = new Map(
		list.map((user) => [user.name.trim().toLowerCase(), user.id]),
	);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		const result = loginSchema.safeParse({ username, password });
		if (!result.success) {
			setError(result.error.issues[0]?.message ?? "Invalid credentials.");
			return;
		}

		const normalizedName = username.trim().toLowerCase();
		const matchedUserId = userLookup.get(normalizedName);
		if (!matchedUserId) {
			setError("No matching user found. Check the username.");
			return;
		}

		login(matchedUserId);
		navigate({ to: "/leave-calendar" });
	};

	return (
		<div className="min-h-svh flex items-center justify-center bg-linear-to-br from-stone-50 via-white to-amber-50 px-6 py-10">
			<Card className="w-full max-w-md border border-border/60 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur">
				<CardHeader className="gap-2 border-b border-border/60">
					<CardTitle className="text-xl">Login</CardTitle>
					<CardDescription>
						Use your username and password to access the calendar.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 pt-6">
					{currentUser ? (
						<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-white/70 p-3 text-sm text-muted-foreground">
							<span>Signed in as {currentUser.name}.</span>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => navigate({ to: "/leave-calendar" })}
							>
								Continue
							</Button>
						</div>
					) : null}

					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								value={username}
								onChange={(event) => setUsername(event.target.value)}
								placeholder="e.g. Ava Chen"
								autoComplete="username"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								placeholder="Enter any password"
								autoComplete="current-password"
							/>
						</div>

						{error ? (
							<div className="rounded-lg border border-rose-200/70 bg-rose-50/80 p-3 text-xs text-rose-700">
								{error}
							</div>
						) : null}

						<Button type="submit" className="w-full">
							Log in
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
