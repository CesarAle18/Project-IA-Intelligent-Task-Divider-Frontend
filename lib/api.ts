import type {
  PredictionInput,
  PredictionResult,
  MetricEntry,
  HistoryResponse,
  AppConfig,
  HealthStatus,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`)
  }

  return response.json()
}

// Health Check
export async function checkHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    })
    if (response.ok) {
      return { status: "healthy", timestamp: new Date().toISOString() }
    }
    return { status: "unhealthy", timestamp: new Date().toISOString() }
  } catch {
    return { status: "unhealthy", timestamp: new Date().toISOString() }
  }
}

// Prediction
export async function createPrediction(
  input: PredictionInput
): Promise<PredictionResult> {
  return fetchApi<PredictionResult>("/predecir", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

// Metrics
export async function getMetrics(): Promise<MetricEntry[]> {
  return fetchApi<MetricEntry[]>("/metricas")
}

// History
export async function getHistory(
  page: number = 1,
  perPage: number = 10
): Promise<HistoryResponse> {
  return fetchApi<HistoryResponse>(
    `/historial?page=${page}&per_page=${perPage}`
  )
}

// Config
export async function getConfig(): Promise<AppConfig> {
  return fetchApi<AppConfig>("/config")
}

export async function updateConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  return fetchApi<AppConfig>("/config", {
    method: "PUT",
    body: JSON.stringify(config),
  })
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
  created_at: "2025-07-14T10:32:00",
}

export const mockMetrics: MetricEntry[] = [
  {
    timestamp: "2025-07-01",
    ganador_tasks: "GradientBoosting",
    ganador_time: "XGBoost",
    ganador_risk: "RandomForest",
    tasks_mae: 1.42,
    tasks_r2: 0.87,
    time_mae: 2.1,
    time_r2: 0.83,
    risk_accuracy: 0.91,
    risk_f1: 0.9,
  },
  {
    timestamp: "2025-07-08",
    ganador_tasks: "XGBoost",
    ganador_time: "XGBoost",
    ganador_risk: "GradientBoosting",
    tasks_mae: 1.28,
    tasks_r2: 0.89,
    time_mae: 1.9,
    time_r2: 0.85,
    risk_accuracy: 0.93,
    risk_f1: 0.92,
  },
  {
    timestamp: "2025-07-15",
    ganador_tasks: "XGBoost",
    ganador_time: "RandomForest",
    ganador_risk: "GradientBoosting",
    tasks_mae: 1.15,
    tasks_r2: 0.91,
    time_mae: 1.75,
    time_r2: 0.87,
    risk_accuracy: 0.94,
    risk_f1: 0.93,
  },
  {
    timestamp: "2025-07-22",
    ganador_tasks: "RandomForest",
    ganador_time: "XGBoost",
    ganador_risk: "XGBoost",
    tasks_mae: 1.08,
    tasks_r2: 0.92,
    time_mae: 1.65,
    time_r2: 0.88,
    risk_accuracy: 0.95,
    risk_f1: 0.94,
  },
  {
    timestamp: "2025-07-29",
    ganador_tasks: "XGBoost",
    ganador_time: "XGBoost",
    ganador_risk: "XGBoost",
    tasks_mae: 1.02,
    tasks_r2: 0.93,
    time_mae: 1.55,
    time_r2: 0.89,
    risk_accuracy: 0.96,
    risk_f1: 0.95,
  },
  {
    timestamp: "2025-08-05",
    ganador_tasks: "XGBoost",
    ganador_time: "GradientBoosting",
    ganador_risk: "XGBoost",
    tasks_mae: 0.98,
    tasks_r2: 0.94,
    time_mae: 1.48,
    time_r2: 0.90,
    risk_accuracy: 0.96,
    risk_f1: 0.95,
  },
]

export const mockConfig: AppConfig = {
  rendimiento_min: 0,
  rendimiento_max: 1,
  experiencia_valida: [1, 2, 3],
  urgencia_valida: ["Baja", "Media", "Alta"],
  outlier_columns: ["SP", "Complejidad", "Dependencias"],
  kfold_splits: 5,
  random_state: 42,
  test_size: 0.2,
  n_iter_search: 50,
  ganador_tasks: "XGBoost",
  ganador_time: "GradientBoosting",
  ganador_risk: "XGBoost",
}

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
      created_at: "2025-07-10T11:30:00",
    },
  ],
  total: 25,
  page: 1,
  per_page: 10,
  total_pages: 3,
}
