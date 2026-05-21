"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { createPrediction, mockPredictionResult } from "@/lib/api"
import type { PredictionResult, TipoTarea, Urgencia, Experiencia } from "@/lib/types"

const predictionSchema = z.object({
  sp: z.number().min(1, "Debe ser al menos 1"),
  experiencia: z.number().min(1).max(3) as z.ZodType<Experiencia>,
  rendimiento: z.number().min(0).max(1),
  complejidad: z.number().min(1, "Debe ser al menos 1"),
  dependencias: z.number().min(0, "No puede ser negativo"),
  tipo_tarea: z.enum(["Backend", "Frontend", "DevOps", "Diseño", "QA"]) as z.ZodType<TipoTarea>,
  urgencia: z.enum(["Baja", "Media", "Alta"]) as z.ZodType<Urgencia>,
})

type PredictionFormData = z.infer<typeof predictionSchema>

interface PredictionFormProps {
  onResult: (result: PredictionResult) => void
}

export function PredictionForm({ onResult }: PredictionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rendimientoValue, setRendimientoValue] = useState([0.75])

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
  })

  const experiencia = watch("experiencia")
  const urgencia = watch("urgencia")

  const onSubmit = async (data: PredictionFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createPrediction(data)
      onResult(result)
    } catch {
      // Use mock data when API is unavailable
      console.log("[v0] API unavailable, using mock data")
      onResult(mockPredictionResult)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-[680px] mx-auto shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Nueva Predicción</CardTitle>
        <CardDescription>
          Ingresa los parámetros del proyecto para obtener una estimación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Story Points */}
          <div className="space-y-2">
            <Label htmlFor="sp">Story Points</Label>
            <Input
              id="sp"
              type="number"
              min={1}
              {...register("sp", { valueAsNumber: true })}
              className="bg-background"
            />
            {errors.sp && (
              <p className="text-xs text-destructive">{errors.sp.message}</p>
            )}
          </div>

          {/* Experiencia del equipo */}
          <div className="space-y-2">
            <Label>Experiencia del equipo</Label>
            <ToggleGroup
              type="single"
              value={String(experiencia)}
              onValueChange={(value) => {
                if (value) setValue("experiencia", Number(value) as Experiencia)
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="1" className="px-4">
                1 – Junior
              </ToggleGroupItem>
              <ToggleGroupItem value="2" className="px-4">
                2 – Mid
              </ToggleGroupItem>
              <ToggleGroupItem value="3" className="px-4">
                3 – Senior
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Rendimiento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Rendimiento</Label>
              <span className="text-sm font-medium text-primary">
                {rendimientoValue[0].toFixed(2)}
              </span>
            </div>
            <Slider
              value={rendimientoValue}
              onValueChange={(value) => {
                setRendimientoValue(value)
                setValue("rendimiento", value[0])
              }}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.0</span>
              <span>1.0</span>
            </div>
          </div>

          {/* Complejidad técnica */}
          <div className="space-y-2">
            <Label htmlFor="complejidad">Complejidad técnica</Label>
            <Input
              id="complejidad"
              type="number"
              min={1}
              {...register("complejidad", { valueAsNumber: true })}
              className="bg-background"
            />
            {errors.complejidad && (
              <p className="text-xs text-destructive">{errors.complejidad.message}</p>
            )}
          </div>

          {/* Dependencias externas */}
          <div className="space-y-2">
            <Label htmlFor="dependencias">Dependencias externas</Label>
            <Input
              id="dependencias"
              type="number"
              min={0}
              {...register("dependencias", { valueAsNumber: true })}
              className="bg-background"
            />
            {errors.dependencias && (
              <p className="text-xs text-destructive">{errors.dependencias.message}</p>
            )}
          </div>

          {/* Tipo de tarea */}
          <div className="space-y-2">
            <Label>Tipo de tarea</Label>
            <Select
              defaultValue="Backend"
              onValueChange={(value) => setValue("tipo_tarea", value as TipoTarea)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Backend">Backend</SelectItem>
                <SelectItem value="Frontend">Frontend</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
                <SelectItem value="Diseño">Diseño</SelectItem>
                <SelectItem value="QA">QA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Urgencia */}
          <div className="space-y-2">
            <Label>Urgencia</Label>
            <ToggleGroup
              type="single"
              value={urgencia}
              onValueChange={(value) => {
                if (value) setValue("urgencia", value as Urgencia)
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="Baja" className="px-4">
                Baja
              </ToggleGroupItem>
              <ToggleGroupItem value="Media" className="px-4">
                Media
              </ToggleGroupItem>
              <ToggleGroupItem value="Alta" className="px-4">
                Alta
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                Calcular estimación
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
