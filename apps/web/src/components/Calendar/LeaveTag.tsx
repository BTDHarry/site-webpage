import type { ReactNode } from "react";

import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

type LeaveTagProps = {
	children: ReactNode;
	className?: string;
};

function LeaveTag({ children, className }: LeaveTagProps) {
	return (
		<HoverCard>
			<HoverCardTrigger>
				<Badge
					variant="secondary"
					className={cn("border text-xs text-foreground shadow-sm", className)}
				>
					{children}
				</Badge>
			</HoverCardTrigger>

			<HoverCardContent className="w-auto">
				<p>2025-12-01 - 2025-12-03</p>
				<p>申请记录(不是单独的一天)</p>
			</HoverCardContent>
		</HoverCard>
	);
}

export default LeaveTag;
