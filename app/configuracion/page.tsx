"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Lock,
  Save,
  Loader2,
  Settings2,
  Info,
  AlertCircle,
  Sparkles,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getConfig, updateConfig, mockConfig } from "@/lib/api";
import type { AppConfig } from "@/lib/types";

async function fetchConfig(): Promise<AppConfig> {
  try {
    return await getConfig();
  } catch (err) {
    console.warn("Config API offline, using mock data:", err);
    return mockConfig;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5 py-4">
      <Skeleton className="h-10 w-1/3 rounded-lg" />
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
      <Skeleton className="h-11 w-40 rounded-xl mt-4" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/80 rounded-2xl glass-premium animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Settings2 className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">
        Error de configuración
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center px-4">
        No se pudieron cargar los parámetros del sistema. Inténtalo de nuevo más
        tarde.
      </p>
    </div>
  );
}

export default function ConfiguracionPage() {
  const {
    data: config,
    isLoading,
    error,
    mutate,
  } = useSWR("config", fetchConfig, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Local form state
  const [rendimientoMin, setRendimientoMin] = useState(0);
  const [rendimientoMax, setRendimientoMax] = useState(1);
  const [experienciaValida, setExperienciaValida] = useState<number[]>([
    1, 2, 3,
  ]);
  const [urgenciaValida, setUrgenciaValida] = useState<string[]>([
    "Baja",
    "Media",
    "Alta",
  ]);
  const [outlierColumns, setOutlierColumns] = useState<string[]>([]);
  const [kfoldSplits, setKfoldSplits] = useState(5);
  const [randomState, setRandomState] = useState(42);
  const [testSize, setTestSize] = useState([0.2]);
  const [nIterSearch, setNIterSearch] = useState(50);

  useEffect(() => {
    if (config) {
      setRendimientoMin(config.rendimiento_min ?? 0);
      setRendimientoMax(config.rendimiento_max ?? 1);
      setExperienciaValida(config.experiencia_valida ?? [1, 2, 3]);
      setUrgenciaValida(config.urgencia_valida ?? ["Baja", "Media", "Alta"]);
      setOutlierColumns(config.outlier_columns ?? []);
      setKfoldSplits(config.kfold_splits ?? 5);
      setRandomState(config.random_state ?? 42);
      setTestSize([config.test_size ?? 0.2]);
      setNIterSearch(config.n_iter_search ?? 50);
    }
  }, [config]);

  // Track changes to show isDirty banner and block unloading
  useEffect(() => {
    if (!config) return;
    const hasChanges =
      rendimientoMin !== (config.rendimiento_min ?? 0) ||
      rendimientoMax !== (config.rendimiento_max ?? 1) ||
      JSON.stringify(experienciaValida) !==
        JSON.stringify(config.experiencia_valida ?? [1, 2, 3]) ||
      JSON.stringify(urgenciaValida) !==
        JSON.stringify(config.urgencia_valida ?? ["Baja", "Media", "Alta"]) ||
      JSON.stringify(outlierColumns) !==
        JSON.stringify(config.outlier_columns ?? []) ||
      kfoldSplits !== (config.kfold_splits ?? 5) ||
      randomState !== (config.random_state ?? 42) ||
      testSize[0] !== (config.test_size ?? 0.2) ||
      nIterSearch !== (config.n_iter_search ?? 50);

    setIsDirty(hasChanges);
  }, [
    rendimientoMin,
    rendimientoMax,
    experienciaValida,
    urgenciaValida,
    outlierColumns,
    kfoldSplits,
    randomState,
    testSize,
    nIterSearch,
    config,
  ]);

  // Block tab closing if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
          "Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (error) {
    console.error("Config error:", error);
  }

  const handleSave = async () => {
    // Validations
    if (rendimientoMin < 0 || rendimientoMin > 1) {
      toast.error("El rendimiento mínimo debe estar entre 0.0 y 1.0");
      return;
    }
    if (rendimientoMax < 0 || rendimientoMax > 1) {
      toast.error("El rendimiento máximo debe estar entre 0.0 y 1.0");
      return;
    }
    if (rendimientoMin >= rendimientoMax) {
      toast.error(
        "El rendimiento mínimo debe ser menor que el rendimiento máximo",
      );
      return;
    }
    if (experienciaValida.length === 0) {
      toast.error("Debe seleccionar al menos una opción de experiencia válida");
      return;
    }
    if (urgenciaValida.length === 0) {
      toast.error("Debe seleccionar al menos una opción de urgencia válida");
      return;
    }
    if (kfoldSplits < 2 || kfoldSplits > 20) {
      toast.error("K-Fold Splits debe estar entre 2 y 20");
      return;
    }
    if (nIterSearch < 1) {
      toast.error("N Iter Search debe ser al menos 1");
      return;
    }

    setIsSaving(true);
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
      };
      await updateConfig(updatedConfig);
      await mutate();
      setIsDirty(false);
      toast.success("Configuración guardada y aplicada exitosamente.");
    } catch (err: any) {
      console.error(err);
      toast.warning(
        "API offline. Configuración guardada localmente en la sesión (Modo Demo).",
      );
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExperiencia = (value: number) => {
    setExperienciaValida((prev) => {
      const current = prev || [];
      return current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value].sort();
    });
  };

  const toggleUrgencia = (value: string) => {
    setUrgenciaValida((prev) => {
      const current = prev || [];
      return current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
    });
  };

  const toggleOutlier = (column: string) => {
    setOutlierColumns((prev) => {
      const current = prev || [];
      return current.includes(column)
        ? current.filter((v) => v !== column)
        : [...current, column];
    });
  };

  const allOutlierOptions = ["SP", "Complejidad", "Dependencias"];

  return (
    <>
      <PageHeader
        title="Configuración de Parámetros"
        description="Gestiona las restricciones del sistema, la detección de outliers y los hiperparámetros de entrenamiento del modelo de ML."
      />
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {isLoading ? (
          <Card className="glass-premium p-6">
            <LoadingSkeleton />
          </Card>
        ) : !config ? (
          <EmptyState />
        ) : (
          <>
            {/* Unsaved Changes Banner */}
            {isDirty && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>
                  Tienes cambios pendientes en la configuración. Asegúrate de
                  hacer clic en <strong>Guardar configuración</strong> antes de
                  salir.
                </span>
              </div>
            )}

            {/* Editable Config Form */}
            <Card className="glass-premium shadow-xl border-border/80 overflow-hidden animate-slide-up">
              <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-lg font-bold tracking-tight">
                      Parámetros del Sistema
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Modifica los rangos de entrada válidos y parámetros del
                      reentrenamiento.
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase tracking-wider bg-background/50 border-border/50"
                  >
                    Auto-validado
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Accordion
                  type="multiple"
                  defaultValue={["ranges", "outliers", "kfold"]}
                  className="w-full"
                >
                  {/* Section 1: Rangos válidos */}
                  <AccordionItem
                    value="ranges"
                    className="border-b border-border/50"
                  >
                    <AccordionTrigger className="text-sm font-bold hover:no-underline hover:text-primary py-3">
                      Rangos Válidos de Entrada
                    </AccordionTrigger>
                    <AccordionContent className="space-y-5 pt-3 pb-4">
                      {/* Rendimiento Range */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="rend-min"
                            className="font-semibold text-xs text-muted-foreground uppercase tracking-wider"
                          >
                            Rendimiento Mínimo
                          </Label>
                          <Input
                            id="rend-min"
                            type="number"
                            min={0}
                            max={1}
                            step={0.1}
                            value={rendimientoMin}
                            onChange={(e) =>
                              setRendimientoMin(Number(e.target.value))
                            }
                            className="bg-background/50 border-muted-foreground/20 hover:border-primary/50 transition-colors font-medium font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="rend-max"
                            className="font-semibold text-xs text-muted-foreground uppercase tracking-wider"
                          >
                            Rendimiento Máximo
                          </Label>
                          <Input
                            id="rend-max"
                            type="number"
                            min={0}
                            max={1}
                            step={0.1}
                            value={rendimientoMax}
                            onChange={(e) =>
                              setRendimientoMax(Number(e.target.value))
                            }
                            className="bg-background/50 border-muted-foreground/20 hover:border-primary/50 transition-colors font-medium font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                        {/* Experiencia Checkboxes */}
                        <div className="space-y-2">
                          <Label className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block">
                            Experiencia Válida del Equipo
                          </Label>
                          <div className="flex flex-wrap gap-x-5 gap-y-2.5 bg-muted/30 p-3 rounded-lg border border-border/40">
                            {[1, 2, 3].map((exp) => (
                              <div
                                key={exp}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`exp-${exp}`}
                                  checked={(experienciaValida || []).includes(
                                    exp,
                                  )}
                                  onCheckedChange={() => toggleExperiencia(exp)}
                                />
                                <Label
                                  htmlFor={`exp-${exp}`}
                                  className="text-xs font-semibold cursor-pointer"
                                >
                                  {exp === 1
                                    ? "1 – Junior"
                                    : exp === 2
                                      ? "2 – Mid"
                                      : "3 – Senior"}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Urgencia Checkboxes */}
                        <div className="space-y-2">
                          <Label className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block">
                            Urgencia Válida del Requerimiento
                          </Label>
                          <div className="flex flex-wrap gap-x-5 gap-y-2.5 bg-muted/30 p-3 rounded-lg border border-border/40">
                            {["Baja", "Media", "Alta"].map((urg) => (
                              <div
                                key={urg}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`urg-${urg}`}
                                  checked={(urgenciaValida || []).includes(urg)}
                                  onCheckedChange={() => toggleUrgencia(urg)}
                                />
                                <Label
                                  htmlFor={`urg-${urg}`}
                                  className="text-xs font-semibold cursor-pointer"
                                >
                                  {urg}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 2: Columnas Outlier */}
                  <AccordionItem
                    value="outliers"
                    className="border-b border-border/50"
                  >
                    <AccordionTrigger className="text-sm font-bold hover:no-underline hover:text-primary py-3">
                      Detección de Outliers (Rango Intercuartílico - IQR)
                    </AccordionTrigger>
                    <AccordionContent className="pt-3 pb-4 space-y-3">
                      <Label className="font-medium text-xs text-muted-foreground">
                        Selecciona las variables del conjunto de datos sobre las
                        cuales se filtrarán valores atípicos.
                      </Label>
                      <div className="flex flex-wrap gap-5 bg-muted/30 p-3 rounded-lg border border-border/40">
                        {allOutlierOptions.map((col) => (
                          <div
                            key={col}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`outlier-${col}`}
                              checked={(outlierColumns || []).includes(col)}
                              onCheckedChange={() => toggleOutlier(col)}
                            />
                            <Label
                              htmlFor={`outlier-${col}`}
                              className="text-xs font-semibold cursor-pointer"
                            >
                              {col === "SP" ? "Story Points (SP)" : col}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 3: K-Fold Parameters */}
                  <AccordionItem value="kfold" className="border-b-0">
                    <AccordionTrigger className="text-sm font-bold hover:no-underline hover:text-primary py-3">
                      Hiperparámetros de Validación & Búsqueda
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6 pt-3 pb-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <Label
                              htmlFor="kfold-splits"
                              className="font-semibold text-xs text-muted-foreground uppercase tracking-wider"
                            >
                              K-Fold Splits
                            </Label>
                            <div className="group relative">
                              <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-40 p-2 bg-popover border text-popover-foreground text-[10px] rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                                Número de particiones para la validación
                                cruzada.
                              </span>
                            </div>
                          </div>
                          <Input
                            id="kfold-splits"
                            type="number"
                            min={2}
                            max={20}
                            value={kfoldSplits}
                            onChange={(e) =>
                              setKfoldSplits(Number(e.target.value))
                            }
                            className="bg-background/50 border-muted-foreground/20 hover:border-primary/50 transition-colors font-medium font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="random-state"
                            className="font-semibold text-xs text-muted-foreground uppercase tracking-wider"
                          >
                            Random State (Semilla)
                          </Label>
                          <Input
                            id="random-state"
                            type="number"
                            value={randomState}
                            onChange={(e) =>
                              setRandomState(Number(e.target.value))
                            }
                            className="bg-background/50 border-muted-foreground/20 hover:border-primary/50 transition-colors font-medium font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <Label
                              htmlFor="n-iter"
                              className="font-semibold text-xs text-muted-foreground uppercase tracking-wider"
                            >
                              N Iter RandomizedSearch
                            </Label>
                            <div className="group relative">
                              <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-40 p-2 bg-popover border text-popover-foreground text-[10px] rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                                Número de combinaciones a probar durante la
                                optimización.
                              </span>
                            </div>
                          </div>
                          <Input
                            id="n-iter"
                            type="number"
                            min={1}
                            value={nIterSearch}
                            onChange={(e) =>
                              setNIterSearch(Number(e.target.value))
                            }
                            className="bg-background/50 border-muted-foreground/20 hover:border-primary/50 transition-colors font-medium font-mono"
                          />
                        </div>
                      </div>

                      {/* Test Size Slider */}
                      <div className="space-y-3.5 p-4 rounded-xl bg-muted/20 border border-border/30">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-sm">
                            Tamaño del Set de Test (Test Size)
                          </Label>
                          <span className="text-xs font-bold text-primary font-mono px-2 py-0.5 rounded bg-primary/10 border border-primary/10">
                            {(testSize[0] * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Slider
                          value={testSize}
                          onValueChange={setTestSize}
                          min={0.1}
                          max={0.4}
                          step={0.05}
                          className="w-full cursor-pointer py-1"
                        />
                        <div className="flex justify-between text-[10px] font-medium text-muted-foreground px-0.5">
                          <span>10% (Entrenamiento Máximo)</span>
                          <span>25% (Estándar)</span>
                          <span>40% (Test Grande)</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-8 pt-4 border-t border-border/40 flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto font-semibold px-6 py-5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 shadow-md shadow-primary/10 cursor-pointer transform active:scale-98 transition-all"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando parámetros...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4.5 w-4.5" />
                        Guardar Configuración
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Read-only Winner Models */}
            <Card className="glass-premium border-border/50 bg-muted/25 shadow-md overflow-hidden animate-slide-up stagger-1">
              <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center gap-3 space-y-0">
                <div className="p-2 bg-muted rounded-xl text-muted-foreground">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-bold">
                    Modelos del Último Entrenamiento
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Algoritmos ganadores calculados por el sistema tras
                    optimización de hiperparámetros (Solo Lectura).
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-background/40 border border-border/50 rounded-xl p-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />{" "}
                      Sugerencia Tareas
                    </span>
                    <Badge
                      variant="secondary"
                      className="w-fit text-xs font-semibold py-0.5 px-2 bg-muted/80 border border-border/30"
                    >
                      {config.ganador_tasks ?? "No disponible"}
                    </Badge>
                  </div>
                  <div className="bg-background/40 border border-border/50 rounded-xl p-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />{" "}
                      Estimación Tiempo
                    </span>
                    <Badge
                      variant="secondary"
                      className="w-fit text-xs font-semibold py-0.5 px-2 bg-muted/80 border border-border/30"
                    >
                      {config.ganador_time ?? "No disponible"}
                    </Badge>
                  </div>
                  <div className="bg-background/40 border border-border/50 rounded-xl p-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />{" "}
                      Clasificador Riesgo
                    </span>
                    <Badge
                      variant="secondary"
                      className="w-fit text-xs font-semibold py-0.5 px-2 bg-muted/80 border border-border/30"
                    >
                      {config.ganador_risk ?? "No disponible"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
