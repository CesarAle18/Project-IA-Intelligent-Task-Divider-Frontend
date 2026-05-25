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
  risk_confidence?: number; // Confianza de calibración isotónica de la predicción de riesgo (0.0 a 1.0)
  created_at: string;
}

// Metrics Types
export interface MetricEntry {
  id: number;
  created_at: string;
  ganador_tasks: string;
  ganador_time: string;
  ganador_risk: string;
  tasks_mae: number;
  tasks_rmse: number;
  tasks_mape: number;
  tasks_r2: number;
  time_mae: number;
  time_rmse: number;
  time_mape: number;
  time_r2: number;
  risk_accuracy: number;
  risk_f1: number;
  risk_precision: number;
  risk_recall: number;
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
  columnas_requeridas: string[];
  columnas_numericas: string[];
  columnas_categoricas: string[];
  columnas_outlier_iqr: string[];
  tipos_esperados: Record<string, string>;
  rangos_validos: Record<string, any>;
  riesgo_label: Record<string, string>;
  rf_params: Record<string, any[]>;
  gb_params: Record<string, any[]>;
  kfold_splits: number;
  random_state: number;
  test_size: number;
  n_iter_search: number;
}

// Model Validation Info Types
export interface ModelValidation {
  timestamp: string;
  version: string;
  ganadores: string[];
  features: string[];
  hiperparametros_optimos: {
    tasks: Record<string, any>;
    time: Record<string, any>;
    risk: Record<string, any>;
  };
  diagnostico_entrenamiento: {
    leakage_warnings: string[];
    kfold_splits: number;
    calibracion_riesgo: string;
  };
}

// Health Check
export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
}
