import type { ReactNode } from "react";

type NoticeCardProps = {
	children: ReactNode;
};

export default function NoticeCard({ children }: NoticeCardProps) {
	return (
		<div className="rounded-lg border border-dashed border-border/70 bg-white/60 p-3 text-xs text-muted-foreground">
			{children}
		</div>
	);
}
