import { useState, useCallback } from "react";
import { getTodayLogs, markAsTaken } from "../services/logServices";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { ErrorMessages } from "../lib/errors";

export function useMedicationLogs(userId: string) {
  const [takenIds, setTakenIds] = useState<string[]>([]);

  const fetchTodayLogs = useCallback(async () => {
    if (!userId) return;
    try {
      const ids = await getTodayLogs(userId);
      setTakenIds(ids);
    } catch {
      toast.error(ErrorMessages.LOGS.FETCH_FAILED);
    }
  }, [userId]);

  const markMedAsTaken = useCallback(
    async (medicationId: string, photoFile?: File) => {
      try {
        let photoUrl: string | undefined;
        if (photoFile) {
          const fileName = `${userId}/${medicationId}-${Date.now()}`;
          const { error: uploadError } = await supabase.storage
            .from("medication-proofs")
            .upload(fileName, photoFile);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage
            .from("medication-proofs")
            .getPublicUrl(fileName);
          photoUrl = data.publicUrl;
        }
        await markAsTaken(medicationId, userId, photoUrl);
        toast.success("Marked as taken!");
        await fetchTodayLogs();
      } catch {
        toast.error(ErrorMessages.LOGS.MARK_TAKEN_FAILED);
      }
    },
    [userId, fetchTodayLogs]
  );

  return { takenIds, fetchTodayLogs, markMedAsTaken };
}
  