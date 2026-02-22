"use client";

import { memo, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Pill,
} from "lucide-react";
import type { Medication } from "../../types/medication";
import { formatTime12Hour } from "../../utils/timeFormat";

export interface ScheduleViewProps {
  medications: Medication[];
}

function ScheduleView({ medications }: ScheduleViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Get start of week (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = useMemo(() => getWeekStart(currentWeek), [currentWeek]);

  // Generate week days
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, [weekStart]);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  // Group medications by deadline time
  const medicationsByTime = useMemo(() => {
    const grouped: Record<string, Medication[]> = {};
    medications.forEach((med) => {
      const time = med.deadline_time;
      if (!grouped[time]) {
        grouped[time] = [];
      }
      grouped[time].push(med);
    });
    return grouped;
  }, [medications]);

  const sortedTimes = Object.keys(medicationsByTime).sort();

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatWeekRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Weekly Schedule
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateWeek("prev")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <p className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
            {formatWeekRange()}
          </p>
          <button
            onClick={() => navigateWeek("next")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b border-gray-100 overflow-x-auto">
          <div className="p-2 md:p-4 border-r border-gray-100 bg-gray-50 min-w-[60px] md:min-w-0">
            <p className="text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Time
            </p>
          </div>
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className={`p-2 md:p-4 text-center border-r border-gray-100 last:border-r-0 min-w-[70px] md:min-w-0 ${
                isToday(day) ? "bg-teal-50" : "bg-white"
              }`}
            >
              <p className="text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
              <p
                className={`text-sm md:text-lg font-bold mt-0.5 md:mt-1 ${
                  isToday(day)
                    ? "text-teal-600"
                    : "text-gray-800"
                }`}
              >
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {sortedTimes.length === 0 ? (
          <div className="p-10 text-center">
            <Pill className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No medications scheduled</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedTimes.map((time) => {
              const meds = medicationsByTime[time];
              return (
                <div key={time} className="grid grid-cols-8">
                  <div className="p-2 md:p-4 border-r border-gray-100 bg-gray-50 flex items-center gap-1 md:gap-2 min-w-[60px] md:min-w-0">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                    <p className="text-xs md:text-sm font-medium text-gray-700">
                      {formatTime12Hour(time)}
                    </p>
                  </div>
                  {weekDays.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`p-2 md:p-3 border-r border-gray-100 last:border-r-0 min-h-[60px] md:min-h-[80px] min-w-[70px] md:min-w-0 ${
                        isToday(day) ? "bg-teal-50/30" : "bg-white"
                      }`}
                    >
                      {meds.map((med) => (
                        <div
                          key={med.id}
                          className="bg-teal-50 border border-teal-200 rounded md:rounded-lg p-1.5 md:p-2 mb-1 md:mb-2 last:mb-0"
                        >
                          <p className="text-[10px] md:text-xs font-semibold text-teal-900 line-clamp-1">
                            {med.name}
                          </p>
                          <p className="text-[9px] md:text-xs text-teal-700 mt-0.5 line-clamp-1">
                            {med.dosage}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-teal-50 border border-teal-200 rounded" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>Deadline time</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ScheduleView);
