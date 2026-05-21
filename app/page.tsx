"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PredictionForm } from "@/components/prediction-form";
import { PredictionResults } from "@/components/prediction-results";
import type { PredictionResult } from "@/lib/types";

export default function PrediccionPage() {
  const [result, setResult] = useState<PredictionResult | null>(null);

  return (
    <>
      <PageHeader
        title="Predicción"
        description="Estima las tareas y tiempo de tu proyecto de software"
      />
      <div className="p-4 md:p-6">
        <PredictionForm onResult={setResult} />
        {result && <PredictionResults result={result} />}
      </div>
    </>
  );
}
