"use client";

import { memo } from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  colorClass: string;
}

function StatCard({ label, value, colorClass }: StatCardProps) {
  return (
    <div className="bg-white border border-[#ede9e2] rounded-2xl px-6 py-4 text-center shadow-sm min-w-[120px]">
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs text-[#7a8a99] mt-1">{label}</p>
    </div>
  );
}

export default memo(StatCard);
