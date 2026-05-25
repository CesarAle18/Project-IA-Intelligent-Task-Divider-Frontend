# Intelligent Task Divider — AI para planificación ágil de proyectos

Sistema basado en Machine Learning que asiste a Scrum Masters y líderes técnicos en la **división automática de tareas**, **estimación de tiempos** y **predicción de riesgos** en proyectos de desarrollo de software.

---

## Problema o necesidad

En equipos que trabajan con metodologías ágiles (Scrum, Kanban), la planificación de sprints enfrenta problemas recurrentes:

- Las historias de usuario son demasiado **amplias o ambiguas**, lo que dificulta su asignación.
- La **estimación de tiempo y esfuerzo** es imprecisa y depende enteramente del criterio humano.
- No se identifican **dependencias ocultas** entre tareas, generando cuellos de botella.
- El líder técnico o Scrum Master debe invertir tiempo significativo **dividiendo tareas manualmente**.
- La **productividad del equipo** se ve afectada por una descomposición ineficiente del trabajo.

**¿Por qué IA?** Un modelo de Machine Learning puede aprender de datos históricos reales para predecir, de forma objetiva y reproducible:

- En cuántas **sub-tareas** debería dividirse un requerimiento.
- Cuánto **tiempo** tomará desarrollarlo.
- Qué **nivel de riesgo** de retraso presenta.

Esto elimina la subjetividad, acelera la planificación y permite anticipar problemas antes de que ocurran.

---

## Librerías, frameworks y recursos utilizados

### Backend (API)
| Librería | Versión | Propósito |
|----------|---------|-----------|
| FastAPI | >=0.104.1 | Framework web asíncrono para la API REST |
| Uvicorn | >=0.24.0 | Servidor ASGI para servir la API |
| SQLAlchemy | >=2.0.23 | ORM para la base de datos MySQL |
| PyMySQL | >=1.1.0 | Driver de conexión a MySQL |
| Pydantic | >=2.4.2 | Validación de esquemas de entrada/salida |
| Pydantic-Settings | >=2.0.3 | Gestión de configuración vía entorno |
| Python-Multipart | >=0.0.6 | Parseo de formularios |

### Machine Learning
| Librería | Versión | Propósito |
|----------|---------|-----------|
| scikit-learn | 1.6.1 | Preprocesamiento, modelos base, validación, métricas |
| LightGBM | >=4.0.0 | Gradient boosting — modelo ganador para regresión |
| Joblib | >=1.3.2 | Serialización de pipelines entrenados (.pkl) |
| NumPy | >=1.26.0 | Cómputo numérico |
| Pandas | >=2.1.0 | Manipulación y análisis de datos |
| SHAP | >=0.43.0 | Interpretabilidad de predicciones |
| Matplotlib | >=3.8.0 | Visualización de gráficos |
| Seaborn | >=0.13.0 | Visualización estadística |
| SciPy | >=1.11.0 | Cómputo científico |

### Frontend
| Librería | Versión | Propósito |
|----------|---------|-----------|
| Next.js | 16.2.4 | Framework React con App Router |
| React | 19 | UI components |
| TypeScript | 5.7.3 | Tipado estático |
| Tailwind CSS | 4.2.0 | Estilos utilitarios |
| shadcn/ui | — | Componentes de UI sobre Radix UI |
| Recharts | 2.15.0 | Gráficos de métricas (AreaChart) |
| SWR | 2.4.1 | Fetching y caché de datos del backend |
| React Hook Form | 7.54.1 | Manejo de estado del formulario |
| Zod | 3.24.1 | Validación de esquemas |
| Lucide React | 0.564.0 | Iconos |
| Sonner | 1.7.1 | Notificaciones toast |
| Radix UI | ~40 paquetes | Primitivas accesibles (Select, Slider, Tabs, Sheet, etc.) |

