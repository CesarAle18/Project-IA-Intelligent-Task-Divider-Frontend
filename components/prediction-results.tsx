"use client"

import { ListChecks, CalendarClock, ShieldHalf } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskBadge } from "@/components/risk-badge"
import { RiskProbabilityBar } from "@/components/risk-probability-bar"
import type { PredictionResult } from "@/lib/types"

interface PredictionResultsProps {
  result: PredictionResult
}

export function PredictionResults({ result }: PredictionResultsProps) {
  return (
    <div className="w-full max-w-[680px] mx-auto mt-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sub-tareas Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ListChecks className="w-4 h-4" />
              <CardTitle className="text-sm font-medium">Sub-tareas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {result.pred_tasks} <span className="text-lg font-normal text-muted-foreground">tareas</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Intervalo 90%: [{result.ci_tasks[0]} – {result.ci_tasks[1]}]
            </p>
          </CardContent>
        </Card>

        {/* Tiempo estimado Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="w-4 h-4" />
              <CardTitle className="text-sm font-medium">Tiempo estimado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {result.pred_time} <span className="text-lg font-normal text-muted-foreground">días</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Intervalo 90%: [{result.ci_time[0]} – {result.ci_time[1]}] días
            </p>
          </CardContent>
        </Card>

        {/* Nivel de riesgo Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldHalf className="w-4 h-4" />
              <CardTitle className="text-sm font-medium">Nivel de riesgo</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <RiskBadge level={result.pred_risk} size="lg" />
            <RiskProbabilityBar probas={result.probas} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
