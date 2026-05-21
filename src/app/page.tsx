"use client";

import React from "react";
import { GravityProvider } from "@/components/visual/GravityPhysics";
import { SpaceParticles } from "@/components/visual/SpaceParticles";
import { GravityControls } from "@/components/visual/GravityControls";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <GravityProvider>
      {/* Interactive Background particles Reacting to Gravity scale */}
      <SpaceParticles />

      {/* Floating gravity control interface */}
      <GravityControls />

      {/* Structured Single Page Layout */}
      <main className="relative min-h-screen w-full flex flex-col z-10 selection:bg-cyan-500/20 selection:text-cyan-200">
        
        {/* Cinematic ambient grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

        {/* Dynamic header / nav indicator */}
        <header className="fixed top-0 w-full z-40 bg-space-950/20 backdrop-blur-md border-b border-white/5 py-4 px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a 
              href="#" 
              className="text-lg font-bold tracking-widest bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer font-mono"
            >
              ANTIGRAVITY //
            </a>
            <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-slate-400">
              <a href="#" className="hover:text-slate-100 transition-colors">Orbit</a>
              <a href="#projects" className="hover:text-slate-100 transition-colors">Experiments</a>
              <a 
                href="/maimai" 
                className="hover:text-cyan-400 transition-colors"
              >
                Telemetry
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content Sections */}
        <div className="flex-grow">
          <Hero />
          <About />
          <Projects />
          <Contact />
        </div>

        {/* Global Cinematic Footer */}
        <footer className="w-full py-8 border-t border-white/5 bg-black/20 text-center text-[10px] font-mono text-slate-500 tracking-wider relative z-20">
          <p>© 2026 ANTIGRAVITY SPACE. ALL SYSTEMS DEPLOYED AT ZERO-G.</p>
        </footer>

      </main>
    </GravityProvider>
  );
}
