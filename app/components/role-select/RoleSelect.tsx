"use client";
import { useRouter } from "next/navigation";
import { Heart, User, Users, CheckCircle2, ArrowRight } from "lucide-react";
import Card from "../ui/Card";

export default function RoleSelect() {
  const router = useRouter();

  const patientFeatures = [
    "Mark medications as taken",
    "Upload proof photos (optional)",
    "View your medication calendar",
    "Large, easy-to-use interface",
  ];

  const caretakerFeatures = [
    "Monitor medication compliance",
    "Set up notification preferences",
    "View detailed reports",
    "Receive email alerts",
  ];

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background texture blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-[rgba(21,122,101,0.06)] blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-60px] w-[350px] h-[350px] rounded-full bg-[rgba(13,33,54,0.05)] blur-3xl pointer-events-none" />
      {/* Heading */}
      <h1
        className="text-[2.6rem] font-normal text-[#0d2136] mb-3 text-center tracking-tight leading-tight"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        Welcome to{" "}
        <span className="italic text-[#157a65]">MediCare Companion</span>
      </h1>
      <p className="text-[#7a8a99] text-center max-w-sm mb-14 text-[15px] leading-relaxed">
        Your trusted partner in medication management. Choose your role to get
        started with personalized features.
      </p>
      {/* Role Cards */}
      <div className="flex flex-col md:flex-row gap-5 w-full max-w-2xl">
        {/* Patient Card */}
        <Card
          icon={<User size={22} />}
          iconBg="bg-[rgba(21,122,101,0.1)] text-[#157a65]"
          badge="Patient"
          badgeColor="bg-[rgba(21,122,101,0.09)] text-[#157a65]"
          title="I'm a Patient"
          titleColor="text-[#157a65]"
          description="Track your medication schedule and maintain your health records"
          features={patientFeatures}
          dotColor="bg-[#157a65]"
          buttonClass="bg-[#157a65] hover:bg-[#0f6050]"
          buttonLabel="Continue as Patient"
          onClick={() => router.push("/dashboard?role=patient")}
        />
        <Card
          icon={<Users size={22} />}
          iconBg="bg-[rgba(13,33,54,0.08)] text-[#0d2136]"
          badge="Caretaker"
          badgeColor="bg-[rgba(13,33,54,0.07)] text-[#0d2136]"
          title="I'm a Caretaker"
          titleColor="text-[#0d2136]"
          description="Monitor and support your loved one's medication adherence"
          features={caretakerFeatures}
          dotColor="bg-[#0d2136]"
          buttonClass="bg-[#0d2136] hover:bg-[#1a3a55] shadow-[0_4px_18px_rgba(13,33,54,0.25)] hover:shadow-[0_6px_24px_rgba(13,33,54,0.35)]"
          buttonLabel="Continue as Caretaker"
          onClick={() => router.push("/dashboard?role=patient")}
        />
        {/* Caretaker Card */}
      </div>
      {/* Footer note */}
      <p className="mt-10 text-xs text-[#7a8a99] tracking-wide">
        You can switch roles anytime from the dashboard.
      </p>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
      `}</style>
    </div>
  );
}