### Recursos
- **Base de datos:** MySQL local
- **Documentación API:** Swagger UI (automática en `/docs`)
- **Modelos:** 3 pipelines serializados en `.pkl` + metadatos en `meta.json`
- **Gráficos de evaluación:** Dashboard diagnóstico en PNG + SHAP plots

---

## Construcción del dataset

El dataset se genera mediante un **generador sintético** en `scripts/train_model.py` (función `generar_datos_sinteticos()`).

### Estructura del generador

**85% datos realistas:** Combinaciones aleatorias con distribuciones controladas:
- Story Points: secuencia tipo Fibonacci {1, 2, 3, 5, 8, 13, 21, 34}
- Experiencia: ponderada hacia nivel Mid (40%)
- Rendimiento: uniforme en [0.10, 1.00]
- Complejidad: rango completo 1–10
- Dependencias: distribución Poisson(λ=2.5)
- TipoTarea: Backend (30%), Frontend (25%), DevOps (15%), Diseño (15%), QA (15%)
- Urgencia: Baja (30%), Media (40%), Alta (30%)

Los targets se calculan con **fórmulas ponderadas + ruido gaussiano (18–20%)** para simular variabilidad realista.

**15% edge cases:** 8 escenarios contra-intuitivos diseñados para romper correlaciones espurias:
- `alta_urgencia_bajo_riesgo` — alta urgencia no siempre implica alto riesgo
- `baja_urgencia_alto_riesgo` — baja urgencia no siempre es segura
- `alta_complejidad_senior_ok` — un senior puede manejar alta complejidad
- etc.

### Preprocesamiento

El pipeline de preprocesamiento (`preprocesar_datos()`) aplica:
- Coerción de tipos de datos
- Eliminación de nulos y duplicados
- Validación de rangos (Rendimiento 0–1, Experiencia 1–3, etc.)
- Capping de outliers mediante rango intercuartílico (IQR) en SP y Dependencias
- Detección de data leakage mediante correlación de Pearson y Mutual Information

### Columnas del dataset

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `SP` | numérico (1–40) | Story Points — tamaño del requerimiento |
| `Experiencia` | categórico (1, 2, 3) | Junior, Mid, Senior |
| `Rendimiento` | numérico (0.0–1.0) | Velocidad histórica del equipo |
| `Complejidad` | numérico (1–10) | Complejidad técnica |
| `Dependencias` | numérico (0–10) | Número de dependencias externas |
| `TipoTarea` | categórico | Backend, Frontend, DevOps, Diseno, QA |
| `Urgencia` | categórico | Baja, Media, Alta |
| `y_tasks` | entero | **Target** — número de sub-tareas |
| `y_time` | entero | **Target** — horas estimadas |
| `y_risk` | 0, 1, 2 | **Target** — riesgo (ALTO, MEDIO, BAJO) |

---

## Cantidad de entradas para entrenamiento

El dataset actual contiene **9,081 registros** en `data/proyectos.csv`.

Existe un backup de la versión 1 en `data/proyectos_v1_backup.csv` con la misma cantidad de registros.

---

## Modelos de Machine Learning utilizados

### Modelos evaluados

**Regresores** (para sub-tasks y tiempo):
- `LinearRegression` — línea base
- `RandomForestRegressor` — ensemble de árboles
- `GradientBoostingRegressor` — boosting clásico
- `XGBRegressor` — boosting optimizado (si XGBoost está instalado)
- `LGBMRegressor` — boosting eficiente (LightGBM)

**Clasificadores** (para riesgo):
- `LogisticRegression` — línea base
- `RandomForestClassifier` — ensemble de árboles
- `GradientBoostingClassifier` — boosting clásico
- `XGBClassifier` — boosting optimizado (si XGBoost está instalado)
- `LGBMClassifier` — boosting eficiente (LightGBM)

### Modelos ganadores (seleccionados por validación cruzada)

