"use client";

interface RiskProbabilityBarProps {
  probas: {
    ALTO: number;
    MEDIO: number;
    BAJO: number;
  };
}

export function RiskProbabilityBar({ probas }: RiskProbabilityBarProps) {
  const bars = [
    { label: "ALTO", value: probas.ALTO, color: "bg-red-500" },
    { label: "MEDIO", value: probas.MEDIO, color: "bg-amber-500" },
    { label: "BAJO", value: probas.BAJO, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-2.5">
      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground w-12">
            {bar.label}
          </span>
          <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${bar.color} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${bar.value}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-foreground w-12 text-right">
            {bar.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}
