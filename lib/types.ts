// Prediction Types
export type TipoTarea = "Backend" | "Frontend" | "DevOps" | "Diseño" | "QA";
export type Urgencia = "Baja" | "Media" | "Alta";
export type Experiencia = 1 | 2 | 3;
export type RiskLevel = "ALTO" | "MEDIO" | "BAJO";

export interface PredictionInput {
  sp: number;
  experiencia: Experiencia;
  rendimiento: number;
  complejidad: number;
  dependencias: number;
  tipo_tarea: TipoTarea;
  urgencia: Urgencia;
}

export interface PredictionResult {
  id: number;
  pred_tasks: number;
  ci_tasks: [number, number];
  pred_time: number;
  ci_time: [number, number];
  pred_risk: RiskLevel;
  probas: {
    ALTO: number;
    MEDIO: number;
    BAJO: number;
  };
  created_at: string;
}

// Metrics Types
export interface MetricEntry {
  timestamp: string;
  ganador_tasks: string;
  ganador_time: string;
  ganador_risk: string;
  tasks_mae: number;
  tasks_r2: number;
  time_mae: number;
  time_r2: number;
  risk_accuracy: number;
  risk_f1: number;
}

// History Types
export interface HistoryEntry extends PredictionResult {
  sp: number;
  experiencia: Experiencia;
  rendimiento: number;
  complejidad: number;
  dependencias: number;
  tipo_tarea: TipoTarea;
  urgencia: Urgencia;
}

export interface HistoryResponse {
  items: HistoryEntry[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Config Types
export interface AppConfig {
  rendimiento_min: number;
  rendimiento_max: number;
  experiencia_valida: number[];
  urgencia_valida: string[];
  outlier_columns: string[];
  kfold_splits: number;
  random_state: number;
  test_size: number;
  n_iter_search: number;
  ganador_tasks: string;
  ganador_time: string;
  ganador_risk: string;
}

// Health Check
export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
}