| Target | Modelo ganador | Hiperparámetros |
|--------|---------------|-----------------|
| Sub-tareas (`y_tasks`) | **LightGBM Regressor** | subsample=0.7, n_estimators=200, max_depth=4, learning_rate=0.05 |
| Tiempo (`y_time`) | **LightGBM Regressor** | subsample=0.7, n_estimators=200, max_depth=6, learning_rate=0.05 |
| Riesgo (`y_risk`) | **LogisticRegression** | (defaults, con calibración isotónica) |

### Arquitectura del pipeline

Cada modelo se envuelve en un `sklearn.pipeline.Pipeline` con:

1. **Preprocesador** (`ColumnTransformer`):
   - `StandardScaler()` para columnas numéricas: SP, Experiencia, Rendimiento, Complejidad, Dependencias
   - `OneHotEncoder(handle_unknown="ignore")` para categóricas: TipoTarea, Urgencia
2. **Estimador**: el modelo ganador
3. **Calibración** (solo riesgo): `CalibratedClassifierCV(estimator, method="isotonic", cv=5)` para probabilidades bien calibradas

### Estrategia de validación

- **KFold** con shuffling (5 folds)
- **TimeSeriesSplit** para estimación conservadora
- **RandomizedSearchCV** para optimización de hiperparámetros
- **Bootstrap** para intervalos de confianza al 90% en inferencia

---

## Nivel de efectividad y métricas

### Métricas finales en test

| Modelo | MAE | RMSE | MAPE | R² |
|--------|-----|------|------|-----|
| Sub-tareas (LightGBM) | 0.654 | 1.122 | 14.25% | **0.973** |
| Tiempo (LightGBM) | 4.188 | 9.506 | 19.01% | **0.922** |

| Modelo | Accuracy | F1-Score | Precisión | Recall |
|--------|----------|----------|-----------|--------|
| Riesgo (LogisticRegression) | **0.949** | **0.949** | **0.949** | **0.949** |

### Interpretación

- **R² > 0.97 en sub-tareas** — el modelo explica casi toda la variabilidad. La predicción de división de tareas es altamente confiable.
- **R² > 0.92 en tiempo** — muy buena capacidad predictiva, con margen de error promedio de ~4 horas (MAE).
- **F1 > 0.94 en riesgo** — clasificación robusta y balanceada entre las tres clases (ALTO, MEDIO, BAJO).

### Recursos de evaluación visuales

- `data/plots/evaluacion_modelo_diagnostico.png` — dashboard de 9 paneles (real vs predicho, matriz de confusión, learning curves, calibración)
- `data/shap/shap_sub-tareas.png` — importancia de features para sub-tareas
- `data/shap/shap_tiempo.png` — importancia de features para tiempo
- `data/shap/shap_riesgo.png` — importancia de features para riesgo

---

## Predicciones generadas por el sistema

El endpoint `POST /predecir` recibe 7 parámetros de entrada y devuelve:

### Entrada
```json
{
  "sp": 13,
  "experiencia": 2,
  "rendimiento": 0.7,
  "complejidad": 7,
  "dependencias": 3,
  "tipo_tarea": "Backend",
  "urgencia": "Alta"
}
```

### Salida
```json
{
  "pred_tasks": 5,
  "ci_tasks": [4, 7],
  "pred_time": 32,
  "ci_time": [27, 37],
  "pred_risk": "ALTO",
  "probas": { "ALTO": 72.3, "MEDIO": 20.1, "BAJO": 7.6 },
  "risk_confidence": 72.3,
  "created_at": "2026-05-25T12:00:00"
}
```

- **`pred_tasks`**: Número óptimo de sub-tareas (entero, mínimo 1)
- **`ci_tasks`**: Intervalo de confianza al 90%
- **`pred_time`**: Horas estimadas de desarrollo
- **`ci_time`**: Intervalo de confianza al 90%
- **`pred_risk`**: ALTO / MEDIO / BAJO
- **`probas`**: Probabilidad porcentual por cada clase de riesgo
- **`risk_confidence`**: Confianza en la predicción (probabilidad de la clase ganadora)

---

## Cómo se usaron las predicciones para construir una solución de cara al usuario

