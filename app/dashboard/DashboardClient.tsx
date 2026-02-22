"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, useCallback, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import {
  Bell,
  Settings,
  LogOut,
  Pill,
  ChevronRight,
  Heart,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useMedications } from "../hooks/useMedication";
import { useMedicationLogs } from "../hooks/useMedicationLogs";
import CareTaker from "../components/caretaker/CareTaker";
import PatientView from "../components/patient/PatientView";
import ScheduleView from "../components/schedule/ScheduleView";
import HistoryView from "../components/history/HistoryView";
import StatCard from "../components/ui/StatCard";
import ErrorBoundary from "../components/ErrorBoundary";
import { useSearchParams, useRouter } from "next/navigation";
import { ROUTES } from "../constants";
import { ErrorMessages } from "../lib/errors";
import type { Medication } from "../types/medication";

type View = "caretaker" | "patient";
type Tab = "today" | "schedule" | "history";

function statsStripConfig(
  loading: boolean,
  medications: Medication[],
  takenIds: string[]
): { label: string; value: string | number; color: string }[] {
  const total = medications.length;
  const taken = medications.filter((m) => takenIds.includes(m.id)).length;
  const pending = total - taken;
  return [
    { label: "Total",   value: loading ? "—" : total,   color: "text-[#157a65]" },
    { label: "Taken",   value: loading ? "—" : taken,   color: "text-green-600" },
    { label: "Pending", value: loading ? "—" : pending, color: "text-amber-500" },
  ];
}

