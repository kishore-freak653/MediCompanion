export interface Medication {
  id: string;
  name: string;
  dosage: string;
  deadline_time: string;
  created_at: string;
  notes?: string; // Optional notes field
}

export interface MedicationFormData {
  name: string;
  dosage: string;
  deadline_time: string;
  notes?: string; // Optional notes field
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  user_id: string;
  taken_date: string;
  status: string;
  photo_url: string | null;
  created_at: string;
  medication?: Medication; // Joined medication data
}

export interface AdherenceStats {
  totalDays: number;
  takenDays: number;
  missedDays: number;
  adherenceRate: number;
  weeklyData: { date: string; taken: number; total: number }[];
}
