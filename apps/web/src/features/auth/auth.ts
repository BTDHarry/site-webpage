import { useEffect, useState } from "react";

const AUTH_USER_KEY = "leave-planner-user";
const isBrowser = typeof window !== "undefined";

export const getStoredUserId = () => {
	if (!isBrowser) return null;
	return window.localStorage.getItem(AUTH_USER_KEY);
};

export const setStoredUserId = (userId: string) => {
	if (!isBrowser) return;
	window.localStorage.setItem(AUTH_USER_KEY, userId);
	window.dispatchEvent(new Event("auth:change"));
};

export const clearStoredUserId = () => {
	if (!isBrowser) return;
	window.localStorage.removeItem(AUTH_USER_KEY);
	window.dispatchEvent(new Event("auth:change"));
};

export function useAuthUser() {
	const [userId, setUserId] = useState<string | null>(() =>
		getStoredUserId(),
	);

	useEffect(() => {
		if (!isBrowser) return;
		const handleChange = () => setUserId(getStoredUserId());
		window.addEventListener("storage", handleChange);
		window.addEventListener("auth:change", handleChange);
		return () => {
			window.removeEventListener("storage", handleChange);
			window.removeEventListener("auth:change", handleChange);
		};
	}, []);

	const login = (nextUserId: string) => {
		setStoredUserId(nextUserId);
		setUserId(nextUserId);
	};

	const logout = () => {
		clearStoredUserId();
		setUserId(null);
	};

	return { userId, login, logout };
}
