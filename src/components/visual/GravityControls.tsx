"use client";

import React from "react";
import { useGravity, GravityLevel } from "./GravityPhysics";
import { motion } from "framer-motion";
import { Globe, Orbit, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const GravityControls: React.FC = () => {
  const { gravity, setGravity } = useGravity();

  const options: { level: GravityLevel; label: string; icon: React.ReactNode; color: string }[] = [
    {
      level: "normal",
      label: "Normal G (1.0)",
      icon: <Globe className="w-4 h-4" />,
      color: "bg-emerald-500 shadow-emerald-500/50",
    },
    {
      level: "low",
      label: "Lunar G (0.3)",
      icon: <Orbit className="w-4 h-4 animate-spin-slow" />,
      color: "bg-cyan-500 shadow-cyan-500/50",
    },
    {
      level: "zero",
      label: "Zero G (0.0)",
      icon: <ShieldAlert className="w-4 h-4 animate-bounce" />,
      color: "bg-indigo-500 shadow-indigo-500/50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, type: "spring", stiffness: 100 }}
      className="fixed bottom-6 right-6 z-50 glass-panel p-3 rounded-2xl flex flex-col gap-2 max-w-xs"
    >
      <div className="flex items-center justify-between gap-4 px-2">
        <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
          Gravity Field
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-mono capitalize">
            {gravity}
          </span>
          <span
            className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_8px] transition-all duration-500",
              options.find((o) => o.level === gravity)?.color
            )}
          />
        </div>
      </div>

      <div className="flex gap-1 bg-black/30 p-1 rounded-xl">
        {options.map((opt) => {
          const isActive = gravity === opt.level;
          return (
            <button
              key={opt.level}
              onClick={() => setGravity(opt.level)}
              title={opt.label}
              className={cn(
                "flex items-center justify-center p-2.5 rounded-lg transition-all duration-300 relative group cursor-pointer",
                isActive
                  ? "bg-gradient-to-r from-indigo-600/30 to-cyan-600/30 text-white border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              )}
            >
              {opt.icon}
              <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 px-2 py-1 text-[10px] bg-slate-900 border border-white/10 rounded-md text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
