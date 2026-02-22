"use client";

import { supabase } from "@/lib/supabaseClient";
import { Pill } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error("Email & Password required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signup successful! Please login.");
      router.push("/login");
    }
  };

 return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-4">
     {/* Card */}
     <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
       {/* Brand */}
       <div className="flex flex-col items-center mb-6">
         <div className="bg-teal-500 text-white p-4 rounded-xl shadow-md mb-3">
           <Pill />
         </div>

         <h1 className="text-2xl font-bold text-gray-900">
           MediCare Companion
         </h1>
         <p className="text-sm text-gray-500 mt-1">
           Create your account to start managing medications
         </p>
       </div>

       {/* Title */}
       <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
         Sign up
       </h2>

       {/* EMAIL */}
       <div className="mb-4">
         <label className="text-sm text-gray-600 mb-1 block">Email</label>
         <input
           type="email"
           placeholder="you@example.com"
           onChange={(e) => setEmail(e.target.value)}
           className="w-full border border-gray-200 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
         />
       </div>

       {/* PASSWORD */}
       <div className="mb-6">
         <label className="text-sm text-gray-600 mb-1 block">Password</label>
         <input
           type="password"
           placeholder="Create a secure password"
           onChange={(e) => setPassword(e.target.value)}
           className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
         />
       </div>

       {/* BUTTON */}
       <button
         onClick={handleSignUp}
         disabled={loading}
         className="w-full bg-teal-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.01] transition disabled:opacity-50"
       >
         {loading ? "Creating account..." : "Sign Up"}
       </button>

       {/* FOOTER */}
       <p className="text-sm text-gray-500 text-center mt-6 underline">
         Already have an account?{" "}
         <span
           onClick={() => router.push("/login")}
           className="text-blue-600 font-medium cursor-pointer hover:underline"
         >
           Login
         </span>
       </p>
     </div>
   </div>
 );
}
