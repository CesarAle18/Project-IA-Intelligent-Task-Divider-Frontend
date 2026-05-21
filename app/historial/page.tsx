"use client"

import { useState } from "react"
import useSWR from "swr"
import { History, ChevronLeft, ChevronRight, X } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { RiskBadge } from "@/components/risk-badge"
import { RiskProbabilityBar } from "@/components/risk-probability-bar"
import { getHistory, mockHistoryResponse } from "@/lib/api"
import type { HistoryEntry, HistoryResponse } from "@/lib/types"

async function fetchHistory(page: number): Promise<HistoryResponse> {
  try {
    return await getHistory(page, 10)
  } catch {
    console.log("[v0] Using mock history data")
    return mockHistoryResponse
  }
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <History className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">No hay predicciones</h3>
      <p className="text-sm text-muted-foreground">Aún no se han registrado predicciones</p>
    </div>
  )
}

export default function HistorialPage() {
  const [page, setPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)

  const { data, isLoading, error } = useSWR(
    ["history", page],
    () => fetchHistory(page)
  )

  if (error) {
    console.log("[v0] Error fetching history:", error)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const experienciaLabels: Record<number, string> = {
    1: "Junior",
    2: "Mid",
    3: "Senior",
  }

  return (
    <>
      <PageHeader
        title="Historial"
        description="Registro de todas las predicciones realizadas"
      />
      <div className="p-4 md:p-6">
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4">
                <LoadingSkeleton />
              </div>
            ) : !data || data.items.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Tipo tarea</TableHead>
                        <TableHead>Urgencia</TableHead>
                        <TableHead className="text-center">SP</TableHead>
                        <TableHead className="text-center">Exp.</TableHead>
                        <TableHead className="text-center">Sub-tareas</TableHead>
                        <TableHead className="text-center">Tiempo</TableHead>
                        <TableHead>Riesgo</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <TableCell className="font-medium text-muted-foreground">
                            {entry.id}
                          </TableCell>
                          <TableCell>{entry.tipo_tarea}</TableCell>
                          <TableCell>{entry.urgencia}</TableCell>
                          <TableCell className="text-center">{entry.sp}</TableCell>
                          <TableCell className="text-center">{entry.experiencia}</TableCell>
                          <TableCell className="text-center font-medium">{entry.pred_tasks}</TableCell>
                          <TableCell className="text-center font-medium">{entry.pred_time}d</TableCell>
                          <TableCell>
                            <RiskBadge level={entry.pred_risk} size="sm" />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(entry.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Total: {data.total} predicciones
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Página {data.page} de {data.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.total_pages}
                      onClick={() => setPage((p) => p + 1)}
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
        <Sheet open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-6">
              <div className="flex items-center justify-between">
                <SheetTitle>Detalle de Predicción #{selectedEntry?.id}</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEntry(null)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </SheetHeader>

            {selectedEntry && (
              <div className="space-y-6">
                {/* Input Parameters */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Parámetros de entrada
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <DetailRow label="Story Points" value={selectedEntry.sp} />
                    <DetailRow
                      label="Experiencia"
                      value={experienciaLabels[selectedEntry.experiencia]}
                    />
                    <DetailRow
                      label="Rendimiento"
                      value={selectedEntry.rendimiento.toFixed(2)}
                    />
                    <DetailRow label="Complejidad" value={selectedEntry.complejidad} />
                    <DetailRow label="Dependencias" value={selectedEntry.dependencias} />
                    <DetailRow label="Tipo de tarea" value={selectedEntry.tipo_tarea} />
                    <DetailRow label="Urgencia" value={selectedEntry.urgencia} />
                  </div>
                </div>

                {/* Predictions */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Resultados de predicción
                  </h3>
                  <div className="space-y-3">
                    <Card className="shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Sub-tareas</span>
                          <span className="text-lg font-bold text-foreground">
                            {selectedEntry.pred_tasks}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Intervalo: [{selectedEntry.ci_tasks[0]} – {selectedEntry.ci_tasks[1]}]
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Tiempo</span>
                          <span className="text-lg font-bold text-foreground">
                            {selectedEntry.pred_time} días
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Intervalo: [{selectedEntry.ci_time[0]} – {selectedEntry.ci_time[1]}] días
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Riesgo</span>
                          <RiskBadge level={selectedEntry.pred_risk} />
                        </div>
                        <RiskProbabilityBar probas={selectedEntry.probas} />
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground text-center">
                  Creado: {formatDate(selectedEntry.created_at)}
                </p>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
