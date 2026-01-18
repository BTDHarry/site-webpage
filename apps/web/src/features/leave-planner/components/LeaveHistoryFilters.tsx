import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { leaveTypes } from "@/features/leave-planner/leave-types";
import type {
	HistoryTimeFilter,
	HistoryTypeFilter,
} from "@/features/leave-planner/search";

const historyTimeOptions: Array<{ value: HistoryTimeFilter; label: string }> = [
	{ value: "latest", label: "Latest" },
	{ value: "oldest", label: "Oldest" },
];

const historyTypeOptions: Array<{
	value: HistoryTypeFilter;
	label: string;
	emoji?: string;
}> = [
	{ value: "all", label: "All types" },
	...leaveTypes.map((type) => ({
		value: type.label,
		label: type.label,
		emoji: type.emoji,
	})),
];

type LeaveHistoryFiltersProps = {
	historyTime: HistoryTimeFilter;
	historyType: HistoryTypeFilter;
	onTimeChange: (value: HistoryTimeFilter) => void;
	onTypeChange: (value: HistoryTypeFilter) => void;
};

function LeaveHistoryFilters({
	historyTime,
	historyType,
	onTimeChange,
	onTypeChange,
}: LeaveHistoryFiltersProps) {
	return (
		<div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
			<div className="grid flex-1 gap-1 text-xs text-muted-foreground">
				<Label className="px-1 text-xs text-muted-foreground">Time</Label>
				<Select value={historyTime} onValueChange={onTimeChange}>
					<SelectTrigger size="sm" className="w-full min-w-30">
						<SelectValue placeholder="Latest" />
					</SelectTrigger>
					<SelectContent>
						{historyTimeOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="grid flex-1 gap-1 text-xs text-muted-foreground">
				<Label className="px-1 text-xs text-muted-foreground">Type</Label>
				<Select value={historyType} onValueChange={onTypeChange}>
					<SelectTrigger size="sm" className="w-full min-w-30">
						<SelectValue placeholder="All types" />
					</SelectTrigger>
					<SelectContent>
						{historyTypeOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.emoji ? <span>{option.emoji}</span> : null}
								<span>{option.label}</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

export default LeaveHistoryFilters;
