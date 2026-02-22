"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { useMedicationHistory } from "../../hooks/useMedicationHistory";
import type { MedicationLog } from "../../types/medication";

interface Props {
  userId: string;
}

export default function HistoryView({ userId }: Props) {
  const { logs, stats, loading, fetchHistory, fetchStats } =
    useMedicationHistory(userId);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);

  useEffect(() => {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - selectedPeriod);
    const startDateStr = startDate.toISOString().split("T")[0];

    fetchHistory(startDateStr, endDate);
    fetchStats(selectedPeriod);
  }, [userId, selectedPeriod, fetchHistory, fetchStats]);

  const groupedByDate = logs.reduce((acc, log) => {
    const date = log.taken_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, MedicationLog[]>);

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Medication History & Analytics
          </h2>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === days
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <span className="text-2xl font-bold">{stats.adherenceRate}%</span>
            </div>
            <p className="text-xs opacity-90">Adherence Rate</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {stats.takenDays}
              </span>
            </div>
            <p className="text-xs text-gray-500">Days Taken</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold text-red-500">
                {stats.missedDays}
              </span>
            </div>
            <p className="text-xs text-gray-500">Days Missed</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span className="text-2xl font-bold text-teal-600">
                {stats.totalDays}
              </span>
            </div>
            <p className="text-xs text-gray-500">Total Days</p>
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      {stats && stats.weeklyData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Weekly Adherence
          </h3>
          <div className="flex items-end gap-2 h-32">
            {stats.weeklyData.map((week, idx) => {
              const percentage =
                week.total > 0 ? (week.taken / week.total) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t-lg relative h-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-teal-500 to-emerald-500 rounded-t-lg transition-all"
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {new Date(week.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History List */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Recent History
        </h3>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 animate-pulse border border-gray-100 h-20"
              />
            ))}
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No history found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedDates.map((date) => {
              const dateLogs = groupedByDate[date];
              const formattedDate = new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <div
                  key={date}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700">
                      {formattedDate}
                    </p>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {dateLogs.length} taken
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {dateLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {log.medication?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.medication?.dosage || ""}
                            </p>
                          </div>
                        </div>
                        {log.photo_url && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={log.photo_url}
                              alt="Proof"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