Las predicciones del modelo se sirven a través de una **API REST** que funciona como el cerebro del sistema:

1. **Planificador automático**: El Scrum Master ingresa los datos de una historia de usuario y recibe al instante cuántas sub-tareas crear, cuánto tiempo estimar y qué riesgo anticipar.
2. **Visibilidad de incertidumbre**: Cada predicción incluye intervalos de confianza y probabilidades por clase, no solo un valor puntual — el usuario entiende el rango de posibilidades.
3. **Historial y aprendizaje continuo**: Todas las predicciones se almacenan en MySQL, permitiendo auditoría, trazabilidad y mejora del modelo con datos reales.
4. **Métricas visibles**: El equipo puede consultar la evolución del rendimiento del modelo a través del dashboard de métricas históricas.

---

## Despliegue en la web

### Backend (completamente funcional)

1. **Servidor local**: Ejecutado con `uvicorn app.main:app --reload`
2. **Documentación interactiva**: Swagger UI disponible en `http://localhost:8000/docs`
3. **Endpoints REST** con validación Pydantic y respuestas tipadas
4. **CORS abierto** (`allow_origins=["*"]`) para permitir consumo desde cualquier frontend
5. **Hot-reload de modelos** sin reiniciar servidor vía `POST /model/reload`
6. **Archivos estáticos** servidos en `/data` (plots de evaluación, SHAP)

### Frontend

Interfaz web desarrollada con **Next.js 16 (App Router) + React 19 + TypeScript**, desplegada localmente con el servidor de desarrollo de Next.js.

**Stack visual:** Tailwind CSS v4 con esquema de color oklch, componentes shadcn/ui (estilo New York) basados en Radix UI, animaciones CSS personalizadas (glass morphism, fade-in, slide-up).

**Conectividad:** El frontend se comunica con el backend FastAPI a través de 7 endpoints REST. Cada llamada a la API incluye un timeout de 10 segundos y un sistema de **fallback a datos mock** cuando el backend no está disponible, mostrando un banner "Modo Demo" al usuario.

---

## Explicación del frontend

### Estructura

```
Project-IA-Intelligent-Task-Divider-Frontend/
├── app/                           # App Router de Next.js
│   ├── layout.tsx                 # Layout raíz (sidebar + toaster)
│   ├── page.tsx                   # Página de predicción (/)
│   ├── dashboard/page.tsx         # Dashboard de métricas (/dashboard)
│   ├── historial/page.tsx         # Historial de predicciones (/historial)
│   └── configuracion/page.tsx     # Configuración del modelo (/configuracion)
├── components/
│   ├── app-sidebar.tsx            # Sidebar navegación + health status
│   ├── page-header.tsx            # Encabezado reutilizable
│   ├── prediction-form.tsx        # Formulario de predicción (7 campos)
│   ├── prediction-results.tsx     # Visualización de resultados
│   ├── risk-badge.tsx             # Badge de riesgo (ALTO/MEDIO/BAJO)
│   ├── risk-probability-bar.tsx   # Barras de probabilidad por clase
│   ├── api-status-banner.tsx      # Banner de API offline
│   └── ui/                        # shadcn/ui (60+ componentes)
├── hooks/
│   ├── use-api-status.ts          # Health check periódico con SWR
│   └── use-toast.ts               # Estado de notificaciones
├── lib/
│   ├── api.ts                     # Cliente API + mocks de desarrollo
│   └── types.ts                   # Interfaces TypeScript
└── styles/
    └── globals.css                # Tailwind v4 + variables CSS
```

### Páginas

#### `/` — Formulario de predicción
Formulario con 7 campos controlados por **React Hook Form** + **Zod**:
- **Story Points (SP):** Input numérico restringido a valores de Fibonacci {1, 2, 3, 5, 8, 13, 21, 34}
- **Tipo de Tarea:** Select (Backend, Frontend, DevOps, Diseño, QA)
- **Complejidad Técnica:** Input numérico 1–10
- **Dependencias Externas:** Input numérico ≥ 0
- **Experiencia del Equipo:** ToggleGroup (Junior 1, Mid 2, Senior 3)
- **Urgencia:** ToggleGroup (Baja, Media, Alta)
- **Factor de Rendimiento:** Slider 0.0–1.0 con etiquetas (Crítico, Moderado, Óptimo)

