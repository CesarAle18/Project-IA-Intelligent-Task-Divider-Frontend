"use client";

import useSWR from "swr";
import {
  TrendingDown,
  TrendingUp,
  Trophy,
  Activity,
  Target,
  Gauge,
  Sparkles,
  Clock,
  ShieldAlert,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getMetrics, mockMetrics } from "@/lib/api";
import type { MetricEntry } from "@/lib/types";
import { toast } from "sonner";

async function fetchMetrics(): Promise<MetricEntry[]> {
  try {
    return await getMetrics();
  } catch (err) {
    console.warn("Metrics API unavailable, using mock data:", err);
    // SWR will get the mock data, but we let the global banner handle the status notification
    return mockMetrics;
  }
}

function MetricCard({
  label,
  value,
  previousValue,
  format = "number",
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  previousValue?: number;
  format?: "number" | "percent";
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const displayValue =
    value !== undefined && value !== null
      ? format === "percent"
        ? `${(value * 100).toFixed(1)}%`
        : value.toFixed(2)
      : "N/A";
  const trend =
    previousValue !== undefined &&
    previousValue !== null &&
    value !== undefined &&
    value !== null
      ? value - previousValue
      : null;

  // For MAE lower is better, for R2/Accuracy higher is better
  const isPositive =
    trend !== null &&
    (label.includes("R²") || label.includes("F1") || label.includes("Accuracy")
      ? trend > 0
      : trend < 0);

  return (
    <Card
      className={`glass-premium shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up ${className}`}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">
            {displayValue}
          </span>
          {trend !== null && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {Math.abs(trend * (format === "percent" ? 100 : 1)).toFixed(2)}
                {format === "percent" && "%"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WinnerCard({
  label,
  algorithm,
  icon: Icon,
  className,
}: {
  label: string;
  algorithm: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <Card
      className={`glass-premium shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-slide-up ${className}`}
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <Trophy className="w-4.5 h-4.5" />
          </div>
          <CardTitle className="text-sm font-bold text-foreground">
            {label}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <Badge
            variant="secondary"
            className="text-xs px-2.5 py-1 font-semibold bg-muted/60 border border-border/40"
          >
            {algorithm}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-premium shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="glass-premium shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-52 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[220px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/80 rounded-2xl glass-premium animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Activity className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">
        Sin métricas registradas
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center px-4">
        Aún no hay datos de entrenamiento o históricos disponibles para
        visualizar las métricas del modelo.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const {
    data: metrics,
    isLoading,
    error,
  } = useSWR("metrics", fetchMetrics, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  if (error) {
    console.error("Dashboard error:", error);
  }

  const latestMetric = metrics?.[metrics.length - 1];
  const previousMetric =
    metrics && metrics.length > 1 ? metrics[metrics.length - 2] : undefined;

  const chartData = metrics?.map((m) => ({
    ...m,
    date: new Date(m.created_at).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <>
      <PageHeader
        title="Dashboard de Métricas"
        description="Rendimiento del entrenamiento continuo y evaluación de los modelos predictivos de Machine Learning."
      />
      <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <LoadingSkeleton />
        ) : !metrics || metrics.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <MetricCard
                label="Tasks MAE"
                value={latestMetric!.tasks_mae}
                previousValue={previousMetric?.tasks_mae}
                icon={Target}
                className="stagger-1"
              />
              <MetricCard
                label="Tasks R²"
                value={latestMetric!.tasks_r2}
                previousValue={previousMetric?.tasks_r2}
                icon={Gauge}
                className="stagger-2"
              />
              <MetricCard
                label="Risk F1-Score"
                value={latestMetric!.risk_f1}
                previousValue={previousMetric?.risk_f1}
                format="percent"
                icon={Activity}
                className="stagger-3"
              />
              <MetricCard
                label="Risk Accuracy"
                value={latestMetric!.risk_accuracy}
                previousValue={previousMetric?.risk_accuracy}
                format="percent"
                icon={Trophy}
                className="stagger-4"
              />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MAE Chart */}
              <Card className="glass-premium shadow-sm animate-slide-up stagger-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                      <Target className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-bold">
                      Evolución MAE — Regresión
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Error Absoluto Medio (Menor es mejor)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="tasksMaeGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="oklch(0.55 0.18 250)"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.55 0.18 250)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="timeMaeGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="oklch(0.65 0.14 280)"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.65 0.14 280)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border/50"
                      />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        tick={{
                          fontSize: 10,
                          fill: "currentColor",
                          opacity: 0.6,
                        }}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{
                          fontSize: 10,
                          fill: "currentColor",
                          opacity: 0.6,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tasks_mae"
                        name="Sub-tareas MAE"
                        stroke="oklch(0.55 0.18 250)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#tasksMaeGrad)"
                        dot={{ r: 4, strokeWidth: 1.5 }}
                        activeDot={{ r: 6 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="time_mae"
                        name="Duración MAE"
                        stroke="oklch(0.65 0.14 280)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#timeMaeGrad)"
                        dot={{ r: 4, strokeWidth: 1.5 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* R² Chart */}
              <Card className="glass-premium shadow-sm animate-slide-up stagger-3">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-bold">
                      Evolución R² — Regresión
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Coeficiente de Determinación (Cercano a 1.0 es mejor)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="tasksR2Grad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="oklch(0.55 0.18 250)"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.55 0.18 250)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="timeR2Grad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="oklch(0.50 0.12 220)"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.50 0.12 220)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border/50"
                      />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        tick={{
                          fontSize: 10,
                          fill: "currentColor",
                          opacity: 0.6,
                        }}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        className="text-xs"
                        tick={{
                          fontSize: 10,
                          fill: "currentColor",
                          opacity: 0.6,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tasks_r2"
                        name="Sub-tareas R²"
                        stroke="oklch(0.55 0.18 250)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#tasksR2Grad)"
                        dot={{ r: 4, strokeWidth: 1.5 }}
                        activeDot={{ r: 6 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="time_r2"
                        name="Duración R²"
                        stroke="oklch(0.50 0.12 220)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#timeR2Grad)"
                        dot={{ r: 4, strokeWidth: 1.5 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Classification Metric Chart */}
              <Card className="glass-premium shadow-sm animate-slide-up stagger-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-500">
                      <Activity className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-bold">
                      Precisión de Clasificación (Riesgo)
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Evaluación de clasificación de riesgo del proyecto
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="riskF1Grad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="oklch(0.65 0.14 280)"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.65 0.14 280)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="riskAccGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="oklch(0.50 0.12 220)"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.50 0.12 220)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border/50"
                      />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        tick={{
                          fontSize: 10,
                          fill: "currentColor",
                          opacity: 0.6,
                        }}
                      />
                      <YAxis
                        domain={[0, 1]}
                        className="text-xs"
                        tick={{
                          fontSize: 10,
                          fill: "currentColor",
                          opacity: 0.6,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="risk_f1"
                        name="Riesgo F1-Score"
                        stroke="oklch(0.65 0.14 280)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#riskF1Grad)"
                        dot={{ r: 4, strokeWidth: 1.5 }}
                        activeDot={{ r: 6 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="risk_accuracy"
                        name="Riesgo Accuracy"
                        stroke="oklch(0.50 0.12 220)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#riskAccGrad)"
                        dot={{ r: 4, strokeWidth: 1.5 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Model Winners section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
                Modelos de ML Activos (Ganadores)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <WinnerCard
                  label="Predicción de Tareas"
                  algorithm={latestMetric!.ganador_tasks}
                  icon={Sparkles}
                  className="stagger-1"
                />
                <WinnerCard
                  label="Predicción de Duración"
                  algorithm={latestMetric!.ganador_time}
                  icon={Clock}
                  className="stagger-2"
                />
                <WinnerCard
                  label="Clasificación de Riesgo"
                  algorithm={latestMetric!.ganador_risk}
                  icon={ShieldAlert}
                  className="stagger-3"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
