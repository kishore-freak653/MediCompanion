"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Heart, Pill } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-xl text-center space-y-6">
        {/* Heading */}
        <div className="flex items-center justify-center gap-3">
          <div className="bg-teal-600 text-white p-2 rounded-full">
            <Pill className="w-6 h-6" />
          </div>

          <h2 className="text-3xl font-semibold text-gray-900">
            MediCare Companion
          </h2>
        </div>

        {/* Tagline */}
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Heart className="text-red-500 w-5 h-5" />
          <p className="text-lg">Never miss a dose</p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            className="bg-teal-600 cursor-pointer text-white px-6 py-2 rounded-md hover:bg-teal-700 transition"
            onClick={() => router.push("/login")}
          >
            Login
          </button>

          <button
            className="border border-gray-300 text-black cursor-pointer px-6 py-2 rounded-md hover:bg-gray-100 transition"
            onClick={() => router.push("/signup")}
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}
