import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/types"

interface RiskBadgeProps {
  level: RiskLevel
  size?: "sm" | "md" | "lg"
}

const riskStyles: Record<RiskLevel, string> = {
  ALTO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  MEDIO: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  BAJO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
}

export function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full",
        riskStyles[level],
        sizeStyles[size]
      )}
    >
      {level}
    </span>
  )
}
