"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  History,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Settings,
  Sparkles,
  Layers,
  ListTodo,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/risk-badge";
import { RiskProbabilityBar } from "@/components/risk-probability-bar";
import { getHistory, mockHistoryResponse } from "@/lib/api";
import type { HistoryEntry, HistoryResponse } from "@/lib/types";

async function fetchHistory(page: number): Promise<HistoryResponse> {
  try {
    return await getHistory(page, 10);
  } catch (err) {
    console.warn("History API offline, using mock history data:", err);
    return mockHistoryResponse;
  }
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-b-0">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground/75" />}
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 py-2">
      <div className="flex justify-between items-center pb-2 border-b">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/12" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between gap-4">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/80 rounded-2xl glass-premium animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <History className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">
        Sin predicciones registradas
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center px-4">
        Aún no has realizado ninguna estimación. Dirígete a la pestaña de
        "Predicción" para comenzar.
      </p>
    </div>
  );
}

export default function HistorialPage() {
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const { data, isLoading, error } = useSWR(
    ["history", page],
    () => fetchHistory(page),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    },
  );

  if (error) {
    console.error("History fetch error:", error);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const experienciaLabels: Record<number, string> = {
    1: "Junior (1)",
    2: "Mid (2)",
    3: "Senior (3)",
  };

  return (
    <>
      <PageHeader
        title="Historial de Predicciones"
        description="Explora y analiza todas las estimaciones de tareas guardadas anteriormente por el sistema."
      />
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        <Card className="glass-premium shadow-xl border-border/80 overflow-hidden animate-slide-up">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <LoadingSkeleton />
              </div>
            ) : !data || data.items.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-16 font-bold">ID</TableHead>
                        <TableHead className="font-bold">Tipo Tarea</TableHead>
                        <TableHead className="font-bold">Urgencia</TableHead>
                        <TableHead className="text-center font-bold">
                          SP
                        </TableHead>
                        <TableHead className="text-center font-bold">
                          Exp.
                        </TableHead>
                        <TableHead className="text-center font-bold">
                          Sub-tareas
                        </TableHead>
                        <TableHead className="text-center font-bold">
                          Tiempo
                        </TableHead>
                        <TableHead className="font-bold">Riesgo</TableHead>
                        <TableHead className="font-bold">
                          Fecha de creación
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((entry) => {
                        const isSelected = selectedEntry?.id === entry.id;
                        return (
                          <TableRow
                            key={entry.id}
                            className={`cursor-pointer transition-all duration-150 border-b border-border/50 hover:bg-primary/5 ${
                              isSelected
                                ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary"
                                : ""
                            }`}
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <TableCell className="font-mono font-bold text-muted-foreground pl-4">
                              #{entry.id}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                              {entry.tipo_tarea}
                            </TableCell>
                            <TableCell className="text-sm">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  entry.urgencia === "Alta"
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    : entry.urgencia === "Media"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {entry.urgencia}
                              </span>
                            </TableCell>
                            <TableCell className="text-center font-mono font-medium">
                              {entry.sp}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {entry.experiencia}
                            </TableCell>
                            <TableCell className="text-center font-bold text-primary">
                              {entry.pred_tasks}
                            </TableCell>
                            <TableCell className="text-center font-bold text-indigo-600 dark:text-indigo-400">
                              {entry.pred_time}d
                            </TableCell>
                            <TableCell>
                              <RiskBadge level={entry.pred_risk} size="sm" />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs font-medium">
                              {formatDate(entry.created_at)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border/60 bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground order-2 sm:order-1">
                    Registrados{" "}
                    <strong className="text-foreground">{data.total}</strong>{" "}
                    estimaciones totales.
                  </p>
                  <div className="flex items-center gap-3 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="h-8 rounded-lg px-2 hover:bg-muted/80 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-semibold text-muted-foreground select-none">
                      Página{" "}
                      <strong className="text-foreground">{data.page}</strong>{" "}
                      de{" "}
                      <strong className="text-foreground">
                        {data.total_pages}
                      </strong>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.total_pages}
                      onClick={() => setPage((p) => p + 1)}
                      className="h-8 rounded-lg px-2 hover:bg-muted/80 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Detail Sheet */}
        <Sheet
          open={!!selectedEntry}
          onOpenChange={() => setSelectedEntry(null)}
        >
          <SheetContent className="sm:max-w-md overflow-y-auto border-l border-border/80 glass shadow-2xl animate-fade-in p-6">
            <SheetHeader className="mb-6 relative">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <SheetTitle className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  Detalle de Estimación
                </SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEntry(null)}
                  className="h-8 w-8 rounded-full hover:bg-muted/65"
                >
                  <X className="w-4.5 h-4.5" />
                </Button>
              </div>
            </SheetHeader>

            {selectedEntry && (
              <div className="space-y-6 animate-slide-up">
                {/* ID and Date Indicator */}
                <div className="flex justify-between items-center bg-muted/40 border border-border/50 rounded-xl p-3.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Identificador
                    </span>
                    <span className="text-sm font-mono font-bold text-foreground">
                      Registro #{selectedEntry.id}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Fecha
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {formatDate(selectedEntry.created_at)}
                    </span>
                  </div>
                </div>

                {/* Input Parameters */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    <Settings className="w-4 h-4" /> Parámetros de Entrada
                  </h3>
                  <div className="bg-muted/30 border border-border/40 rounded-xl p-4 space-y-1">
                    <DetailRow
                      label="Story Points (SP)"
                      value={selectedEntry.sp}
                      icon={Layers}
                    />
                    <DetailRow
                      label="Experiencia del Equipo"
                      value={experienciaLabels[selectedEntry.experiencia]}
                    />
                    <DetailRow
                      label="Factor de Rendimiento"
                      value={
                        selectedEntry.rendimiento !== undefined &&
                        selectedEntry.rendimiento !== null
                          ? selectedEntry.rendimiento.toFixed(2)
                          : "N/A"
                      }
                    />
                    <DetailRow
                      label="Complejidad Técnica"
                      value={selectedEntry.complejidad}
                    />
                    <DetailRow
                      label="Dependencias Externas"
                      value={selectedEntry.dependencias}
                    />
                    <DetailRow
                      label="Área de la Tarea"
                      value={selectedEntry.tipo_tarea}
                    />
                    <DetailRow
                      label="Urgencia Declarada"
                      value={selectedEntry.urgencia}
                    />
                  </div>
                </div>

                {/* Predictions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" /> Resultados
                    Estimados (IA)
                  </h3>
                  <div className="space-y-4">
                    {/* Tasks card */}
                    <Card className="border border-border/50 bg-background/50 hover:bg-background/80 transition-colors shadow-xs">
                      <CardContent className="p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Sub-tareas sugeridas
                          </span>
                          <span className="text-xl font-extrabold text-primary">
                            {selectedEntry.pred_tasks} tareas
                          </span>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-dashed border-border/60">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                            Intervalo de confianza (90%)
                          </span>
                          <span className="text-xs font-bold text-foreground font-mono mt-0.5 block">
                            [{selectedEntry.ci_tasks?.[0] ?? 0} a{" "}
                            {selectedEntry.ci_tasks?.[1] ?? 0}] sub-tareas
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Time card */}
                    <Card className="border border-border/50 bg-background/50 hover:bg-background/80 transition-colors shadow-xs">
                      <CardContent className="p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Tiempo Requerido
                          </span>
                          <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                            {selectedEntry.pred_time} días hábiles
                          </span>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-dashed border-border/60">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                            Intervalo de confianza (90%)
                          </span>
                          <span className="text-xs font-bold text-foreground font-mono mt-0.5 block">
                            [{selectedEntry.ci_time?.[0] ?? 0} a{" "}
                            {selectedEntry.ci_time?.[1] ?? 0}] días
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Risk card */}
                    <Card className="border border-border/50 bg-background/50 hover:bg-background/80 transition-colors shadow-xs">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Riesgo Proyectado
                          </span>
                          <RiskBadge level={selectedEntry.pred_risk} />
                        </div>
                        <div className="border-t border-dashed border-border/60 pt-3">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-2">
                            Distribución de Probabilidades
                          </span>
                          <RiskProbabilityBar
                            probas={
                              selectedEntry.probas || {
                                ALTO: 0,
                                MEDIO: 0,
                                BAJO: 0,
                              }
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
