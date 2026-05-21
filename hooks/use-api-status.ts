import useSWR from "swr";
import { checkHealth } from "@/lib/api";

export function useApiStatus() {
  const { data, error, mutate, isLoading } = useSWR("api-health", checkHealth, {
    refreshInterval: 15000, // Check every 15 seconds
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const isOffline = data ? data.status === "unhealthy" : error ? true : false;
  const isChecking = isLoading && !data && !error;

  return {
    isOffline,
    isChecking,
    status: data ? data.status : error ? "unhealthy" : "checking",
    recheck: mutate,
  };
}