Al enviar, llama a `POST /predecir`. En caso de error, usa datos mock y muestra un toast informativo.

Los resultados se despliegan en 3 tarjetas animadas con **CountUpNumber** (animación contador con `requestAnimationFrame`):
1. **Sub-tareas** — valor predicho + intervalo de confianza 90%
2. **Duración** — horas estimadas + intervalo de confianza 90%
3. **Riesgo** — nivel con RiskBadge + barras de probabilidad (ALTO/MEDIO/BAJO) + confianza calibrada

#### `/dashboard` — Dashboard de métricas
Datos obtenidos de `GET /metricas` mediante SWR con polling.

- **4 tarjetas de resumen:** Tasks MAE, Tasks R², Risk F1, Risk Accuracy (cada una con flecha de tendencia verde/roja)
- **3 gráficos Recharts (AreaChart):**
  - Evolución de MAE (tasks + time)
  - Evolución de R² (tasks + time)
  - Evolución de F1 y Accuracy (riesgo)
- **3 tarjetas de modelos ganadores:** Muestra el algoritmo ganador para cada target con ícono de trofeo

#### `/historial` — Historial de predicciones
Datos paginados desde `GET /historial?page=N&per_page=N` mediante SWR.

- Tabla con columnas: ID, Tipo Tarea, Urgencia, SP, Experiencia, Sub-tareas, Tiempo, Riesgo, Fecha
- Paginación manual con controles anterior/siguiente
- Al hacer clic en una fila se abre un **Sheet** (panel deslizable) con detalle completo:
  - Parámetros de entrada
  - Resultados con intervalos de confianza y barras de probabilidad

#### `/configuracion` — Configuración del modelo
Tres pestañas (Tabs):
1. **Ajustes:** Formulario para editar K-Fold Splits, Random State, Test Size, Search Iterations + botones para recargar modelos en caliente y ver metadatos
2. **Validación:** Alertas de data leakage, modelos ganadores, imagen del dashboard diagnóstico
3. **SHAP:** Selector de modelo (Sub-tareas / Tiempo / Riesgo) que muestra las imágenes SHAP interpretativas

### Manejo de estados

| Estado | Estrategia |
|--------|-----------|
| **Carga** | Skeleton loaders (shadcn/ui Skeleton) |
| **Vacío** | EmptyState con ícono y mensaje amigable |
| **Error** | Toast Sonner + fallback a datos mock |
| **API offline** | ApiStatusBanner sticky + "Modo Demo" en páginas |

### Conexión con el backend

| Función | Endpoint | Propósito |
|---------|----------|-----------|
| `checkHealth()` | `GET /health` | Health check (5s timeout) |
| `createPrediction()` | `POST /predecir` | Enviar formulario de predicción |
| `getMetrics()` | `GET /metricas` | Obtener métricas del modelo |
| `getHistory()` | `GET /historial` | Historial paginado |
| `getConfig()` | `GET /config` | Obtener configuración |
| `updateConfig()` | `PUT /config` | Actualizar configuración |
| `getModelValidation()` | `GET /model/validation` | Diagnóstico de validación |
| `reloadModels()` | `POST /model/reload` | Recargar modelos .pkl |

Todas las funciones incluyen un **fallback a datos mock** cuando el backend no responde, permitiendo el desarrollo y demostración del frontend de forma independiente.

El estado de la API se monitorea mediante SWR con `refreshInterval: 15000` (15 segundos) sobre el endpoint `/health`.

---

## Explicación del backend

### Estructura

