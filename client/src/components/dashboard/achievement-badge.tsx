import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  name: string;
  icon: string;
  achieved: boolean;
}

export default function AchievementBadge({ name, icon, achieved }: AchievementBadgeProps) {
  return (
    <div className="text-center">
      <div 
        className={cn(
          "mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-2",
          achieved 
            ? "bg-primary text-white" 
            : "bg-gray-100 text-gray-400 opacity-50"
        )}
        title={achieved ? "Achieved" : "Not yet achieved"}
      >
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={cn(
        "text-sm font-medium",
        achieved ? "text-gray-900" : "text-gray-500"
      )}>
        {name}
      </p>
    </div>
  );
}