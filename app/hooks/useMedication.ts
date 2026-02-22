import { useState, useCallback } from "react";
import {
  getMedications,
  deleteMedication,
} from "../services/medicationServices";
import type { Medication } from "../types/medication";
import { ErrorMessages, getUserMessage } from "../lib/errors";
import toast from "react-hot-toast";

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMedications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedications();
      setMedications(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error(ErrorMessages.MEDICATIONS.FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMedication = useCallback(
    async (id: string) => {
      try {
        await deleteMedication(id);
        toast.success("Deleted!");
        await fetchMedications();
      } catch (err) {
        toast.error(ErrorMessages.MEDICATIONS.DELETE_FAILED);
      }
    },
    [fetchMedications]
  );

  return { medications, loading, error, fetchMedications, removeMedication };
}
