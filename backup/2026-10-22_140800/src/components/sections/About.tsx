"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Eye, Layers } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

export const About: React.FC = () => {
  const principles = [
    {
      title: "Visual Fidelity",
      desc: "Creating high-fidelity digital art where motion mimics natural gravity, scroll dynamics are spring-damped, and colors breathe.",
      icon: <Eye className="w-5 h-5 text-indigo-400" />,
      delay: 0.1,
    },
    {
      title: "Computational Speed",
      desc: "Optimizing canvas frame loops, minimizing React rendering cycles, and leveraging hardware acceleration to maintain a solid 60FPS.",
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      delay: 0.3,
    },
    {
      title: "Structural Rigor",
      desc: "Architecting clean, typesafe layout components, modular dependency patterns, and highly reuseable visual systems.",
      icon: <Layers className="w-5 h-5 text-purple-400" />,
      delay: 0.5,
    },
  ];

  return (
    <section className="relative py-28 px-6 z-10 bg-black/10">
      
      {/* Decorative Blur Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-600/5 blur-[90px] animate-pulse-glow" />

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column: Context Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase">
              Operational Core // Identity
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Behind the Physics
            </h2>
          </div>
          <p className="text-slate-350 font-light leading-relaxed">
            I approach frontend engineering not as a series of static templates, but as an interactive canvas. By studying gravity, velocity vectors, and structural grids, I bring interactive physics straight to standard browser systems.
          </p>
          <div className="p-4 rounded-xl bg-white/3 border border-white/5 font-mono text-xs text-indigo-200">
            <span className="text-slate-500 font-semibold">// Running System Telemetry...</span>
            <ul className="mt-2 space-y-1">
              <li>• Frames: stable_60fps</li>
              <li>• Memory Overhead: minimal</li>
              <li>• Core UI Reactivity: dynamic</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Principles Array */}
        <div className="lg:col-span-7 space-y-6">
          {principles.map((pr, index) => (
            <GlassCard
              key={index}
              floatDelay={pr.delay}
              enableTilt={false}
              className="flex gap-5 items-start bg-gradient-to-r from-space-900/50 to-space-950/50 border border-white/5"
            >
              <div className="p-3 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                {pr.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-100">{pr.title}</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">
                  {pr.desc}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

      </div>
    </section>
  );
};
