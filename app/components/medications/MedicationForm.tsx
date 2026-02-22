"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Input from "../ui/Input";
import Button from "../ui/Button";
import {
  sanitizeMedicationName,
  sanitizeDosage,
  sanitizeNotes,
  sanitizeTime,
} from "../../utils/sanitize";
import { ErrorMessages } from "../../lib/errors";

const schema = z.object({
  name: z.string().min(1, "Medication name is required").max(200),
  dosage: z.string().min(1, "Dosage is required").max(100),
  deadline_time: z.string().min(1, "Deadline time is required"),
  caretaker_email: z.string().email("Enter a valid email"),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess: () => void;
}

export default function MedicationForm({ onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (formData: FormData) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const payload = {
      name: sanitizeMedicationName(formData.name),
      dosage: sanitizeDosage(formData.dosage),
      deadline_time: sanitizeTime(formData.deadline_time) || formData.deadline_time,
      caretaker_email: formData.caretaker_email,
      notes: sanitizeNotes(formData.notes),
      user_id: userData.user.id,
    };

    try {
      const { error } = await supabase.from("medications").insert(payload);
      if (error) throw error;
      toast.success("Medication added!");
      reset();
      onSuccess();
    } catch {
      toast.error(ErrorMessages.MEDICATIONS.ADD_FAILED);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Medication Name"
        placeholder="e.g. Aspirin"
        {...register("name")}
        error={errors.name?.message}
      />

      <Input
        label="Dosage"
        placeholder="e.g. 500mg"
        {...register("dosage")}
        error={errors.dosage?.message}
      />

      <Input
        label="Take by (deadline)"
        type="time"
        {...register("deadline_time")}
        error={errors.deadline_time?.message}
      />

      {/* ✅ New field */}
      <Input
        label="Caretaker Email"
        placeholder="e.g. caretaker@gmail.com"
        type="email"
        {...register("caretaker_email")}
        error={errors.caretaker_email?.message}
      />

      {/* ✅ Notes field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Notes (Optional)
        </label>
        <textarea
          {...register("notes")}
          placeholder="Add any notes or instructions..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        />
      </div>

      <Button type="submit" fullWidth loading={isSubmitting}>
        Add Medication
      </Button>
    </form>
  );
}
