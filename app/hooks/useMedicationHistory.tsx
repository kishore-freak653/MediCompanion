import { useState, useCallback } from "react";
import {
  getHistoricalLogs,
  getAdherenceStats,
} from "../services/logServices";
import type { MedicationLog, AdherenceStats } from "../types/medication";
import { ErrorMessages } from "../lib/errors";
import toast from "react-hot-toast";

export function useMedicationHistory(userId: string) {
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [stats, setStats] = useState<AdherenceStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(
    async (startDate?: string, endDate?: string) => {
      setLoading(true);
      try {
        const data = await getHistoricalLogs(userId, startDate, endDate);
        setLogs(data);
      } catch {
        toast.error(ErrorMessages.LOGS.FETCH_FAILED);
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const fetchStats = useCallback(
    async (days: number = 30) => {
      try {
        const data = await getAdherenceStats(userId, days);
        setStats(data);
      } catch {
        toast.error(ErrorMessages.LOGS.STATS_FAILED);
      }
    },
    [userId],
  );

  return { logs, stats, loading, fetchHistory, fetchStats };
}
