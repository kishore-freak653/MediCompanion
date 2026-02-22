import { supabase } from "@/lib/supabaseClient";
import type { MedicationLog, AdherenceStats } from "../types/medication";

export const getTodayLogs = async (userId: string): Promise<string[]> => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("medication_logs")
    .select("medication_id")
    .eq("user_id", userId)
    .eq("taken_date", today);

  if (error) throw new Error(error.message);
  return (data ?? []).map((log) => log.medication_id);
};

export const markAsTaken = async (
  medicationId: string,
  userId: string,
  photoUrl?: string,
): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  // ✅ Use maybeSingle() instead of single()
  // single() throws 406 when no row found
  // maybeSingle() returns null safely
  const { data: existing } = await supabase
    .from("medication_logs")
    .select("id")
    .eq("medication_id", medicationId)
    .eq("taken_date", today)
    .maybeSingle(); // ✅ key fix

  if (existing) return; // already taken today

  const { error } = await supabase.from("medication_logs").insert({
    medication_id: medicationId,
    user_id: userId,
    taken_date: today,
    status: "taken",
    photo_url: photoUrl ?? null,
  });

  if (error) throw new Error(error.message);
};

// ✅ New: Get historical logs
export const getHistoricalLogs = async (
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<MedicationLog[]> => {
  let query = supabase
    .from("medication_logs")
    .select(
      `
      *,
      medication:medications(*)
    `,
    )
    .eq("user_id", userId)
    .order("taken_date", { ascending: false });

  if (startDate) {
    query = query.gte("taken_date", startDate);
  }
  if (endDate) {
    query = query.lte("taken_date", endDate);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data as MedicationLog[];
};

// ✅ New: Get adherence statistics
export const getAdherenceStats = async (
  userId: string,
  days: number = 30,
): Promise<AdherenceStats> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  // Get all medications for the user
  const { data: medications } = await supabase
    .from("medications")
    .select("id")
    .eq("user_id", userId);

  if (!medications || medications.length === 0) {
    return {
      totalDays: 0,
      takenDays: 0,
      missedDays: 0,
      adherenceRate: 0,
      weeklyData: [],
    };
  }

  // Get all logs in the date range
  const { data: logs } = await supabase
    .from("medication_logs")
    .select("taken_date, medication_id")
    .eq("user_id", userId)
    .gte("taken_date", startDateStr)
    .lte("taken_date", endDateStr);

  // Calculate daily adherence
  const dailyData: Record<string, { taken: number; total: number }> = {};
  const medicationIds = medications.map((m) => m.id);

  // Initialize all days
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    dailyData[dateStr] = { taken: 0, total: medicationIds.length };
  }

  // Count taken medications per day
  logs?.forEach((log) => {
    if (dailyData[log.taken_date]) {
      dailyData[log.taken_date].taken++;
    }
  });

  // Group into weekly data
  const weeklyData: { date: string; taken: number; total: number }[] = [];
  const weeks: Record<string, { taken: number; total: number }> = {};

  Object.entries(dailyData).forEach(([date, data]) => {
    const weekStart = getWeekStart(date);
    if (!weeks[weekStart]) {
      weeks[weekStart] = { taken: 0, total: 0 };
    }
    weeks[weekStart].taken += data.taken;
    weeks[weekStart].total += data.total;
  });

  Object.entries(weeks).forEach(([date, data]) => {
    weeklyData.push({ date, taken: data.taken, total: data.total });
  });

  weeklyData.sort((a, b) => a.date.localeCompare(b.date));

  const totalDays = Object.keys(dailyData).length;
  const takenDays = Object.values(dailyData).filter(
    (d) => d.taken === d.total && d.total > 0,
  ).length;
  const missedDays = totalDays - takenDays;
  const adherenceRate =
    totalDays > 0 ? Math.round((takenDays / totalDays) * 100) : 0;

  return {
    totalDays,
    takenDays,
    missedDays,
    adherenceRate,
    weeklyData,
  };
};

// Helper function to get week start (Monday)
function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split("T")[0];
}
