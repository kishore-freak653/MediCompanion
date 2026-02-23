"use client";

import { memo, useEffect, useRef, useState, useMemo } from "react";
import {
  CheckCircle,
  Clock,
  Pill,
  Activity,
  Camera,
  X,
  Mail,
  AlertCircle,
  Timer,
} from "lucide-react";
import type { Medication } from "../../types/medication";
import { useMedicationLogs } from "../../hooks/useMedicationLogs";
import { formatTimeDisplay } from "../../utils/timeFormat";

export interface PatientViewProps {
  medications: Medication[];
  userId: string;
}

// ── Countdown Badge (ticks every second) ──
function CountdownBadge({
  deadlineTime,
  isTaken,
}: {
  deadlineTime: string;
  isTaken: boolean;
}) {
  const getMsUntil = () => {
    const [h, m] = deadlineTime.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.getTime() - Date.now();
  };

  const [ms, setMs] = useState(getMsUntil);

  useEffect(() => {
    if (isTaken) return;
    const interval = setInterval(() => setMs(getMsUntil()), 1000);
    return () => clearInterval(interval);
  }, [deadlineTime, isTaken]);

  if (isTaken) return null;

  const isOverdue = ms <= 0;
  const isUrgent = ms > 0 && ms < 30 * 60 * 1000; // under 30 mins

  const formatMs = (ms: number): string => {
    if (ms <= 0) return "Overdue";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m left`;
    if (m > 0) return `${m}m ${s}s left`;
    return `${s}s left`;
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
        isOverdue
          ? "bg-red-100 text-red-600 border-red-200"
          : isUrgent
            ? "bg-amber-50 text-amber-600 border-amber-200 animate-pulse"
            : "bg-teal-50 text-teal-600 border-teal-100"
      }`}
    >
      <Timer className="w-3 h-3" />
      {formatMs(ms)}
    </span>
  );
}

