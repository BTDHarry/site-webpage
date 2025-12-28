import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="min-h-svh flex justify-center items-center">
			<p className="font-bold text-7xl text-indigo-500">
				Welcome to Shanghai Site Webpage
			</p>
		</div>
	);
}
