"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GravityProvider } from "@/components/visual/GravityPhysics";
import { SpaceParticles } from "@/components/visual/SpaceParticles";
import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2, Key, User, ArrowLeft, Disc, AlertCircle } from "lucide-react";

function MaimaiLoginForm() {
  const router = useRouter();
  const [segaId, setSegaId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segaId, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      // Successful login -> perform initial score sync instantly for a seamless experience
      const syncResponse = await fetch("/api/auth/sync", {
        method: "POST",
      });
      const syncData = await syncResponse.json();
      if (!syncResponse.ok || !syncData.success) {
        console.warn("Initial sync failed:", syncData.error);
      }

      router.push("/maimai/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 z-10 selection:bg-indigo-500/20 selection:text-indigo-200 overflow-hidden">
      {/* Background cinematic mesh overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Floating back arrow */}
      <motion.button
        onClick={() => router.push("/")}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Return to Orbit
      </motion.button>

      {/* Title */}
      <div className="text-center mb-8 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4 animate-pulse"
        >
          <Disc className="w-8 h-8 text-cyan-400 animate-[spin_6s_linear_infinite]" />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight font-outfit"
        >
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            SEGA ID CONNECTOR
          </span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs md:text-sm font-mono text-slate-400 uppercase tracking-widest mt-2"
        >
          maimai dx live telemetry synchronization portal
        </motion.p>
      </div>

      {/* Login Box */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="border border-white/5 bg-space-950/40 backdrop-blur-xl" enableTilt={true}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                SEGA ID / Account
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g., SEGA-USER-777"
                  value={segaId}
                  onChange={(e) => setSegaId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/40 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-sm focus:ring-1 focus:ring-cyan-500/25"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                SEGA Access Key / Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/40 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-sm focus:ring-1 focus:ring-cyan-500/25"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-500/10 border border-rose-500/25 text-rose-300 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs font-mono"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-semibold uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 hover:from-cyan-300 hover:via-indigo-300 hover:to-purple-300 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-cyan-500/15 flex justify-center items-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  Establishing Link...
                </>
              ) : (
                <>
                  Synchronize Data
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          {/* Quick connection tips for testing convenience */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/80">
              ⚡ Developer Sandbox Guidelines
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Authenticate using any sample SEGA ID (e.g. <code className="text-cyan-300 bg-cyan-950/30 px-1 py-0.5 rounded font-mono font-bold">SEGA-USER-777</code>) and password. A secure, cryptographic 10-day cookie session will instantly seed full-fidelity score history.
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </main>
  );
}

export default function MaimaiLoginPage() {
  return (
    <GravityProvider>
      <SpaceParticles />
      <MaimaiLoginForm />
    </GravityProvider>
  );
}
