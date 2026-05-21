"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createPrediction, mockPredictionResult } from "@/lib/api";
import type {
  PredictionResult,
  TipoTarea,
  Urgencia,
  Experiencia,
} from "@/lib/types";
import { toast } from "sonner";

const predictionSchema = z.object({
  sp: z
    .number({ invalid_type_error: "Debe ingresar un número" })
    .min(1, "Debe ser al menos 1 SP"),
  experiencia: z.number().min(1).max(3) as z.ZodType<Experiencia>,
  rendimiento: z.number().min(0).max(1),
  complejidad: z
    .number({ invalid_type_error: "Debe ingresar un número" })
    .min(1, "Debe ser al menos nivel 1"),
  dependencias: z
    .number({ invalid_type_error: "Debe ingresar un número" })
    .min(0, "No puede ser negativo"),
  tipo_tarea: z.enum([
    "Backend",
    "Frontend",
    "DevOps",
    "Diseño",
    "QA",
  ]) as z.ZodType<TipoTarea>,
  urgencia: z.enum(["Baja", "Media", "Alta"]) as z.ZodType<Urgencia>,
});

type PredictionFormData = z.infer<typeof predictionSchema>;

interface PredictionFormProps {
  onResult: (result: PredictionResult) => void;
}

export function PredictionForm({ onResult }: PredictionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rendimientoValue, setRendimientoValue] = useState([0.75]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PredictionFormData>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      sp: 5,
      experiencia: 2,
      rendimiento: 0.75,
      complejidad: 3,
      dependencias: 1,
      tipo_tarea: "Backend",
      urgencia: "Media",
    },
  });

  const experiencia = watch("experiencia");
  const urgencia = watch("urgencia");

  const onSubmit = async (data: PredictionFormData) => {
    setIsLoading(true);
    try {
      const result = await createPrediction(data);
      onResult(result);
      toast.success("Estimación calculada correctamente con la API.");
    } catch (err: any) {
      console.warn("API Error, falling back to mock:", err);
      toast.warning(
        "Servidor API desconectado. Cargando estimación simulada (Modo Demo).",
      );
      onResult({
        ...mockPredictionResult,
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[720px] mx-auto shadow-xl border-border/80 glass-premium animate-slide-up">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
          Nueva Predicción de Tarea
        </CardTitle>
        <CardDescription className="text-sm">
          Completa los campos para estimar la cantidad de sub-tareas, tiempo
          requerido y nivel de riesgo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Story Points */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="sp" className="font-semibold text-sm">
                  Story Points (SP)
                </Label>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-popover border border-border text-popover-foreground text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    Esfuerzo relativo asignado a la tarea inicial (ej. 1, 2, 3,
                    5, 8, 13).
                  </span>
                </div>
              </div>
              <Input
                id="sp"
                type="number"
                min={1}
                {...register("sp", { valueAsNumber: true })}
                className="bg-background/50 border-muted-foreground/20 hover:border-primary/50 focus:border-primary transition-colors font-medium"
              />
              {errors.sp && (
                <p className="text-xs text-destructive font-medium">
                  {errors.sp.message}
                </p>
              )}
            </div>

            {/* Tipo de tarea */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-sm">Tipo de Tarea</Label>
              <Select
                defaultValue="Backend"
                onValueChange={(value) =>
                  setValue("tipo_tarea", value as TipoTarea)
                }
              >
                <SelectTrigger className="bg-background/50 border-muted-foreground/20 hover:border-primary/50 focus:border-primary transition-colors font-medium">
                  <SelectValue placeholder="Selecciona el área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Backend">Backend Development</SelectItem>
                  <SelectItem value="Frontend">Frontend Development</SelectItem>
                  <SelectItem value="DevOps">DevOps & Cloud</SelectItem>
                  <SelectItem value="Diseño">Diseño UI/UX</SelectItem>
                  <SelectItem value="QA">Quality Assurance (QA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Complejidad técnica */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="complejidad" className="font-semibold text-sm">
                  Complejidad Técnica
                </Label>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-popover border border-border text-popover-foreground text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    Nivel de dificultad técnica de 1 a 10 (1: muy simple, 10:
                    extremadamente compleja).
                  </span>
                </div>
              </div>
              <Input
                id="complejidad"
                type="number"
                min={1}
                max={10}
                {...register("complejidad", { valueAsNumber: true })}
                className="bg-background/50 border-muted-foreground/20 hover:border-primary/50 focus:border-primary transition-colors font-medium"
              />
              {errors.complejidad && (
                <p className="text-xs text-destructive font-medium">
                  {errors.complejidad.message}
                </p>
              )}
            </div>

            {/* Dependencias externas */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="dependencias" className="font-semibold text-sm">
                  Dependencias Externas
                </Label>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-popover border border-border text-popover-foreground text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    Cantidad de otros módulos, APIs externas o equipos de los
                    que depende esta tarea.
                  </span>
                </div>
              </div>
              <Input
                id="dependencias"
                type="number"
                min={0}
                {...register("dependencias", { valueAsNumber: true })}
                className="bg-background/50 border-muted-foreground/20 hover:border-primary/50 focus:border-primary transition-colors font-medium"
              />
              {errors.dependencias && (
                <p className="text-xs text-destructive font-medium">
                  {errors.dependencias.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Experiencia del equipo */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm">
                Experiencia del Equipo
              </Label>
              <ToggleGroup
                type="single"
                value={String(experiencia)}
                onValueChange={(value) => {
                  if (value)
                    setValue("experiencia", Number(value) as Experiencia);
                }}
                className="grid grid-cols-3 gap-2 bg-muted/40 p-1 rounded-lg border border-border/50"
              >
                <ToggleGroupItem
                  value="1"
                  className="text-xs font-medium py-1.5 rounded-md hover:bg-background/60 data-[state=on]:bg-background data-[state=on]:shadow-xs transition-all"
                >
                  Junior (1)
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="2"
                  className="text-xs font-medium py-1.5 rounded-md hover:bg-background/60 data-[state=on]:bg-background data-[state=on]:shadow-xs transition-all"
                >
                  Mid (2)
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="3"
                  className="text-xs font-medium py-1.5 rounded-md hover:bg-background/60 data-[state=on]:bg-background data-[state=on]:shadow-xs transition-all"
                >
                  Senior (3)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Urgencia */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Nivel de Urgencia</Label>
              <ToggleGroup
                type="single"
                value={urgencia}
                onValueChange={(value) => {
                  if (value) setValue("urgencia", value as Urgencia);
                }}
                className="grid grid-cols-3 gap-2 bg-muted/40 p-1 rounded-lg border border-border/50"
              >
                <ToggleGroupItem
                  value="Baja"
                  className="text-xs font-medium py-1.5 rounded-md hover:bg-background/60 data-[state=on]:bg-background data-[state=on]:shadow-xs transition-all"
                >
                  Baja
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Media"
                  className="text-xs font-medium py-1.5 rounded-md hover:bg-background/60 data-[state=on]:bg-background data-[state=on]:shadow-xs transition-all"
                >
                  Media
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Alta"
                  className="text-xs font-medium py-1.5 rounded-md hover:bg-background/60 data-[state=on]:bg-background data-[state=on]:shadow-xs transition-all"
                >
                  Alta
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Rendimiento */}
          <div className="space-y-3.5 p-4 rounded-xl bg-muted/20 border border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Label className="font-semibold text-sm">
                  Factor de Rendimiento del Equipo
                </Label>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-60 p-2 bg-popover border border-border text-popover-foreground text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    Desempeño o velocidad del equipo. 1.0 es el rendimiento
                    óptimo esperado, valores menores indican menor velocidad.
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-primary font-mono px-2 py-0.5 rounded bg-primary/10 border border-primary/10">
                {rendimientoValue[0].toFixed(2)}
              </span>
            </div>
            <Slider
              value={rendimientoValue}
              onValueChange={(value) => {
                setRendimientoValue(value);
                setValue("rendimiento", value[0]);
              }}
              min={0}
              max={1}
              step={0.05}
              className="w-full py-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground px-0.5">
              <span>0.0 (Crítico / Bloqueado)</span>
              <span>0.5 (Moderado)</span>
              <span>1.0 (Óptimo / Alta Velocidad)</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 shadow-md shadow-primary/25 cursor-pointer transform transition-all duration-200 active:scale-[0.99]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando Modelos de Machine Learning...
              </>
            ) : (
              <>
                Calcular Estimación Inteligente
                <ArrowRight className="ml-2 h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
