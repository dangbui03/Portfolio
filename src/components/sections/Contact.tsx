"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { GravityButton } from "../ui/GravityButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import confetti from "canvas-confetti";

export const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) return;

    setSubmitted(true);

    // Dynamic "Antigravity Confetti" - throwing particles UPWARDS with slow drift
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 90, // straight up
        spread: 45,
        origin: { x: 0.5, y: 1 },
        colors: ["#6366f1", "#06b6d4", "#8b5cf6"],
        gravity: 0.15, // Low gravity float!
        scalar: 1.2,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Reset fields after some duration
    setTimeout(() => {
      setName("");
      setEmail("");
      setMsg("");
      setSubmitted(false);
    }, 4500);
  };

  return (
    <section className="relative py-28 px-6 z-10 pb-40">
      
      {/* Decorative ambient light */}
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/5 blur-[120px] animate-pulse-glow" />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <span className="text-xs font-mono tracking-widest text-purple-400 uppercase">
            Telemetry Transmission // Connect
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Establish Connection
          </h2>
          <p className="text-slate-400 font-light max-w-sm mx-auto">
            Transmit a wave or drop an inquiry. The telemetry channel is always active.
          </p>
        </div>

        <GlassCard floatDelay={0.4} className="border border-white/8 relative">
          
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 text-center space-y-4 flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 p-[1px] flex items-center justify-center animate-bounce">
                <div className="w-full h-full rounded-full bg-space-950 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-slate-100">
                Transmission Sent!
              </h3>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed font-light">
                Your message has defied gravity and successfully arrived in orbit. Reconnecting shortly...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name & Email Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold font-mono text-slate-400 uppercase">
                    Sender Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="bg-white/4 border border-white/8 text-slate-100 placeholder-slate-650 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold font-mono text-slate-400 uppercase">
                    Vector Address (Email)
                  </label>
                  <Input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@address.com"
                    className="bg-white/4 border border-white/8 text-slate-100 placeholder-slate-650 rounded-xl"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="msg" className="text-xs font-semibold font-mono text-slate-400 uppercase">
                  Data Stream (Message)
                </label>
                <Textarea
                  id="msg"
                  required
                  rows={5}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Broadcast your telemetry signal..."
                  className="bg-white/4 border border-white/8 text-slate-100 placeholder-slate-650 rounded-xl resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <GravityButton type="submit" className="flex items-center gap-2">
                  Transmit Payload <Send className="w-4 h-4" />
                </GravityButton>
              </div>

            </form>
          )}

        </GlassCard>
      </div>
    </section>
  );
};
