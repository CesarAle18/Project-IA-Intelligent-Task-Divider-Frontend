import type {
  PredictionInput,
  PredictionResult,
  MetricEntry,
  HistoryResponse,
  AppConfig,
  HealthStatus,
  ModelValidation,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: options?.signal || controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let message = `API Error ${response.status}: ${response.statusText}`;
      let details = null;

      try {
        const body = await response.json();
        if (body && body.detail) {
          if (typeof body.detail === "string") {
            message = body.detail;
          } else {
            message = JSON.stringify(body.detail);
          }
          details = body.detail;
        }
      } catch {
        // Body was not JSON or did not have detail property
      }

      throw new ApiError(response.status, message, details);
    }

    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new ApiError(
        408,
        "La solicitud ha superado el límite de tiempo de espera (10s).",
      );
    }
    throw err;
  }
}

// Health Check
export async function checkHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      return { status: "healthy", timestamp: new Date().toISOString() };
    }
    return { status: "unhealthy", timestamp: new Date().toISOString() };
  } catch {
    return { status: "unhealthy", timestamp: new Date().toISOString() };
  }
}

// Prediction
export async function createPrediction(
  input: PredictionInput,
): Promise<PredictionResult> {
  return fetchApi<PredictionResult>("/predecir", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Metrics
export async function getMetrics(): Promise<MetricEntry[]> {
  return fetchApi<MetricEntry[]>("/metricas");
}

// History
export async function getHistory(
  page: number = 1,
  perPage: number = 10,
): Promise<HistoryResponse> {
  return fetchApi<HistoryResponse>(
    `/historial?page=${page}&per_page=${perPage}`,
  );
}

// Config
export async function getConfig(): Promise<AppConfig> {
  return fetchApi<AppConfig>("/config");
}

export async function updateConfig(
  config: Partial<AppConfig>,
): Promise<AppConfig> {
  return fetchApi<AppConfig>("/config", {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

export async function getModelValidation(): Promise<ModelValidation> {
  return fetchApi<ModelValidation>("/model/validation");
}

export async function reloadModels(): Promise<{ message: string; meta: any }> {
  return fetchApi<{ message: string; meta: any }>("/model/reload", {
    method: "POST",
  });
}

// Mock Data for development
export const mockPredictionResult: PredictionResult = {
  id: 42,
  pred_tasks: 8,
  ci_tasks: [6, 11],
  pred_time: 14,
  ci_time: [12, 17],
  pred_risk: "MEDIO",
  probas: { ALTO: 18.5, MEDIO: 63.2, BAJO: 18.3 },
  risk_confidence: 0.632,
  created_at: "2025-07-14T10:32:00",
};

export const mockMetrics: MetricEntry[] = [
  {
    id: 1,
    created_at: "2025-07-01",
    ganador_tasks: "GradientBoosting",
    ganador_time: "XGBoost",
    ganador_risk: "RandomForest",
    tasks_mae: 1.42,
    tasks_rmse: 1.78,
    tasks_mape: 18.5,
    tasks_r2: 0.87,
    time_mae: 2.1,
    time_rmse: 2.45,
    time_mape: 22.3,
    time_r2: 0.83,
    risk_accuracy: 0.91,
    risk_f1: 0.9,
    risk_precision: 0.89,
    risk_recall: 0.91,
  },
  {
    id: 2,
    created_at: "2025-07-08",
    ganador_tasks: "XGBoost",
    ganador_time: "XGBoost",
    ganador_risk: "GradientBoosting",
    tasks_mae: 1.28,
    tasks_rmse: 1.65,
    tasks_mape: 16.2,
    tasks_r2: 0.89,
    time_mae: 1.9,
    time_rmse: 2.2,
    time_mape: 20.1,
    time_r2: 0.85,
    risk_accuracy: 0.93,
    risk_f1: 0.92,
    risk_precision: 0.91,
    risk_recall: 0.93,
  },
  {
    id: 3,
    created_at: "2025-07-15",
    ganador_tasks: "XGBoost",
    ganador_time: "RandomForest",
    ganador_risk: "GradientBoosting",
    tasks_mae: 1.15,
    tasks_rmse: 1.52,
    tasks_mape: 14.8,
    tasks_r2: 0.91,
    time_mae: 1.75,
    time_rmse: 2.05,
    time_mape: 18.5,
    time_r2: 0.87,
    risk_accuracy: 0.94,
    risk_f1: 0.93,
    risk_precision: 0.92,
    risk_recall: 0.94,
  },
  {
    id: 4,
    created_at: "2025-07-22",
    ganador_tasks: "RandomForest",
    ganador_time: "XGBoost",
    ganador_risk: "XGBoost",
    tasks_mae: 1.08,
    tasks_rmse: 1.42,
    tasks_mape: 13.5,
    tasks_r2: 0.92,
    time_mae: 1.65,
    time_rmse: 1.95,
    time_mape: 17.2,
    time_r2: 0.88,
    risk_accuracy: 0.95,
    risk_f1: 0.94,
    risk_precision: 0.93,
    risk_recall: 0.95,
  },
  {
    id: 5,
    created_at: "2025-07-29",
    ganador_tasks: "XGBoost",
    ganador_time: "XGBoost",
    ganador_risk: "XGBoost",
    tasks_mae: 1.02,
    tasks_rmse: 1.35,
    tasks_mape: 12.8,
    tasks_r2: 0.93,
    time_mae: 1.55,
    time_rmse: 1.85,
    time_mape: 16.1,
    time_r2: 0.89,
    risk_accuracy: 0.96,
    risk_f1: 0.95,
    risk_precision: 0.94,
    risk_recall: 0.96,
  },
  {
    id: 6,
    created_at: "2025-08-05",
    ganador_tasks: "XGBoost",
    ganador_time: "GradientBoosting",
    ganador_risk: "XGBoost",
    tasks_mae: 0.98,
    tasks_rmse: 1.28,
    tasks_mape: 12.1,
    tasks_r2: 0.94,
    time_mae: 1.48,
    time_rmse: 1.78,
    time_mape: 15.3,
    time_r2: 0.9,
    risk_accuracy: 0.96,
    risk_f1: 0.95,
    risk_precision: 0.94,
    risk_recall: 0.96,
  },
];

export const mockConfig: AppConfig = {
  columnas_requeridas: ["SP", "Experiencia", "Rendimiento", "Complejidad", "Dependencias", "TipoTarea", "Urgencia", "y_tasks", "y_time", "y_risk"],
  columnas_numericas: ["SP", "Experiencia", "Rendimiento", "Complejidad", "Dependencias"],
  columnas_categoricas: ["TipoTarea", "Urgencia"],
  columnas_outlier_iqr: ["SP", "Complejidad", "Dependencias"],
  tipos_esperados: {
    SP: "numeric", Experiencia: "numeric", Rendimiento: "numeric", Complejidad: "numeric", Dependencias: "numeric",
    TipoTarea: "string", Urgencia: "string", y_tasks: "numeric", y_time: "numeric", y_risk: "numeric"
  },
  rangos_validos: {
    Rendimiento: [0.0, 1.0],
    Experiencia: [1, 2, 3],
    Urgencia: ["Baja", "Media", "Alta"],
    y_risk: [0, 1, 2]
  },
  riesgo_label: {
    "0": "ALTO",
    "1": "MEDIO",
    "2": "BAJO"
  },
  rf_params: {
    "model__n_estimators": [50, 100, 200, 300],
    "model__max_depth": [null, 5, 10, 15, 20]
  },
  gb_params: {
    "model__n_estimators": [50, 100, 200],
    "model__max_depth": [3, 4, 5, 6]
  },
  kfold_splits: 5,
  random_state: 42,
  test_size: 0.2,
  n_iter_search: 20
};

export const mockModelValidation: ModelValidation = {
  timestamp: "2026-05-24 20:09:59",
  version: "3.1-production",
  ganadores: ["GradientBoosting", "GradientBoosting", "LogisticRegression"],
  features: ["SP", "Experiencia", "Rendimiento", "Complejidad", "Dependencias", "TipoTarea", "Urgencia"],
  hiperparametros_optimos: {
    tasks: { "model__subsample": 0.7, "model__n_estimators": 200, "model__max_depth": 4, "model__learning_rate": 0.05 },
    time: { "model__subsample": 0.8, "model__n_estimators": 50, "model__max_depth": 4, "model__learning_rate": 0.1 },
    risk: {}
  },
  diagnostico_entrenamiento: {
    leakage_warnings: [
      "[WARNING] SOSPECHA (Mutual Info): 'SP' comparte un 100.0% de info con 'y_tasks'.",
      "[WARNING] SOSPECHA (Mutual Info): 'SP' comparte un 100.0% de info con 'y_time'.",
      "[WARNING] SOSPECHA (Mutual Info): 'SP' comparte un 100.0% de info con 'y_risk'."
    ],
    kfold_splits: 5,
    calibracion_riesgo: "isotonic_cv5"
  }
};

export const mockHistoryResponse: HistoryResponse = {
  items: [
    {
      id: 1,
      sp: 5,
      experiencia: 2,
      rendimiento: 0.75,
      complejidad: 3,
      dependencias: 2,
      tipo_tarea: "Backend",
      urgencia: "Media",
      pred_tasks: 6,
      ci_tasks: [4, 8],
      pred_time: 10,
      ci_time: [8, 12],
      pred_risk: "BAJO",
      probas: { ALTO: 10, MEDIO: 25, BAJO: 65 },
      risk_confidence: 0.65,
      created_at: "2025-07-14T10:32:00",
    },
    {
      id: 2,
      sp: 8,
      experiencia: 1,
      rendimiento: 0.5,
      complejidad: 5,
      dependencias: 4,
      tipo_tarea: "Frontend",
      urgencia: "Alta",
      pred_tasks: 12,
      ci_tasks: [10, 15],
      pred_time: 18,
      ci_time: [15, 22],
      pred_risk: "ALTO",
      probas: { ALTO: 70, MEDIO: 20, BAJO: 10 },
      risk_confidence: 0.70,
      created_at: "2025-07-13T14:20:00",
    },
    {
      id: 3,
      sp: 3,
      experiencia: 3,
      rendimiento: 0.9,
      complejidad: 2,
      dependencias: 1,
      tipo_tarea: "DevOps",
      urgencia: "Baja",
      pred_tasks: 4,
      ci_tasks: [3, 5],
      pred_time: 5,
      ci_time: [4, 7],
      pred_risk: "BAJO",
      probas: { ALTO: 5, MEDIO: 15, BAJO: 80 },
      risk_confidence: 0.80,
      created_at: "2025-07-12T09:15:00",
    },
    {
      id: 4,
      sp: 13,
      experiencia: 2,
      rendimiento: 0.65,
      complejidad: 4,
      dependencias: 3,
      tipo_tarea: "QA",
      urgencia: "Media",
      pred_tasks: 10,
      ci_tasks: [8, 13],
      pred_time: 15,
      ci_time: [12, 18],
      pred_risk: "MEDIO",
      probas: { ALTO: 25, MEDIO: 55, BAJO: 20 },
      risk_confidence: 0.55,
      created_at: "2025-07-11T16:45:00",
    },
    {
      id: 5,
      sp: 21,
      experiencia: 1,
      rendimiento: 0.4,
      complejidad: 6,
      dependencias: 5,
      tipo_tarea: "Diseño",
      urgencia: "Alta",
      pred_tasks: 18,
      ci_tasks: [15, 22],
      pred_time: 25,
      ci_time: [22, 30],
      pred_risk: "ALTO",
      probas: { ALTO: 75, MEDIO: 18, BAJO: 7 },
      risk_confidence: 0.75,
      created_at: "2025-07-10T11:30:00",
    },
  ],
  total: 25,
  page: 1,
  per_page: 10,
  total_pages: 3,
};
