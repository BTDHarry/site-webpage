import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LeaveTagProps = {
	children: ReactNode;
	className?: string;
	size?: "sm" | "lg";
};

export default function LeaveTag({
	children,
	className,
	size = "sm",
}: LeaveTagProps) {
	return (
		<Badge
			variant="secondary"
			className={cn(
				"min-w-0 max-w-full shrink border text-foreground shadow-sm truncate",
				size === "sm" && "h-5 gap-1 px-2 text-[11px]",
				size === "lg" && "h-9 gap-2 px-4 text-xs sm:text-sm",
				className,
			)}
		>
			{children}
		</Badge>
	);
}