function PatientView({ medications, userId }: PatientViewProps) {
  const { takenIds, fetchTodayLogs, markMedAsTaken } =
    useMedicationLogs(userId);

  const [activeMedId, setActiveMedId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailAlert, setEmailAlert] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) fetchTodayLogs();
  }, [userId, fetchTodayLogs]);

  // Email alert timer
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    medications.forEach((med) => {
      if (takenIds.includes(med.id)) return;
      const [h, m] = med.deadline_time.split(":").map(Number);
      const deadline = new Date();
      deadline.setHours(h, m, 0, 0);
      const msLeft = deadline.getTime() - Date.now();
      if (msLeft > 0) {
        timers.push(
          setTimeout(() => {
            if (!takenIds.includes(med.id)) setEmailAlert(med.name);
          }, msLeft),
        );
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [medications, takenIds]);

  // ✅ Sort by deadline time (earliest first)
  const sortedMedications = useMemo(() => {
    return [...medications].sort((a, b) =>
      a.deadline_time.localeCompare(b.deadline_time),
    );
  }, [medications]);

  const isMissed = (deadlineTime: string, id: string): boolean => {
    const [h, m] = deadlineTime.split(":").map(Number);
    const deadline = new Date();
    deadline.setHours(h, m, 0, 0);
    return deadline < new Date() && !takenIds.includes(id);
  };

  const takenCount = takenIds.length;
  const totalCount = medications.length;
  const percent =
    totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 🌤️";
    if (hour < 17) return "Good Afternoon ☀️";
    return "Good Evening 🌙";
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmTaken = async (medId: string) => {
    setSubmitting(true);
    try {
      await markMedAsTaken(medId, photoFile ?? undefined);
      setActiveMedId(null);
      handleClearPhoto();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setActiveMedId(null);
    handleClearPhoto();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Email Alert Banner */}
      {emailAlert && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="bg-red-100 p-2 rounded-xl flex-shrink-0">
            <Mail className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-700 text-sm">
              📧 Email Sent to Caretaker!
            </p>
            <p className="text-red-500 text-xs mt-0.5">
              Your caretaker has been notified that{" "}
              <strong>{emailAlert}</strong> was not taken on time.
            </p>
          </div>
          <button
            onClick={() => setEmailAlert(null)}
            className="text-red-300 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Progress Banner */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 p-4 md:p-6 text-white shadow-lg">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full hidden md:block" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full hidden md:block" />
        <p className="text-xs md:text-sm font-medium opacity-80 mb-1">
          {getGreeting()}
        </p>
        <p className="text-lg md:text-2xl font-bold mb-3 md:mb-4">
          {takenCount === totalCount && totalCount > 0
            ? "All done for today! 🎉"
            : `${takenCount} of ${totalCount} medications taken`}
        </p>
        <div className="bg-white/20 rounded-full h-3 mb-2">
          <div
            className="bg-white rounded-full h-3 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs opacity-70">{percent}% complete today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xl md:text-2xl font-bold text-teal-600">
            {totalCount}
          </p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
            Total
          </p>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xl md:text-2xl font-bold text-green-600">
            {takenCount}
          </p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
            Taken
          </p>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xl md:text-2xl font-bold text-orange-500">
            {totalCount - takenCount}
          </p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
            Remaining
          </p>
        </div>
      </div>

      {/* Medication List */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Today's Medications
          </h2>
          {/* ✅ Sorted label */}
          <span className="text-[10px] text-gray-400 ml-auto">
            ↑ sorted by time
          </span>
        </div>

        {sortedMedications.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-teal-50 text-teal-600 p-4 rounded-full">
                <Pill className="w-7 h-7" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-gray-700">
              No medications yet
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Ask your caretaker to add medications.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedMedications.map((med) => {
              const isTaken = takenIds.includes(med.id);
              const isActive = activeMedId === med.id;
              // ✅ Missed = deadline passed AND not taken
              const missed = isMissed(med.deadline_time, med.id);

              return (
                <div
                  key={med.id}
                  className={`rounded-xl md:rounded-2xl shadow-sm border transition-all
                    ${isTaken ? "bg-green-50 border-green-200" : ""}
                    ${missed ? "bg-red-50 border-red-200" : ""}
                    ${!isTaken && !missed ? "bg-white border-gray-100" : ""}
                    ${isActive ? "border-teal-300 ring-2 ring-teal-100" : ""}
                  `}
                >
                  {/* ✅ Missed warning bar */}
                  {missed && (
                    <div className="flex items-center gap-2 px-4 md:px-5 pt-3 pb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <p className="text-xs font-semibold text-red-600">
                        Deadline passed — not taken!
                      </p>
                    </div>
                  )}

                  {/* Med info row */}
                  <div className="px-4 md:px-5 py-3 md:py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-xl flex-shrink-0 ${
                          isTaken
                            ? "bg-green-100"
                            : missed
                              ? "bg-red-100"
                              : "bg-teal-50"
                        }`}
                      >
                        <Pill
                          className={`w-5 h-5 ${
                            isTaken
                              ? "text-green-600"
                              : missed
                                ? "text-red-500"
                                : "text-teal-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`font-semibold ${missed ? "text-red-700" : "text-gray-800"}`}
                        >
                          {med.name}
                        </p>
                        <p className="text-sm text-gray-400">{med.dosage}</p>
                        <div className="flex items-center gap-1 mt-0.5 mb-1">
                          <Clock className="w-3 h-3 text-gray-300" />
                          <p className="text-xs text-gray-400">
                            {formatTimeDisplay(med.deadline_time, "Due by")}
                          </p>
                        </div>
                        {/* ✅ Countdown timer */}
                        <CountdownBadge
                          deadlineTime={med.deadline_time}
                          isTaken={isTaken}
                        />
                        {/* Notes */}
                        {med.notes && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs text-blue-800 font-medium mb-1">
                              📝 Note:
                            </p>
                            <p className="text-xs text-blue-700">{med.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {isTaken ? (
                      <div className="flex items-center gap-1.5 text-green-600 text-xs md:text-sm font-medium bg-green-100 px-3 py-1.5 rounded-full w-full md:w-auto justify-center">
                        <CheckCircle className="w-4 h-4" />
                        Taken
                      </div>
                    ) : !isActive ? (
                      <button
                        onClick={() => setActiveMedId(med.id)}
                        className={`text-white text-sm px-4 py-2 rounded-xl transition-all font-medium shadow-sm w-full md:w-auto active:scale-95 ${
                          missed
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-teal-600 hover:bg-teal-700"
                        }`}
                      >
                        Mark Taken
                      </button>
                    ) : null}
                  </div>

                  {/* Photo Upload Panel */}
                  {isActive && !isTaken && (
                    <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-teal-100 pt-3 md:pt-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-0.5">
                        Add Proof Photo{" "}
                        <span className="text-gray-300 font-normal normal-case">
                          (Optional)
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        Take a photo of your medication or pill organizer as
                        confirmation.
                      </p>

                      {photoPreview ? (
                        <div className="relative w-full mb-3">
                          <img
                            src={photoPreview}
                            alt="Proof preview"
                            className="w-full max-h-48 object-cover rounded-xl border border-gray-200"
                          />
                          <button
                            onClick={handleClearPhoto}
                            className="absolute top-2 right-2 bg-white text-gray-500 hover:text-red-500 p-1 rounded-full shadow"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-teal-200 hover:border-teal-400 text-teal-600 hover:text-teal-700 bg-teal-50/50 rounded-xl py-4 text-sm font-medium transition-all mb-3"
                        >
                          <Camera className="w-4 h-4" />
                          Take Photo / Upload
                        </button>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmTaken(med.id)}
                          disabled={submitting}
                          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {submitting
                            ? "Saving..."
                            : photoFile
                              ? "Confirm with Photo"
                              : "Confirm Taken"}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2.5 border border-gray-200 text-gray-500 hover:text-gray-700 text-sm rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(PatientView);
