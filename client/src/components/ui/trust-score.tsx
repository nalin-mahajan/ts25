import { cn } from "@/lib/utils";

interface TrustScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function TrustScore({ 
  score, 
  size = 'md', 
  showText = true 
}: TrustScoreProps) {
  // Calculate color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  // Calculate background color for the filled portion
  const getScoreBgColor = () => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    if (score >= 40) return 'bg-orange-600';
    return 'bg-red-600';
  };

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'h-1.5',
      text: 'text-xs'
    },
    md: {
      container: 'h-2',
      text: 'text-sm'
    },
    lg: {
      container: 'h-3',
      text: 'text-base'
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <div className={cn("w-24 bg-gray-200 rounded-full overflow-hidden", sizeClasses[size].container)}>
          <div 
            className={cn("h-full rounded-full", getScoreBgColor())}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        {showText && (
          <span className={cn("ml-2 font-medium", sizeClasses[size].text, getScoreColor())}>
            {score}%
          </span>
        )}
      </div>
    </div>
  );
}