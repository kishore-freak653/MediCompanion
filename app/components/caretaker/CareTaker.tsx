"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Pill,
  Trash2,
  AlertTriangle,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { Medication } from "@/app/types/medication";
import MedicationForm from "../medications/MedicationForm";
import Modal from "../ui/Modal";
import { getTodayLogs } from "../../services/logServices";
import { supabase } from "@/lib/supabaseClient";
import { updateMedicationNotes } from "../../services/medicationServices";
import { sanitizeNotes } from "../../utils/sanitize";
import { formatTimeDisplay } from "../../utils/timeFormat";
import { ErrorMessages } from "../../lib/errors";
import toast from "react-hot-toast";

interface Props {
  medications: Medication[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

const CareTaker = ({ medications, loading, onRefresh, onDelete }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missedAlerts, setMissedAlerts] = useState<string[]>([]);
  const [takenIds, setTakenIds] = useState<string[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState<string>("");

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const ids = await getTodayLogs(data.user.id);
      setTakenIds(ids);
    };
    fetchLogs();
  }, [medications]);

  useEffect(() => {
    const checkMissed = () => {
      const now = new Date().toTimeString().slice(0, 5);
      const missed = medications.filter(
        (med) =>
          med.deadline_time.slice(0, 5) < now && !takenIds.includes(med.id),
      );
      setMissedAlerts(missed.map((m) => m.name));
    };
    checkMissed();
    const interval = setInterval(checkMissed, 60000);
    return () => clearInterval(interval);
  }, [medications, takenIds]);

  const handleClose = () => setIsModalOpen(false);

  const handleEditNotes = (med: Medication) => {
    setEditingNotesId(med.id);
    setNotesValue(med.notes || "");
  };

  const handleSaveNotes = async (medId: string) => {
    try {
      await updateMedicationNotes(medId, sanitizeNotes(notesValue));
      toast.success("Notes updated!");
      setEditingNotesId(null);
      onRefresh();
    } catch {
      toast.error(ErrorMessages.MEDICATIONS.UPDATE_FAILED);
    }
  };

  const handleCancelEdit = () => {
    setEditingNotesId(null);
    setNotesValue("");
  };

  const now = new Date().toTimeString().slice(0, 5);
  const takenCount = takenIds.filter((id) =>
    medications.some((m) => m.id === id),
  ).length;
  const missedCount = medications.filter(
    (m) => m.deadline_time.slice(0, 5) < now && !takenIds.includes(m.id),
  ).length;
  const pendingCount = medications.filter(
    (m) => m.deadline_time.slice(0, 5) >= now && !takenIds.includes(m.id),
  ).length;

  if (loading)
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100 h-20"
          />
        ))}
      </div>
    );

  return (
    <>
      {/* ── Missed Alert Banner ── */}
      {missedAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <div className="bg-red-100 p-2 rounded-xl flex-shrink-0">
            <AlertTriangle className="text-red-500 w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-red-700 text-sm">
              Missed Medication Alert
            </p>
            <p className="text-red-400 text-xs mt-0.5">
              Patient has not taken:{" "}
              <strong className="text-red-600">
                {missedAlerts.join(", ")}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* ── Summary Stats ── */}
      {medications.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">{takenCount}</p>
            <p className="text-xs text-gray-400 mt-1">Taken</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-500">{missedCount}</p>
            <p className="text-xs text-gray-400 mt-1">Missed</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
            <p className="text-xs text-gray-400 mt-1">Pending</p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Medication List
            {medications.length > 0 && (
              <span className="ml-2 bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {medications.length}
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Medication
        </button>
      </div>

      {/* ── Empty State ── */}
      {medications.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-50 text-teal-600 p-5 rounded-full">
              <Pill className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            No medications yet
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Add the first medication for your patient.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            Add first medication
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {medications.map((med, index) => {
            const isTaken = takenIds.includes(med.id);
            const isPastDeadline = med.deadline_time.slice(0, 5) < now;

            return (
              <div
                key={med.id}
                className={`rounded-2xl px-5 py-4 shadow-sm border flex justify-between items-center transition-all group
                  ${isTaken ? "bg-green-50 border-green-200" : ""}
                  ${!isTaken && isPastDeadline ? "bg-red-50/40 border-red-100" : ""}
                  ${!isTaken && !isPastDeadline ? "bg-white border-gray-100 hover:border-teal-200 hover:shadow-md" : ""}
                `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0
                    ${isTaken ? "bg-green-100 text-green-700" : isPastDeadline ? "bg-red-100 text-red-600" : "bg-teal-50 text-teal-700"}
                  `}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{med.name}</p>
                    <p className="text-sm text-gray-400">{med.dosage}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-300" />
                      <p className="text-xs text-gray-400">
                        {formatTimeDisplay(med.deadline_time, "Deadline:")}
                      </p>
                    </div>
                    {/* ✅ Notes display/edit */}
                    {editingNotesId === med.id ? (
                      <div className="mt-2">
                        <textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Add notes or instructions..."
                          rows={2}
                          className="w-full px-2 py-1.5 text-xs border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleSaveNotes(med.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 transition-colors"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      med.notes && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs text-blue-800 font-medium mb-1">
                                📝 Note:
                              </p>
                              <p className="text-xs text-blue-700">{med.notes}</p>
                            </div>
                            <button
                              onClick={() => handleEditNotes(med)}
                              className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                            >
                              <Edit2 className="w-3 h-3 text-blue-600" />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                    {!med.notes && editingNotesId !== med.id && (
                      <button
                        onClick={() => handleEditNotes(med)}
                        className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Add note
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isTaken ? (
                    <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold bg-green-100 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Taken
                    </div>
                  ) : isPastDeadline ? (
                    <div className="flex items-center gap-1.5 text-red-500 text-xs font-semibold bg-red-100 px-3 py-1.5 rounded-full">
                      <XCircle className="w-3.5 h-3.5" />
                      Missed
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                      <Timer className="w-3.5 h-3.5" />
                      Pending
                    </div>
                  )}

                  <button
                    onClick={() => onDelete(med.id)}
                    className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleClose} title="Add Medication">
        <MedicationForm
          onSuccess={() => {
            handleClose();
            onRefresh();
          }}
        />
      </Modal>
    </>
  );
};

export default CareTaker;
