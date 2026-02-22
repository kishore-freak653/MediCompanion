import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1 font-medium text-black font-bold text-sm">{label}</label>}
      <input
        className={`border rounded px-3 text-black py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}
