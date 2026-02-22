// app/dashboard/page.tsx
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";
import { Heart } from "lucide-react";

function DashboardFallback() {
  return (
    <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-5">
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0d2136] to-[#157a65] flex items-center justify-center text-white shadow-[0_8px_40px_rgba(13,33,54,0.25)] animate-pulse">
          <Heart size={22} strokeWidth={2.5} />
        </div>
        <div className="flex gap-1.5">
          {[0, 150, 300].map((delay, i) => (
            <span
              key={i}
              className="block w-1 h-5 rounded-full bg-[#157a65] animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        <p className="text-xs text-[#7a8a99] tracking-wide">
          Preparing your dashboard…
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardClient />
    </Suspense>
  );
}
