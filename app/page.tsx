"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PredictionForm } from "@/components/prediction-form";
import { PredictionResults } from "@/components/prediction-results";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PredictionResult } from "@/lib/types";

export default function PrediccionPage() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleResult = (newResult: PredictionResult) => {
    setResult(newResult);
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setResult(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Predicción"
        description="Estima las tareas y tiempo de tu proyecto de software"
      />
      <div className="p-4 md:p-6">
        <div className="mb-6 rounded-lg border bg-card p-4 md:p-5">
          <h2 className="text-base font-semibold text-foreground">Sobre el proyecto</h2>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Este sistema utiliza Machine Learning para asistir a Scrum Masters y líderes
            técnicos en la división automática de tareas, estimación de tiempos y
            predicción de riesgos en proyectos de desarrollo de software. El modelo
            aprende de datos históricos para predecir de forma objetiva la cantidad de
            sub-tareas, el tiempo de desarrollo y el nivel de riesgo de cada
            requerimiento.
          </p>
        </div>
        <PredictionForm onResult={handleResult} />
      </div>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              Resultados de la Predicción
            </DialogTitle>
          </DialogHeader>
          {result && <PredictionResults result={result} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
