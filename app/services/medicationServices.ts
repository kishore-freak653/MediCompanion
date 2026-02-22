// services/medicationService.ts
import { supabase } from "@/lib/supabaseClient";
import type { Medication, MedicationFormData } from "../types/medication";

export const getMedications = async (): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Medication[];
};

export const addMedication = async (
  formData: MedicationFormData,
  userId: string,
): Promise<void> => {
  const { error } = await supabase.from("medications").insert({
    ...formData,
    user_id: userId,
  });
  if (error) throw new Error(error.message);
};

export const updateMedicationNotes = async (
  id: string,
  notes: string,
): Promise<void> => {
  const { error } = await supabase
    .from("medications")
    .update({ notes })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const updateMedication = async (
  id: string,
  formData: MedicationFormData,
): Promise<void> => {
  const { error } = await supabase
    .from("medications")
    .update(formData)
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteMedication = async (id: string): Promise<void> => {
  const { error } = await supabase.from("medications").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
