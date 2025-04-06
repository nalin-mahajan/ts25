import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  linkText: string;
  linkUrl: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  linkText,
  linkUrl
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          </div>
          <div className={cn("p-2 rounded-full", iconBg)}>
            <div className={cn("w-8 h-8 flex items-center justify-center", iconColor)}>
              {icon}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Link href={linkUrl}>
            <Button variant="link" className="p-0 h-auto text-sm font-medium">
              {linkText}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}