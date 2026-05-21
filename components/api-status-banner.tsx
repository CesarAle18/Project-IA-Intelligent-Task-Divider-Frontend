"use client";

import { useApiStatus } from "@/hooks/use-api-status";
import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function ApiStatusBanner() {
  const { isOffline, isChecking, recheck } = useApiStatus();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    const result = await recheck();
    setRetrying(false);
    if (result && result.status === "healthy") {
      toast.success("¡Conexión con el servidor API restablecida!");
    } else {
      toast.error(
        "El servidor API sigue fuera de línea. Continuando en modo demo.",
      );
    }
  };

  if (!isOffline && !isChecking) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md text-amber-600 dark:text-amber-400 py-2.5 px-4 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </div>
          {isChecking ? (
            <span className="flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Comprobando conexión con la API...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 leading-snug text-center sm:text-left">
              <WifiOff className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                <strong>Modo Demo Activo:</strong> El servidor de estimación
                (FastAPI en{" "}
                <code className="bg-amber-500/15 px-1.5 py-0.5 rounded text-xs font-mono">
                  localhost:8000
                </code>
                ) no está disponible. Mostrando datos de ejemplo.
              </span>
            </span>
          )}
        </div>
        {!isChecking && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={retrying}
            className="text-xs h-7 px-3 bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 hover:text-amber-800 dark:hover:text-amber-200 transition-all gap-1.5 rounded-full shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`}
            />
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
