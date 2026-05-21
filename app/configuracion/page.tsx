"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Lock, Save, Loader2, Settings2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getConfig, updateConfig, mockConfig } from "@/lib/api"
import type { AppConfig } from "@/lib/types"

async function fetchConfig(): Promise<AppConfig> {
  try {
    return await getConfig()
  } catch {
    console.log("[v0] Using mock config data")
    return mockConfig
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Settings2 className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">Sin configuración</h3>
      <p className="text-sm text-muted-foreground">No se pudo cargar la configuración</p>
    </div>
  )
}

export default function ConfiguracionPage() {
  const { data: config, isLoading, error, mutate } = useSWR("config", fetchConfig)
  const [isSaving, setIsSaving] = useState(false)

  // Local form state
  const [rendimientoMin, setRendimientoMin] = useState(0)
  const [rendimientoMax, setRendimientoMax] = useState(1)
  const [experienciaValida, setExperienciaValida] = useState<number[]>([1, 2, 3])
  const [urgenciaValida, setUrgenciaValida] = useState<string[]>(["Baja", "Media", "Alta"])
  const [outlierColumns, setOutlierColumns] = useState<string[]>([])
  const [kfoldSplits, setKfoldSplits] = useState(5)
  const [randomState, setRandomState] = useState(42)
  const [testSize, setTestSize] = useState([0.2])
  const [nIterSearch, setNIterSearch] = useState(50)

  useEffect(() => {
    if (config) {
      setRendimientoMin(config.rendimiento_min)
      setRendimientoMax(config.rendimiento_max)
      setExperienciaValida(config.experiencia_valida)
      setUrgenciaValida(config.urgencia_valida)
      setOutlierColumns(config.outlier_columns)
      setKfoldSplits(config.kfold_splits)
      setRandomState(config.random_state)
      setTestSize([config.test_size])
      setNIterSearch(config.n_iter_search)
    }
  }, [config])

  if (error) {
    console.log("[v0] Error fetching config:", error)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedConfig = {
        rendimiento_min: rendimientoMin,
        rendimiento_max: rendimientoMax,
        experiencia_valida: experienciaValida,
        urgencia_valida: urgenciaValida,
        outlier_columns: outlierColumns,
        kfold_splits: kfoldSplits,
        random_state: randomState,
        test_size: testSize[0],
        n_iter_search: nIterSearch,
      }
      await updateConfig(updatedConfig)
      await mutate()
      toast.success("Configuración guardada correctamente")
    } catch {
      toast.error("Error al guardar la configuración")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleExperiencia = (value: number) => {
    setExperienciaValida((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value].sort()
    )
  }

  const toggleUrgencia = (value: string) => {
    setUrgenciaValida((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    )
  }

  const toggleOutlier = (column: string) => {
    setOutlierColumns((prev) =>
      prev.includes(column)
        ? prev.filter((v) => v !== column)
        : [...prev, column]
    )
  }

  const allOutlierOptions = ["SP", "Complejidad", "Dependencias"]

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Ajusta los parámetros del sistema de predicción"
      />
      <div className="p-4 md:p-6 space-y-6">
        {isLoading ? (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <LoadingSkeleton />
            </CardContent>
          </Card>
        ) : !config ? (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <EmptyState />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Editable Config Form */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Parámetros del Sistema</CardTitle>
                <CardDescription>
                  Configura los rangos de validación y parámetros de entrenamiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={["ranges", "outliers", "kfold"]} className="w-full">
                  {/* Section 1: Rangos válidos */}
                  <AccordionItem value="ranges">
                    <AccordionTrigger className="text-sm font-medium">
                      Rangos válidos
                    </AccordionTrigger>
                    <AccordionContent className="space-y-5 pt-2">
                      {/* Rendimiento Range */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="rend-min">Rendimiento mínimo</Label>
                          <Input
                            id="rend-min"
                            type="number"
                            min={0}
                            max={1}
                            step={0.1}
                            value={rendimientoMin}
                            onChange={(e) => setRendimientoMin(Number(e.target.value))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rend-max">Rendimiento máximo</Label>
                          <Input
                            id="rend-max"
                            type="number"
                            min={0}
                            max={1}
                            step={0.1}
                            value={rendimientoMax}
                            onChange={(e) => setRendimientoMax(Number(e.target.value))}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      {/* Experiencia Checkboxes */}
                      <div className="space-y-2">
                        <Label>Experiencia válida</Label>
                        <div className="flex flex-wrap gap-4">
                          {[1, 2, 3].map((exp) => (
                            <div key={exp} className="flex items-center space-x-2">
                              <Checkbox
                                id={`exp-${exp}`}
                                checked={experienciaValida.includes(exp)}
                                onCheckedChange={() => toggleExperiencia(exp)}
                              />
                              <Label htmlFor={`exp-${exp}`} className="text-sm font-normal cursor-pointer">
                                {exp} - {exp === 1 ? "Junior" : exp === 2 ? "Mid" : "Senior"}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Urgencia Checkboxes */}
                      <div className="space-y-2">
                        <Label>Urgencia válida</Label>
                        <div className="flex flex-wrap gap-4">
                          {["Baja", "Media", "Alta"].map((urg) => (
                            <div key={urg} className="flex items-center space-x-2">
                              <Checkbox
                                id={`urg-${urg}`}
                                checked={urgenciaValida.includes(urg)}
                                onCheckedChange={() => toggleUrgencia(urg)}
                              />
                              <Label htmlFor={`urg-${urg}`} className="text-sm font-normal cursor-pointer">
                                {urg}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 2: Columnas Outlier */}
                  <AccordionItem value="outliers">
                    <AccordionTrigger className="text-sm font-medium">
                      Columnas outlier IQR
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="space-y-2">
                        <Label>Selecciona las columnas para detección de outliers</Label>
                        <div className="flex flex-wrap gap-4">
                          {allOutlierOptions.map((col) => (
                            <div key={col} className="flex items-center space-x-2">
                              <Checkbox
                                id={`outlier-${col}`}
                                checked={outlierColumns.includes(col)}
                                onCheckedChange={() => toggleOutlier(col)}
                              />
                              <Label htmlFor={`outlier-${col}`} className="text-sm font-normal cursor-pointer">
                                {col}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 3: K-Fold Parameters */}
                  <AccordionItem value="kfold">
                    <AccordionTrigger className="text-sm font-medium">
                      Parámetros K-Fold
                    </AccordionTrigger>
                    <AccordionContent className="space-y-5 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="kfold-splits">K-Fold Splits</Label>
                          <Input
                            id="kfold-splits"
                            type="number"
                            min={2}
                            max={20}
                            value={kfoldSplits}
                            onChange={(e) => setKfoldSplits(Number(e.target.value))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="random-state">Random State</Label>
                          <Input
                            id="random-state"
                            type="number"
                            value={randomState}
                            onChange={(e) => setRandomState(Number(e.target.value))}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Test Size</Label>
                          <span className="text-sm font-medium text-primary">
                            {testSize[0].toFixed(2)}
                          </span>
                        </div>
                        <Slider
                          value={testSize}
                          onValueChange={setTestSize}
                          min={0.1}
                          max={0.4}
                          step={0.05}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0.1</span>
                          <span>0.4</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="n-iter">N Iter Search</Label>
                        <Input
                          id="n-iter"
                          type="number"
                          min={1}
                          value={nIterSearch}
                          onChange={(e) => setNIterSearch(Number(e.target.value))}
                          className="bg-background"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-6">
                  <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar configuración
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Read-only Winner Models */}
            <Card className="shadow-sm bg-muted/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-base">Modelos del último entrenamiento</CardTitle>
                </div>
                <CardDescription>
                  Estos valores son de solo lectura y se actualizan automáticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground">Ganador Tasks</Label>
                    <Badge variant="secondary" className="text-sm">
                      {config.ganador_tasks}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground">Ganador Time</Label>
                    <Badge variant="secondary" className="text-sm">
                      {config.ganador_time}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground">Ganador Risk</Label>
                    <Badge variant="secondary" className="text-sm">
                      {config.ganador_risk}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
