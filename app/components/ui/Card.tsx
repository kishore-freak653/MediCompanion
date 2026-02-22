"use client";
import { CheckCircle2, ArrowRight } from "lucide-react";
import React from "react";

interface RoleCardProps {
  icon: React.ReactNode;
  iconBg: string;
  badge: string;
  badgeColor: string;
  title: string;
  titleColor: string;
  description: string;
  features: string[];
  dotColor: string;
  buttonClass: string;
  buttonLabel: string;
  onClick: () => void;
}

const Card = ({
  icon,
  iconBg,
  badge,
  badgeColor,
  title,
  titleColor,
  description,
  features,
  dotColor,
  buttonClass,
  buttonLabel,
  onClick,
}: RoleCardProps) => {
  return (
    <div className="flex-1 bg-white border border-[#e6e1d9] rounded-[20px] p-7 flex flex-col shadow-[0_2px_12px_rgba(13,33,54,0.07)] hover:shadow-[0_8px_32px_rgba(13,33,54,0.11)] hover:-translate-y-1 transition-all duration-300 group">
      {/* Icon + Badge */}
      <div className="flex items-center justify-between mb-5">
        <div
          className={`w-12 h-12 rounded-[13px] flex items-center justify-center ${iconBg}`}
        >
          {icon}
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-1 rounded-full ${badgeColor}`}
        >
          {badge}
        </span>
      </div>

      {/* Title */}
      <h2
        className={`text-[1.25rem] font-semibold mb-1.5 tracking-tight ${titleColor}`}
      >
        {title}
      </h2>

      <p className="text-[#7a8a99] text-[13px] leading-relaxed mb-6">
        {description}
      </p>

      {/* Features */}
      <ul className="space-y-2.5 mb-8 flex-1">
        {features.map((item) => (
          <li key={item} className="flex items-center gap-2.5">
            <CheckCircle2
              size={15}
              className={
                dotColor === "bg-[#157a65]"
                  ? "text-[#157a65]"
                  : "text-[#0d2136]"
              }
            />
            <span className="text-[13px] text-[#4a6070] font-[450]">
              {item}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onClick}
        className={`w-full text-white font-semibold py-3 rounded-[12px] transition-all duration-200 flex items-center justify-center gap-2 text-[14px] ${buttonClass}`}
      >
        {buttonLabel}
        <ArrowRight
          size={16}
          className="group-hover:translate-x-0.5 transition-transform duration-200"
        />
      </button>
    </div>
  );
};

export default Card;