// ✅ CHANGED: was `Dashboard`, now `DashboardClient` so page.tsx can import it
export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const { medications, loading, fetchMedications, removeMedication } =
    useMedications();
  const { takenIds, fetchTodayLogs } = useMedicationLogs(user?.id ?? "");

  const searchParams = useSearchParams();
  const router = useRouter();

  const role = searchParams.get("role") as View | null;
  const view: View = role === "patient" ? "patient" : "caretaker";
  const tab = (searchParams.get("tab") as Tab) || "today";

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace(ROUTES.LOGIN);
        return;
      }
      setUser(session.user);
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authReady) {
      fetchMedications().catch(() => toast.error(ErrorMessages.MEDICATIONS.FETCH_FAILED));
    }
  }, [authReady, fetchMedications]);

  useEffect(() => {
    if (authReady && user?.id) fetchTodayLogs();
  }, [authReady, user?.id, fetchTodayLogs]);

  const greeting = useCallback(() => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, [currentTime]);

  const handleSignOut = useCallback(() => {
    supabase.auth.signOut().then(() => router.replace(ROUTES.LOGIN));
  }, [router]);

  const navItems = useMemo(
    () => [
      {
        icon: <Pill size={18} />,
        label: "Medications",
        tab: "today" as const,
        active: tab === "today",
      },
      {
        icon: <Calendar size={18} />,
        label: "Schedule",
        tab: "schedule" as const,
        active: tab === "schedule" && view === "patient",
      },
      {
        icon: <BarChart3 size={18} />,
        label: "History",
        tab: "history" as const,
        active: tab === "history" && view === "patient",
      },
    ],
    [tab, view]
  );

  const userName = user?.email?.split("@")[0]?.replace(/[.]/g, " ") ?? "there";
  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0d2136] to-[#157a65] flex items-center justify-center text-white shadow-[0_8px_40px_rgba(13,33,54,0.25)] animate-pulse">
            <Heart size={22} strokeWidth={2.5} />
          </div>
          <div className="flex gap-1.5">
            {[0, 150, 300].map((delay, i) => (
              <span key={i} className="block w-1 h-5 rounded-full bg-[#157a65] animate-bounce"
                style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
          <p className="text-xs text-[#7a8a99] tracking-wide">Preparing your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden font-sans text-[#0d2136] bg-[#f5f3ef] transition-all duration-500 ${
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2.5"
    }`}>
      <aside className="hidden md:flex w-[68px] h-screen bg-[#0d2136] flex-col items-center py-6 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-[#157a65] to-[#1da98e] rounded-[13px] flex items-center justify-center text-white mb-7 shadow-[0_4px_18px_rgba(21,122,101,0.45)]">
          <Heart size={18} strokeWidth={2.5} />
        </div>
        <nav className="flex flex-col items-center gap-0.5 w-full">
          {navItems.map(({ icon, label, active, tab: navTab }) => {
            if (view === "caretaker" && (navTab === "schedule" || navTab === "history")) return null;
            return (
              <button key={label} title={label}
                onClick={() => router.push(`/dashboard?role=${view}&tab=${navTab}`)}
                className={`w-11 h-11 rounded-xl border-none flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  active ? "bg-[rgba(21,122,101,0.2)] text-[#1da98e]" : "bg-transparent text-[#4a6a85] hover:bg-white/[0.07] hover:text-[#a0c0d8]"
                }`}>
                {icon}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-0.5">
          <button title="Notifications"
            className="w-11 h-11 rounded-xl bg-transparent text-[#4a6a85] flex items-center justify-center cursor-pointer hover:bg-white/[0.07] hover:text-[#a0c0d8] transition-all duration-200">
            <Bell size={18} />
          </button>
          <button title="Sign out" onClick={handleSignOut}
            className="w-11 h-11 rounded-xl bg-transparent text-[#4a6a85] flex items-center justify-center cursor-pointer hover:bg-white/[0.07] hover:text-[#a0c0d8] transition-all duration-200">
            <LogOut size={18} />
          </button>
          <div title={user?.email}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#157a65] to-[#1a3a55] text-white text-xs font-semibold flex items-center justify-center tracking-wider border-2 border-white/[0.12] cursor-pointer mt-2">
            {initials}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <header className="bg-white border-b border-[#e6e1d9] h-[70px] px-9 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <div>
            <p className="text-[19px] font-normal text-[#0d2136] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              {greeting()},{" "}
              <span className="italic text-[#157a65] capitalize" style={{ fontFamily: "'Fraunces', serif" }}>
                {userName}
              </span>
            </p>
            <p className="text-xs text-[#7a8a99] mt-0.5">
              {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3.5 w-full md:w-auto justify-between md:justify-end">
            <span className="text-sm md:text-[15px] font-semibold text-[#0d2136] tracking-tighter opacity-55 tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className="flex bg-[#f5f3ef] border border-[#e6e1d9] rounded-[10px] p-[3px] gap-0.5">
              {(["caretaker", "patient"] as View[]).map((v) => (
                <button key={v} onClick={() => router.push(`/dashboard?role=${v}`)}
                  className={`px-4 py-1.5 rounded-[7px] border-none text-[12.5px] font-medium cursor-pointer transition-all duration-200 capitalize ${
                    view === v ? "bg-[#0d2136] text-white shadow-[0_2px_10px_rgba(13,33,54,0.22)]" : "bg-transparent text-[#7a8a99] hover:text-[#0d2136]"
                  }`}>
                  {v === "caretaker" ? "Caretaker" : "Patient"}
                </button>
              ))}
            </div>
            <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#157a65] to-[#1a3a55] text-white text-[13px] font-semibold flex items-center justify-center tracking-wider border-2 border-[#e6e1d9] cursor-pointer">
              {initials}
            </div>
          </div>
        </header>

        <div className="flex items-center gap-1.5 px-4 md:px-9 pt-3 md:pt-5 text-xs text-[#7a8a99] font-medium">
          <span>Dashboard</span>
          <ChevronRight size={13} />
          <span className={`font-semibold ${view === "patient" ? "text-[#157a65]" : "text-[#0d2136]"}`}>
            {view === "caretaker" ? "Caretaker View" : "Patient View"}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-[0.07em] uppercase ml-1 ${
            view === "patient" ? "bg-[rgba(21,122,101,0.09)] text-[#157a65]" : "bg-[rgba(13,33,54,0.07)] text-[#0d2136]"
          }`}>
            {view === "patient" ? "Patient" : "Caretaker"}
          </span>
        </div>

        <div className="flex gap-2 md:gap-3.5 px-4 md:px-9 pt-4 md:pt-7 flex-wrap">
          {statsStripConfig(loading, medications, takenIds).map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} colorClass={item.color} />
          ))}
        </div>

        {view === "patient" && (
          <div className="px-4 md:px-9 pt-3 md:pt-5">
            <div className="flex gap-1 md:gap-2 border-b border-[#e6e1d9] overflow-x-auto">
              {[{ id: "today", label: "Today" }, { id: "schedule", label: "Schedule" }, { id: "history", label: "History" }].map(({ id, label }) => (
                <button key={id} onClick={() => router.push(`/dashboard?role=${view}&tab=${id}`)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    tab === id ? "border-teal-600 text-teal-600" : "border-transparent text-[#7a8a99] hover:text-[#0d2136]"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 md:px-9 py-3 md:py-5 pb-20 md:pb-10 flex-1">
          <div className="bg-gradient-to-b from-white to-[#fbfaf7] border border-[#ede9e2] rounded-xl md:rounded-[22px] shadow-[0_10px_30px_rgba(13,33,54,0.06)] min-h-[420px] overflow-hidden p-4 md:p-6">
            <ErrorBoundary>
              {view === "caretaker" ? (
                <CareTaker loading={loading} medications={medications} onRefresh={fetchMedications} onDelete={removeMedication} />
              ) : user ? (
                <>
                  {tab === "today"    && <PatientView medications={medications} userId={user.id} />}
                  {tab === "schedule" && <ScheduleView medications={medications} />}
                  {tab === "history"  && <HistoryView userId={user.id} />}
                </>
              ) : null}
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d2136] border-t border-[#1a3a55] flex items-center justify-around py-2 z-50 safe-area-inset-bottom">
        {navItems.map(({ icon, label, active, tab: navTab }) => {
          if (view === "caretaker" && (navTab === "schedule" || navTab === "history")) return null;
          return (
            <button key={label} onClick={() => router.push(`/dashboard?role=${view}&tab=${navTab}`)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${active ? "text-[#1da98e]" : "text-[#4a6a85]"}`}>
              {icon}
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
        <button onClick={handleSignOut} className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[#4a6a85] transition-all">
          <LogOut size={18} />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </nav>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&display=swap');
      `}</style>
    </div>
  );
}