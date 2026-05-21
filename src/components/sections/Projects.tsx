"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Terminal, Sparkles, ShieldAlert, Cpu, BarChart2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProjectItem {
  title: string;
  desc: string;
  longDesc: string;
  tags: string[];
  github?: string;
  demo?: string;
  floatDelay: number;
  icon: React.ReactNode;
  telemetry: {
    fps: string;
    efficiency: string;
    memory: string;
    loadTime: string;
  };
}

const GithubIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Projects: React.FC = () => {
  const projectsData: ProjectItem[] = [
    {
      title: "Matter Orbit",
      desc: "An advanced, web-based 2D canvas physics simulator displaying complex multi-body gravitational mechanics and localized orbital trajectories.",
      longDesc: "Matter Orbit leverages low-level physics equations mapped to dynamic canvas draw states. By optimizing linear interpolation (lerp) operations and batching vector drawings in requestAnimationFrame, it handles up to 5,000 distinct orbiting bodies concurrently at a stable 60FPS.",
      tags: ["TypeScript", "HTML5 Canvas", "Vector Math", "React"],
      github: "#",
      demo: "#",
      floatDelay: 0,
      icon: <Terminal className="w-5 h-5 text-indigo-400" />,
      telemetry: {
        fps: "60.0 FPS stable",
        efficiency: "98.4%",
        memory: "14.2 MB offset",
        loadTime: "45ms direct",
      },
    },
    {
      title: "Aether Glass UI",
      desc: "A highly-optimized structural component toolkit engineered specifically for backdrop-blur panels, neon drop shadow maps, and spring layouts.",
      longDesc: "Aether Glass is a premium CSS utility kit focused on GPU-accelerated glassmorphism design. By utilizing custom HSL palettes and isolated visual layering configurations, it keeps rendering reflow checks to absolute zero, offering high visual fidelity on legacy mobile viewports.",
      tags: ["Next.js", "Tailwind CSS", "Framer Motion", "GLSL"],
      github: "#",
      demo: "#",
      floatDelay: 0.25,
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      telemetry: {
        fps: "59.8 FPS peak",
        efficiency: "99.1%",
        memory: "8.6 MB offset",
        loadTime: "12ms direct",
      },
    },
    {
      title: "Nebula Core Compiler",
      desc: "High-performance procedural shader editor compiling visual rendering instructions into native WebGL assets in real-time.",
      longDesc: "Nebula Core compiling modules enable developers to write fragment shader configurations inside React nodes. The pipeline binds custom Rust WASM loaders directly to the client's WebGL contexts, processing complex noise textures and cloud particles instantly.",
      tags: ["WebGL", "Rust", "Wasm", "React Engine"],
      github: "#",
      demo: "#",
      floatDelay: 0.5,
      icon: <ExternalLink className="w-5 h-5 text-purple-400" />,
      telemetry: {
        fps: "60.0 FPS stable",
        efficiency: "94.6%",
        memory: "28.5 MB offset",
        loadTime: "88ms cold",
      },
    },
    {
      title: "Maimai Telemetry Sync",
      desc: "A fully integrated SEGA ID live rating visualizer and score analytics engine with local SQLite database Drizzle synchronization.",
      longDesc: "Maimai Telemetry connects securely to mock or real SEGA ID Net scrapers, performing atomic Drizzle ORM SQLite transactions to sync player profiles, custom rating indexes, play counts, and songs. Supports dynamic level distribution tracking, interactive likes persistence, and real-time Recharts statistics.",
      tags: ["Next.js", "Drizzle ORM", "SQLite", "Recharts"],
      github: "#",
      demo: "/maimai",
      floatDelay: 0.75,
      icon: <BarChart2 className="w-5 h-5 text-yellow-400" />,
      telemetry: {
        fps: "60.0 FPS stable",
        efficiency: "100% atomic",
        memory: "11.2 MB offset",
        loadTime: "45ms direct",
      },
    },
  ];

  return (
    <section id="projects" className="relative py-32 px-6 z-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-xs font-mono tracking-widest text-cyan-400 uppercase"
          >
            Curated Artifacts // Portfolios
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight"
          >
            Visual Experiments
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 font-light"
          >
            A collection of production layouts, mathematical animations, and core web utilities exploring the bounds of client-side performance. Click any card to launch telemetry details.
          </motion.p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projectsData.map((project, idx) => (
            <Dialog key={idx}>
              <DialogTrigger
                render={
                  <div className="cursor-pointer h-full" />
                }
              >
                <GlassCard
                  floatDelay={project.floatDelay}
                    className="glow-card-teal flex flex-col h-full justify-between hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="space-y-6">
                      
                      {/* Header Icon */}
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        {project.icon}
                      </div>

                      {/* Title & Desc */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-slate-400 font-light leading-relaxed">
                          {project.desc}
                        </p>
                      </div>
                    </div>

                    {/* Tags & Click Indicator */}
                    <div className="mt-8 space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[10px] font-mono text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 pt-2 border-t border-white/5">
                        <BarChart2 className="w-3.5 h-3.5 animate-pulse" /> Launch Telemetry
                      </div>
                    </div>
                  </GlassCard>
              </DialogTrigger>

              {/* Shadcn Dialog Telemetry Overlay */}
              <DialogContent className="glass-panel border border-white/10 max-w-lg rounded-2xl p-6 text-slate-100 bg-space-950/95 backdrop-blur-2xl">
                <DialogHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                    <ShieldAlert className="w-4 h-4" /> SECURE DIALOG // TELEMETRY DEPLOYED
                  </div>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    {project.title}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-sm font-light leading-relaxed">
                    {project.longDesc}
                  </DialogDescription>
                </DialogHeader>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 py-6">
                  {Object.entries(project.telemetry).map(([key, val]) => (
                    <div key={key} className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                        {key === "fps" ? "Render Frequency" : key}
                      </div>
                      <div className="text-sm font-semibold text-slate-200 font-mono">
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Links inside Dialog */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    {project.github && (
                      <a
                        href={project.github}
                        className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <GithubIcon /> Source Code
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Cpu className="w-3.5 h-3.5" /> {project.title.includes("Maimai") ? "Launch Portal" : "Orbit Demo"}
                      </a>
                    )}
                  </div>
                  <button className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-250 cursor-pointer">
                    Signal Reconnect
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>

      </div>
    </section>
  );
};
