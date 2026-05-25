"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Settings,
  RefreshCw,
  HardDriveDownload,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  HelpCircle,
  Activity,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Clock,
  Info,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getConfig,
  updateConfig,
  getModelValidation,
  reloadModels,
  mockConfig,
  mockModelValidation,
} from "@/lib/api";
import type { AppConfig, ModelValidation } from "@/lib/types";
import { useApiStatus } from "@/hooks/use-api-status";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchConfig(): Promise<AppConfig> {
  try {
    return await getConfig();
  } catch (err) {
    console.warn("Config API offline, using mock config:", err);
    return mockConfig;
  }
}

async function fetchValidation(): Promise<ModelValidation> {
  try {
    return await getModelValidation();
  } catch (err) {
    console.warn("Validation API offline, using mock validation:", err);
    return mockModelValidation;
  }
}

export default function ConfiguracionPage() {
  const { isOffline } = useApiStatus();

  // SWR data fetching
  const { data: config, mutate: mutateConfig } = useSWR("api-config", fetchConfig, {
    revalidateOnFocus: false,
  });
  const { data: validation, mutate: mutateValidation } = useSWR(
    "api-validation",
    fetchValidation,
    {
      revalidateOnFocus: false,
    }
  );

  // Form states
  const [kfoldSplits, setKfoldSplits] = useState(5);
  const [randomState, setRandomState] = useState(42);
  const [testSize, setTestSize] = useState(0.2);
  const [nIterSearch, setNIterSearch] = useState(20);

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [shapModel, setShapModel] = useState<"tasks" | "time" | "risk">("tasks");

  // Image load error states
  const [dashboardError, setDashboardError] = useState(false);
  const [shapTasksError, setShapTasksError] = useState(false);
  const [shapTimeError, setShapTimeError] = useState(false);
  const [shapRiskError, setShapRiskError] = useState(false);

  // Sync state with SWR loaded config
  useEffect(() => {
    if (config) {
      setKfoldSplits(config.kfold_splits ?? 5);
      setRandomState(config.random_state ?? 42);
      setTestSize(config.test_size ?? 0.2);
      setNIterSearch(config.n_iter_search ?? 20);
    }
  }, [config]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOffline) {
      toast.warning("Modo Demo Activo. Los cambios no se guardarán en el servidor.");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateConfig({
        kfold_splits: kfoldSplits,
        random_state: randomState,
        test_size: testSize,
        n_iter_search: nIterSearch,
      });
      mutateConfig(updated);
      toast.success("¡Configuración de hiperparámetros guardada con éxito!");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar la configuración.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReload = async () => {
    if (isOffline) {
      toast.warning("Modo Demo Activo. No se pueden recargar modelos reales.");
      return;
    }
    setIsReloading(true);
    try {
      const result = await reloadModels();
      mutateValidation();
      mutateConfig();
      toast.success(result.message || "¡Modelos recargados en caliente correctamente!");
    } catch (err: any) {
      toast.error(err.message || "Error al recargar modelos.");
    } finally {
      setIsReloading(false);
    }
  };

  // Image source mappings
  const dashboardSrc = `${API_BASE_URL}/data/plots/evaluacion_modelo_diagnostico.png`;
  const shapTasksSrc = `${API_BASE_URL}/data/shap/shap_sub-tareas.png`;
  const shapTimeSrc = `${API_BASE_URL}/data/shap/shap_tiempo.png`;
  const shapRiskSrc = `${API_BASE_URL}/data/shap/shap_riesgo.png`;

  return (
    <>
      <PageHeader
        title="Configuración y Diagnósticos"
        description="Gestión avanzada de modelos ML, recarga de pesos en caliente e interpretabilidad SHAP."
      />
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
        <Tabs defaultValue="ajustes" className="w-full space-y-6">
          <TabsList className="grid grid-cols-3 w-full sm:w-[500px] bg-muted/40 border border-border/50 p-1 rounded-xl">
            <TabsTrigger value="ajustes" className="gap-2">
              <Settings className="w-4 h-4" />
              Ajustes
            </TabsTrigger>
            <TabsTrigger value="diagnosticos" className="gap-2">
              <Activity className="w-4 h-4" />
              Validación
            </TabsTrigger>
            <TabsTrigger value="shap" className="gap-2">
              <Sparkles className="w-4 h-4" />
              SHAP
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MODEL SETTINGS */}
          <TabsContent value="ajustes" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form card */}
              <Card className="lg:col-span-2 glass-premium shadow-xl border-border/80 animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Hiperparámetros de Validación cruzada
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Parámetros de entrenamiento aplicados en la optimización con RandomizedSearchCV y K-Fold.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveConfig} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Splits */}
                      <div className="space-y-1.5">
                        <Label htmlFor="splits" className="font-semibold text-sm">
                          K-Fold Splits
                        </Label>
                        <Input
                          id="splits"
                          type="number"
                          min={2}
                          max={20}
                          value={kfoldSplits}
                          onChange={(e) => setKfoldSplits(Number(e.target.value))}
                          className="bg-background/50"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Folds de validación cruzada. Valores usuales: 5 a 10.
                        </p>
                      </div>

                      {/* Random State */}
                      <div className="space-y-1.5">
                        <Label htmlFor="seed" className="font-semibold text-sm">
                          Random State (Semilla)
                        </Label>
                        <Input
                          id="seed"
                          type="number"
                          value={randomState}
                          onChange={(e) => setRandomState(Number(e.target.value))}
                          className="bg-background/50"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Garantiza reproducibilidad del split y de la búsqueda.
                        </p>
                      </div>

                      {/* Test Size */}
                      <div className="space-y-1.5">
                        <Label htmlFor="test-size" className="font-semibold text-sm">
                          Test Size (Set de Test)
                        </Label>
                        <Input
                          id="test-size"
                          type="number"
                          step={0.05}
                          min={0.05}
                          max={0.5}
                          value={testSize}
                          onChange={(e) => setTestSize(Number(e.target.value))}
                          className="bg-background/50"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Porcentaje de datos reservados para validación final (ej: 0.20 = 20%).
                        </p>
                      </div>

                      {/* Iter search */}
                      <div className="space-y-1.5">
                        <Label htmlFor="iter-search" className="font-semibold text-sm">
                          Iteraciones de Búsqueda
                        </Label>
                        <Input
                          id="iter-search"
                          type="number"
                          min={5}
                          max={200}
                          value={nIterSearch}
                          onChange={(e) => setNIterSearch(Number(e.target.value))}
                          className="bg-background/50"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Cantidad de combinaciones aleatorias probadas en el tuning.
                        </p>
                      </div>
                    </div>

                    <Separator className="my-2 border-border/40" />

                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto px-6 py-2.5 font-semibold text-sm rounded-xl cursor-pointer shadow-md shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                      {isSaving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Ajustes
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Action / Information Card */}
              <div className="space-y-6 animate-slide-up stagger-1">
                {/* Reload card */}
                <Card className="glass-premium shadow-xl border-border/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-indigo-500" />
                      Recarga en Caliente
                    </CardTitle>
                    <CardDescription className="text-xs">
                      ¿Has entrenado nuevos modelos localmente? Carga los archivos pickle (.pkl) directamente a la API en caliente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-normal">
                      Esta operación forzará a la API a recargar en memoria los modelos <code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px] text-foreground">pipe_tasks.pkl</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px] text-foreground">pipe_time.pkl</code> y <code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px] text-foreground">pipe_risk.pkl</code> y sus metadatos sin necesidad de reiniciar la API de producción.
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleReload}
                      disabled={isReloading}
                      className="w-full py-4.5 font-semibold text-sm border-indigo-500/25 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 cursor-pointer transition-colors"
                    >
                      <HardDriveDownload className={`mr-2 h-4.5 w-4.5 ${isReloading ? "animate-bounce" : ""}`} />
                      {isReloading ? "Recargando Modelos..." : "Recargar Modelos"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Metadata summary */}
                <Card className="glass-premium shadow-xl border-border/80">
                  <CardContent className="p-5 space-y-3.5">
                    <div className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Metadatos API</span>
                      <Badge variant="outline" className="text-[10px] px-2 py-0">
                        v{validation?.version || config?.kfold_splits ? "3.1" : "Demo"}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Último entrenamiento:</span>
                        <span className="font-semibold font-mono text-foreground/80">
                          {validation?.timestamp ? new Date(validation.timestamp).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Calibración de Riesgo:</span>
                        <span className="font-semibold text-foreground/80">
                          {validation?.diagnostico_entrenamiento?.calibracion_riesgo || "Isotónica (cv=5)"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Características Activas:</span>
                        <span className="font-semibold font-mono text-foreground/80">
                          {validation?.features?.length ?? 7} features
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: TRAINING DIAGNOSTICS & VALIDATION */}
          <TabsContent value="diagnosticos" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Warnings card */}
              <Card className="lg:col-span-4 glass-premium shadow-xl border-border/80 animate-slide-up">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    Análisis de Data Leakage (Fuga de Datos)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    El sistema analiza correlaciones lineales (Pearson) e información mutua (relaciones no lineales) antes de entrenar para evitar sobreajuste artificial.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {validation?.diagnostico_entrenamiento?.leakage_warnings &&
                  validation.diagnostico_entrenamiento.leakage_warnings.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold">Sospechas de Leakage Detectadas</h4>
                          <p className="text-xs text-muted-foreground leading-normal">
                            Se detectaron variables que comparten un porcentaje excesivo de información con los targets. Esto puede deberse a que el Story Point (SP) actúa como predictor directo en el generador de datos.
                          </p>
                        </div>
                      </div>
                      <div className="bg-muted/30 border border-border/40 rounded-xl p-4 space-y-2">
                        {validation.diagnostico_entrenamiento.leakage_warnings.map((warn, i) => (
                          <div key={i} className="flex gap-2 text-xs font-mono items-center text-foreground/80 py-1 border-b border-border/20 last:border-b-0">
                            <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            {warn}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold">Modelo Libre de Leakage Crítico</h4>
                        <p className="text-xs text-muted-foreground">
                          No se detectaron correlaciones perfectas ni dependencias directas. Las métricas de entrenamiento son estadísticamente confiables.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Model Winners Table */}
              <Card className="lg:col-span-1 glass-premium shadow-xl border-border/80 animate-slide-up stagger-1 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Modelos Ganadores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-muted-foreground/80" />
                        Sub-tareas:
                      </span>
                      <Badge variant="secondary" className="font-semibold text-[10px]">
                        {validation?.ganadores?.[0] || "GradientBoosting"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/80" />
                        Tiempo:
                      </span>
                      <Badge variant="secondary" className="font-semibold text-[10px]">
                        {validation?.ganadores?.[1] || "GradientBoosting"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground/80" />
                        Riesgo:
                      </span>
                      <Badge variant="secondary" className="font-semibold text-[10px]">
                        {validation?.ganadores?.[2] || "LogisticRegression"}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="border-border/40" />

                  <div className="bg-muted/20 border border-border/30 rounded-xl p-3.5">
                    <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Info className="w-3 h-3 text-muted-foreground" />
                      Validación Cruzada
                    </h5>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Los ganadores se seleccionan comparando K-Fold cross validation y validación por TimeSeriesSplit (orden secuencial de filas).
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Training curves panel */}
              <Card className="lg:col-span-3 glass-premium shadow-xl border-border/80 animate-slide-up stagger-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        Panel de Curvas y Diagnóstico
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Graficado de curvas de aprendizaje (overfitting check), calibración de riesgo e importancias de variables.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isOffline ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border/80 rounded-2xl bg-muted/20 text-muted-foreground min-h-[350px]">
                      <AlertTriangle className="w-12 h-12 text-amber-500 mb-3 animate-pulse" />
                      <h4 className="text-md font-bold text-foreground mb-1">Visualización no disponible en Modo Demo</h4>
                      <p className="text-xs max-w-sm text-center">
                        El backend de FastAPI está desconectado. Levanta la API local para cargar y renderizar en vivo el panel <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] text-foreground">evaluacion_modelo_diagnostico.png</code>.
                      </p>
                    </div>
                  ) : dashboardError ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border/80 rounded-2xl bg-muted/20 text-muted-foreground min-h-[350px]">
                      <Info className="w-12 h-12 text-muted-foreground mb-3" />
                      <h4 className="text-md font-bold text-foreground mb-1">No se encontró el panel de diagnóstico</h4>
                      <p className="text-xs max-w-sm text-center">
                        La API está en línea pero no se encuentra la imagen en disco. Asegúrate de ejecutar el script de entrenamiento para generarla (<code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] text-foreground">python scripts/train_model.py</code>).
                      </p>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/10 p-2 group shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dashboardSrc}
                        alt="Dashboard de Diagnóstico del Modelo"
                        onError={() => setDashboardError(true)}
                        className="w-full h-auto object-contain rounded-xl hover:scale-[1.01] transition-transform duration-500 cursor-zoom-in"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: SHAP INTERPRETABILITY */}
          <TabsContent value="shap" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Introduction Card */}
              <Card className="lg:col-span-4 glass-premium shadow-xl border-border/80 animate-slide-up">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Interpretabilidad de Inteligencia Artificial (SHAP)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Explicabilidad matemática de la contribución individual de cada característica en las predicciones.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground leading-normal">
                  <p>
                    <strong>SHAP (Shapley Additive exPlanations)</strong> utiliza la teoría de juegos cooperativa para calcular el impacto de cada parámetro (ej: Story Points, Rendimiento o Experiencia) en las predicciones de sub-tareas, tiempo y riesgo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="border border-border/30 bg-muted/10 p-3.5 rounded-xl">
                      <h5 className="font-bold text-foreground mb-1">1. Gráfico de Barras (|SHAP|)</h5>
                      <p className="text-[11px]">
                        Indica el orden de importancia global. Cuanto más larga sea la barra, mayor influencia general tiene la característica sobre las estimaciones del modelo.
                      </p>
                    </div>
                    <div className="border border-border/30 bg-muted/10 p-3.5 rounded-xl">
                      <h5 className="font-bold text-foreground mb-1">2. Gráfico Beeswarm (Nube de Puntos)</h5>
                      <p className="text-[11px]">
                        Muestra la direccionalidad: los puntos azules indican valores bajos y los rojos valores altos. Su posición horizontal indica si empujan la predicción hacia arriba o hacia abajo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Selector & SHAP Panel */}
              <Card className="lg:col-span-4 glass-premium shadow-xl border-border/80 animate-slide-up stagger-1">
                <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary" />
                      Análisis por Modelo Predictivo
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Selecciona un modelo para cargar sus respectivos gráficos de interpretabilidad SHAP.
                    </CardDescription>
                  </div>

                  <div className="flex gap-1.5 p-1 bg-muted rounded-xl border border-border/50 w-fit shrink-0">
                    <Button
                      variant={shapModel === "tasks" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setShapModel("tasks")}
                      className={`text-xs px-3.5 h-8.5 rounded-lg font-semibold cursor-pointer ${
                        shapModel === "tasks" ? "bg-background shadow-xs text-primary" : ""
                      }`}
                    >
                      Sub-tareas
                    </Button>
                    <Button
                      variant={shapModel === "time" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setShapModel("time")}
                      className={`text-xs px-3.5 h-8.5 rounded-lg font-semibold cursor-pointer ${
                        shapModel === "time" ? "bg-background shadow-xs text-primary" : ""
                      }`}
                    >
                      Tiempo
                    </Button>
                    <Button
                      variant={shapModel === "risk" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setShapModel("risk")}
                      className={`text-xs px-3.5 h-8.5 rounded-lg font-semibold cursor-pointer ${
                        shapModel === "risk" ? "bg-background shadow-xs text-primary" : ""
                      }`}
                    >
                      Riesgo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {isOffline ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border/80 rounded-2xl bg-muted/20 text-muted-foreground min-h-[350px]">
                      <AlertTriangle className="w-12 h-12 text-amber-500 mb-3 animate-pulse" />
                      <h4 className="text-md font-bold text-foreground mb-1">Gráficos SHAP no disponibles en Modo Demo</h4>
                      <p className="text-xs max-w-sm text-center">
                        El backend de FastAPI está desconectado. Levanta la API local para renderizar dinámicamente los gráficos de interpretabilidad de SHAP desde la carpeta de almacenamiento del modelo.
                      </p>
                    </div>
                  ) : (shapModel === "tasks" && shapTasksError) ||
                    (shapModel === "time" && shapTimeError) ||
                    (shapModel === "risk" && shapRiskError) ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border/80 rounded-2xl bg-muted/20 text-muted-foreground min-h-[350px]">
                      <Info className="w-12 h-12 text-muted-foreground mb-3" />
                      <h4 className="text-md font-bold text-foreground mb-1">Gráficos SHAP no encontrados en disco</h4>
                      <p className="text-xs max-w-sm text-center">
                        La API está activa pero no se encontraron las imágenes SHAP en la carpeta <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] text-foreground">data/shap/</code>. Asegúrate de ejecutar el script de entrenamiento sin saltarte el paso SHAP (<code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] text-foreground">python scripts/train_model.py</code>).
                      </p>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/10 p-2 group shadow-inner">
                      {shapModel === "tasks" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={shapTasksSrc}
                          alt="Análisis SHAP - Sub-tareas"
                          onError={() => setShapTasksError(true)}
                          className="w-full h-auto object-contain rounded-xl hover:scale-[1.01] transition-transform duration-500 cursor-zoom-in"
                        />
                      )}
                      {shapModel === "time" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={shapTimeSrc}
                          alt="Análisis SHAP - Tiempo"
                          onError={() => setShapTimeError(true)}
                          className="w-full h-auto object-contain rounded-xl hover:scale-[1.01] transition-transform duration-500 cursor-zoom-in"
                        />
                      )}
                      {shapModel === "risk" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={shapRiskSrc}
                          alt="Análisis SHAP - Riesgo"
                          onError={() => setShapRiskError(true)}
                          className="w-full h-auto object-contain rounded-xl hover:scale-[1.01] transition-transform duration-500 cursor-zoom-in"
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
