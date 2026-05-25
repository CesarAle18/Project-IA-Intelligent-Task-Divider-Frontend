"use client";

import { useEffect, useState } from "react";
import {
  ListChecks,
  CalendarClock,
  ShieldHalf,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RiskBadge } from "@/components/risk-badge";
import { RiskProbabilityBar } from "@/components/risk-probability-bar";
import type { PredictionResult } from "@/lib/types";

interface PredictionResultsProps {
  result: PredictionResult;
}

function CountUpNumber({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 800; // 800ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing out quad
      const easeProgress = progress * (2 - progress);

      const currentVal = Math.round(easeProgress * (end - start) + start);
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="text-3xl font-extrabold text-foreground tracking-tight">
      {displayValue}{" "}
      <span className="text-sm font-medium text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}

export function PredictionResults({ result }: PredictionResultsProps) {
  return (
    <div className="w-full max-w-[720px] mx-auto mt-8 space-y-6">
      <h3 className="text-md font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Resultados de Estimación
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sub-tareas Card */}
        <Card className="glass-premium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-slide-up stagger-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <ListChecks className="w-4 h-4" />
                </div>
                <CardTitle className="text-xs font-semibold uppercase tracking-wider">
                  Sub-tareas
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <CountUpNumber value={result.pred_tasks} suffix="tareas" />
            <div className="mt-3 pt-3 border-t border-border/40">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Intervalo de confianza (90%)
              </span>
              <span className="text-xs font-bold text-foreground bg-primary/5 px-2 py-0.5 rounded border border-primary/10 inline-block mt-1">
                {result.ci_tasks[0]} – {result.ci_tasks[1]} tareas
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tiempo estimado Card */}
        <Card className="glass-premium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-slide-up stagger-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <CardTitle className="text-xs font-semibold uppercase tracking-wider">
                  Duración
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <CountUpNumber value={result.pred_time} suffix="horas" />
            <div className="mt-3 pt-3 border-t border-border/40">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Intervalo de confianza (90%)
              </span>
              <span className="text-xs font-bold text-foreground bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 inline-block mt-1">
                {result.ci_time[0]} – {result.ci_time[1]} horas
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Nivel de riesgo Card */}
        <Card className="glass-premium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-slide-up stagger-3 md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-500">
                <ShieldHalf className="w-4 h-4" />
              </div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider">
                Riesgo Proyectado
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2 space-y-3.5">
            <div className="flex items-center justify-between">
              <RiskBadge level={result.pred_risk} size="lg" />
              {result.risk_confidence !== undefined && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Confianza</span>
                  <span className="text-sm font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                    {(result.risk_confidence * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="border-t border-border/40 pt-3">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Probabilidades por Clase
              </span>
              <RiskProbabilityBar probas={result.probas} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