```
app/
├── main.py                  # Punto de entrada FastAPI + CORS + startup
├── database.py              # Conexión SQLAlchemy a MySQL
├── models/                  # Modelos ORM (Prediccion, MetricaModelo)
├── schemas/                 # Schemas Pydantic de request/response
├── routers/                 # Rutas de la API
│   ├── prediccion.py        # POST /predecir, GET /historial
│   ├── metricas.py          # GET /metricas, POST /model/reload, GET /model/validation
│   └── config.py            # GET /config, PUT /config
└── services/                # Lógica de negocio
    ├── ml_service.py        # Singleton que carga .pkl y ejecuta predicciones
    └── config_service.py    # Lectura/escritura de config.json
```

### Flujo de una predicción

1. El usuario envía 7 parámetros a `POST /predecir`
2. `MLService.predict()` crea un DataFrame con los datos
3. Ejecuta los 3 pipelines serializados:
   - `pipe_tasks` → sub-tareas (con bootstrap CI)
   - `pipe_time` → tiempo (con bootstrap CI)
   - `pipe_risk` → riesgo + probabilidades calibradas
4. Guarda el resultado en MySQL (`predicciones`)
5. Retorna la respuesta completa

### Base de datos

- **Motor**: MySQL
- **Tablas**:
  - `predicciones` — historial de inputs, outputs, probabilidades e intervalos
  - `metricas_modelo` — métricas de evaluación por entrenamiento

### Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check del servidor |
| POST | `/predecir` | Generar predicción |
| GET | `/historial` | Historial paginado |
| GET | `/historial/{id}` | Detalle de una predicción |
| GET | `/metricas` | Métricas históricas del modelo |
| GET | `/model/validation` | Metadatos del modelo entrenado |
| POST | `/model/reload` | Recargar modelos .pkl en caliente |
| GET | `/config` | Configuración del sistema |
| PUT | `/config` | Actualizar configuración |

---

## Cómo se aprovecharon las predicciones para generar nuevas reglas o comportamientos

El sistema no solo predice, sino que **retroalimenta su propio comportamiento**:

1. **Análisis SHAP**: Cada entrenamiento genera gráficos SHAP que revelan qué features impactan más cada target. Esto permite al equipo ajustar sus reglas de planificación (ej: "si la complejidad > 7 y hay dependencias, siempre dividir en al menos 4 sub-tareas").

2. **Análisis de sensibilidad**: El script de entrenamiento ejecuta un análisis post-entrenamiento que varía una feature a la vez y muestra cómo cambian las predicciones. Esto permite derivar reglas del tipo:
   - "Aumentar urgencia de Baja a Alta incrementa el riesgo en X%"
   - "Reducir dependencias de 5 a 2 disminuye el tiempo estimado en Y horas"

3. **Configuración dinámica**: El endpoint `PUT /config` permite modificar hiperparámetros, rangos de validación y columnas sin tocar código. El sistema se adapta a nuevas reglas de negocio en caliente.

4. **Calibración isotónica**: El clasificador de riesgo utiliza `CalibratedClassifierCV` con método isotónico, lo que asegura que las probabilidades predichas sean interpretables como confianza real — permitiendo establecer umbrales de acción (ej: "si confianza > 85% en riesgo ALTO, escalar automáticamente").

---

## Interfaz, página web o recurso final y su objetivo

### Frontend funcional + API REST

La solución completa consta de dos componentes desplegados localmente:

**Backend (FastAPI)** — `http://localhost:8000`
- API REST con 8 endpoints documentados en Swagger (`/docs`)
- Modelos de ML cargados en memoria
- Archivos estáticos en `/data/` (plots, SHAP)

**Frontend (Next.js)** — `http://localhost:3000`
- **Formulario de predicción:** 7 campos validados con Zod, resultados con animación CountUpNumber, intervalos de confianza y barras de probabilidad de riesgo
- **Dashboard de métricas:** 4 indicadores clave (MAE, R², F1, Accuracy) con 3 gráficos Recharts de evolución temporal y modelos ganadores
- **Historial paginado:** Tabla con todas las predicciones almacenadas, detalle en panel lateral (Sheet)
- **Configuración del modelo:** Editor de hiperparámetros (K-Fold, Test Size, Random State), recarga en caliente, visualización de diagnósticos de validación y gráficos SHAP
- **Resiliencia:** Sistema de mock data que permite usar el frontend incluso con el backend offline, con banner informativo "Modo Demo"

