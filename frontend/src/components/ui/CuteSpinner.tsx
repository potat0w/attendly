import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CuteSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CuteSpinner = ({ size = "md", className }: CuteSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      <div className={cn("absolute inset-0 rounded-full border-2 border-transparent border-t-primary/20 animate-spin", sizeClasses[size])} />
      <div className={cn("absolute inset-0 rounded-full border-2 border-transparent border-b-primary/10 animate-spin", sizeClasses[size])} style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
    </div>
  );
};
