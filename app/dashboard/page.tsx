"use client"

import useSWR from "swr"
import { TrendingDown, TrendingUp, Trophy, Activity, Target, Gauge } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getMetrics, mockMetrics } from "@/lib/api"
import type { MetricEntry } from "@/lib/types"

async function fetchMetrics(): Promise<MetricEntry[]> {
  try {
    return await getMetrics()
  } catch {
    console.log("[v0] Using mock metrics data")
    return mockMetrics
  }
}

function MetricCard({
  label,
  value,
  previousValue,
  format = "number",
}: {
  label: string
  value: number
  previousValue?: number
  format?: "number" | "percent"
}) {
  const displayValue = format === "percent" ? `${(value * 100).toFixed(1)}%` : value.toFixed(2)
  const trend = previousValue !== undefined ? value - previousValue : null
  const isPositive = trend !== null && (label.includes("R²") || label.includes("F1") || label.includes("Accuracy") ? trend > 0 : trend < 0)

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">{displayValue}</span>
          {trend !== null && (
            <div className={`flex items-center gap-1 ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-xs font-medium">
                {Math.abs(trend * (format === "percent" ? 100 : 1)).toFixed(2)}
                {format === "percent" && "%"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function WinnerCard({ label, algorithm }: { label: string; algorithm: string }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary" className="text-sm font-medium">
          {algorithm}
        </Badge>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Activity className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">Sin métricas registradas</h3>
      <p className="text-sm text-muted-foreground">Aún no hay datos de entrenamiento disponibles</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: metrics, isLoading, error } = useSWR("metrics", fetchMetrics)

  if (error) {
    console.log("[v0] Error fetching metrics:", error)
  }

  const latestMetric = metrics?.[metrics.length - 1]
  const previousMetric = metrics && metrics.length > 1 ? metrics[metrics.length - 2] : undefined

  const chartData = metrics?.map((m) => ({
    ...m,
    date: new Date(m.timestamp).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
  }))

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Métricas de rendimiento de los modelos de IA"
      />
      <div className="p-4 md:p-6 space-y-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : !metrics || metrics.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Tasks MAE"
                value={latestMetric!.tasks_mae}
                previousValue={previousMetric?.tasks_mae}
              />
              <MetricCard
                label="Tasks R²"
                value={latestMetric!.tasks_r2}
                previousValue={previousMetric?.tasks_r2}
                format="percent"
              />
              <MetricCard
                label="Risk F1"
                value={latestMetric!.risk_f1}
                previousValue={previousMetric?.risk_f1}
                format="percent"
              />
              <MetricCard
                label="Risk Accuracy"
                value={latestMetric!.risk_accuracy}
                previousValue={previousMetric?.risk_accuracy}
                format="percent"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* MAE Chart */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm">Evolución MAE — Regresión</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Error absoluto medio por métrica</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                      <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line
                        type="monotone"
                        dataKey="tasks_mae"
                        name="Tasks MAE"
                        stroke="hsl(220, 70%, 50%)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="time_mae"
                        name="Time MAE"
                        stroke="hsl(220, 50%, 70%)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* R² Chart */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm">Evolución R² — Regresión</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Coeficiente de determinación</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 1]} className="text-xs" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line
                        type="monotone"
                        dataKey="tasks_r2"
                        name="Tasks R²"
                        stroke="hsl(220, 70%, 50%)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="time_r2"
                        name="Time R²"
                        stroke="hsl(220, 50%, 70%)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* F1/Accuracy Chart */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm">Evolución F1 / Accuracy</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Métricas de clasificación de riesgo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 1]} className="text-xs" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line
                        type="monotone"
                        dataKey="risk_f1"
                        name="Risk F1"
                        stroke="hsl(220, 70%, 50%)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="risk_accuracy"
                        name="Risk Accuracy"
                        stroke="hsl(220, 50%, 70%)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Winner Models */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">Modelos Ganadores</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WinnerCard label="Predicción de Tareas" algorithm={latestMetric!.ganador_tasks} />
                <WinnerCard label="Predicción de Tiempo" algorithm={latestMetric!.ganador_time} />
                <WinnerCard label="Clasificación de Riesgo" algorithm={latestMetric!.ganador_risk} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