### Objetivo del sistema

Servir como **asistente inteligente de planificación ágil** que:

- 🧩 **Divide automáticamente** historias de usuario en sub-tareas manejables
- ⏱️ **Estima tiempos** de desarrollo con intervalos de confianza
- 🚨 **Predice riesgos** de retraso con probabilidades calibradas
- 📊 **Provee métricas** para que el equipo mejore su proceso continuamente
- 🔄 **Se adapta** a nuevos datos y configuraciones sin re-despliegue

---

## Cómo ejecutar el proyecto localmente

### Requisitos

- Python 3.11+
- MySQL corriendo en `localhost:3306`

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd Project-IA-Intelligent-Task-Divider-Api

# Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales de MySQL

# Inicializar base de datos
mysql -u root < scripts/init_db.sql

# Ejecutar servidor
uvicorn app.main:app --reload
```

### Frontend

```bash
# Desde la raíz del frontend
cd Project-IA-Intelligent-Task-Divider-Frontend

# Instalar dependencias
npm install

# Configurar variable de entorno (opcional, por defecto apunta a localhost:8000)
# En .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Ejecutar servidor de desarrollo
npm run dev
```

### Acceder

- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs
- **Plots y SHAP:** http://localhost:8000/data/plots/

### Reentrenar modelos

```bash
python scripts/train_model.py
```

---

## Estructura del repositorio

```
Project-IA-Intelligent-Task-Divider/
├── README.md
│
├── Project-IA-Intelligent-Task-Divider-Api/       # Backend (FastAPI)
│   ├── .env.example
│   ├── requirements.txt
│   ├── analyze_dataset.py
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/          # ORM (Prediccion, MetricaModelo)
│   │   ├── schemas/         # Pydantic (PrediccionRequest, etc.)
│   │   ├── routers/         # Endpoints (prediccion, metricas, config)
│   │   └── services/        # MLService, ConfigService
│   ├── data/
│   │   ├── proyectos.csv    # Dataset (9,081 registros)
│   │   ├── config.json      # Configuración del modelo
│   │   ├── metricas_historial.csv
│   │   ├── plots/           # Dashboard diagnóstico
│   │   └── shap/            # Gráficos SHAP
│   ├── models/
│   │   ├── pipe_tasks.pkl   # Pipeline sub-tareas
│   │   ├── pipe_time.pkl    # Pipeline tiempo
│   │   ├── pipe_risk.pkl    # Pipeline riesgo
│   │   └── meta.json        # Metadatos del entrenamiento
│   └── scripts/
│       ├── train_model.py   # Entrenamiento completo
│       └── init_db.sql      # Schema MySQL
│
└── Project-IA-Intelligent-Task-Divider-Frontend/  # Frontend (Next.js)
    ├── package.json
    ├── next.config.mjs
    ├── tsconfig.json
    ├── app/
    │   ├── layout.tsx        # Layout raíz
    │   ├── page.tsx          # Página de predicción (/)
    │   ├── dashboard/page.tsx
    │   ├── historial/page.tsx
    │   └── configuracion/page.tsx
    ├── components/
    │   ├── prediction-form.tsx
    │   ├── prediction-results.tsx
    │   ├── risk-badge.tsx
    │   ├── risk-probability-bar.tsx
    │   ├── app-sidebar.tsx
    │   ├── api-status-banner.tsx
    │   └── ui/               # shadcn/ui
    ├── hooks/
    ├── lib/
    │   ├── api.ts            # Cliente API + mocks
    │   └── types.ts          # Interfaces TypeScript
    └── styles/
        └── globals.css       # Tailwind v4
```
