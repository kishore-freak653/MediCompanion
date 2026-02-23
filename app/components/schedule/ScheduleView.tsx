"use client";

import { memo, useMemo } from "react";
import { Calendar as CalendarIcon, Clock, Pill } from "lucide-react";
import type { Medication } from "../../types/medication";
import { formatTime12Hour } from "../../utils/timeFormat";

export interface ScheduleViewProps {
  medications: Medication[];
}

function ScheduleView({ medications }: ScheduleViewProps) {
  const today = new Date();

  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Sort medications by deadline_time
  const sortedMeds = useMemo(() => {
    return [...medications].sort((a, b) =>
      a.deadline_time.localeCompare(b.deadline_time),
    );
  }, [medications]);

  // Check if a deadline has passed
  const isPast = (time: string): boolean => {
    const [h, m] = time.split(":").map(Number);
    const deadline = new Date();
    deadline.setHours(h, m, 0, 0);
    return deadline < new Date();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-teal-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Today's Schedule
            </h2>
            <p className="text-xs text-gray-400">{todayLabel}</p>
          </div>
        </div>
        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-100">
          {sortedMeds.length} medication{sortedMeds.length !== 1 ? "s" : ""}{" "}
          today
        </span>
      </div>

      {/* List */}
      {sortedMeds.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <Pill className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">
            No medications scheduled for today
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Ask your caretaker to add medications.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedMeds.map((med, idx) => {
            const past = isPast(med.deadline_time);
            return (
              <div
                key={med.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  past
                    ? "bg-gray-50 border-gray-200 opacity-60"
                    : "bg-white border-gray-100 shadow-sm"
                }`}
              >
                {/* Index */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    past
                      ? "bg-gray-200 text-gray-500"
                      : "bg-teal-50 text-teal-700"
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Icon */}
                <div
                  className={`p-2 rounded-xl flex-shrink-0 ${past ? "bg-gray-100" : "bg-teal-50"}`}
                >
                  <Pill
                    className={`w-4 h-4 ${past ? "text-gray-400" : "text-teal-600"}`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm ${past ? "text-gray-400" : "text-gray-800"}`}
                  >
                    {med.name}
                  </p>
                  <p className="text-xs text-gray-400">{med.dosage}</p>
                  {med.notes && (
                    <p className="text-xs text-blue-600 mt-0.5 truncate">
                      📝 {med.notes}
                    </p>
                  )}
                </div>

                {/* Time + status */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Clock
                      className={`w-3 h-3 ${past ? "text-gray-300" : "text-teal-500"}`}
                    />
                    <span
                      className={`text-xs font-semibold ${past ? "text-gray-400" : "text-teal-700"}`}
                    >
                      {formatTime12Hour(med.deadline_time)}
                    </span>
                  </div>
                  {past && (
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Past
                    </span>
                  )}
                  {!past && (
                    <span className="text-[10px] font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-teal-100 border border-teal-300" />
          <span>Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <span>Past deadline</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ScheduleView);
