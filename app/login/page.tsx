"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import { Heart, Pill } from "lucide-react";

/* ==============================
   ZOD SCHEMA
============================== */

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/* ==============================
   TYPES
============================== */

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [loading, setLoading] = useState(false);

  /* ==============================
     HANDLE CHANGE
  ============================== */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ==============================
     HANDLE LOGIN
  ============================== */

  const handleLogin = async () => {
    setErrors({});

    const result = loginSchema.safeParse(formData);
if (!result.success) {
  const fieldErrors: Partial<LoginFormData> = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof LoginFormData;
    fieldErrors[field] = issue.message;
  });
  setErrors(fieldErrors);
  return;
}

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log(formData);

      if (error) throw error;

      toast.success("Login successful");
      router.push("/role-select");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

 return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-4">
     {/* Login Card */}
     <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
       {/* Brand */}
       <div className="flex justify-center gap-4 items-center mb-6">
         <div className="bg-teal-500 w-10 h-10 justify-center flex items-center rounded-full">
           <Pill className="text-white w-6 h-6" />
         </div>
         <h1 className="text-2xl font-bold text-gray-900">
           MediCare Companion
         </h1>
       </div>

       {/* Title */}
       <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
         Sign in to your account
       </h2>

       {/* EMAIL */}
       <div className="mb-4">
         <label className="text-sm text-gray-600 mb-1 block">Email</label>
         <input
           name="email"
           value={formData.email}
           onChange={handleChange}
           className="w-full border border-gray-200 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
           placeholder="you@example.com"
         />
         {errors.email && (
           <p className="text-red-500 text-sm mt-1">{errors.email}</p>
         )}
       </div>

       {/* PASSWORD */}
       <div className="mb-6">
         <label className="text-sm text-gray-600 mb-1 block">Password</label>
         <input
           name="password"
           type="password"
           value={formData.password}
           onChange={handleChange}
           className="w-full border border-gray-200 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500  transition"
           placeholder="Enter your password"
         />
         {errors.password && (
           <p className="text-red-500 text-sm mt-1">{errors.password}</p>
         )}
       </div>

       {/* BUTTON */}
       <button
         onClick={handleLogin}
         disabled={loading}
         className="w-full  bg-teal-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.01] transition disabled:opacity-50"
       >
         {loading ? "Signing in..." : "Login"}
       </button>

       {/* Footer */}
       <p
         className="text-xs text-teal-600 text-center mt-6 underline cursor-pointer"
         onClick={() => router.push("/signup")}
       >
         Don't have an account ? signup here
       </p>
     </div>
   </div>
 );
}
