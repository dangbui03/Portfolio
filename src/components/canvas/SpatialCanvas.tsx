"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Compass, ArrowLeft, Sparkles, BookOpen, Layers, Mail } from "lucide-react";
import BannerCarousel from "@/components/hero/BannerCarousel";
import SignpostNav from "@/components/hero/SignpostNav";
import type { SignpostRoute } from "@/components/3D/Signpost3D";

export interface SpatialCanvasProps {
  initialRoute?: SignpostRoute;
}

interface NodeCoordinate {
  x: string;
  y: string;
  label: string;
  trail: string;
  distance: string;
}

/**
 * Spatial 2D coordinates for each route relative to the Crossroads center (0vw, 0dvh).
 * Matches the exact directional arrow planks on the 3D wooden signpost:
 * - /about    : Top-Left plank  -> North-West (-100vw, -100dvh)
 * - /blog     : Top-Right plank -> North-East (+100vw, -100dvh)
 * - /projects : Bottom-Left     -> South-West (-100vw, +100dvh)
 * - /contact  : Bottom-Right    -> South-East (+100vw, +100dvh)
 */
const SPATIAL_COORDS: Record<SignpostRoute, NodeCoordinate> = {
  "/": {
    x: "0vw",
    y: "0dvh",
    label: "Crossroads Center",
    trail: "Origin (0, 0)",
    distance: "0.0 km",
  },
  "/about": {
    x: "100vw",
    y: "100dvh",
    label: "About the Journey",
    trail: "North-West Trail",
    distance: "0.2 km",
  },
  "/blog": {
    x: "-100vw",
    y: "100dvh",
    label: "Field Notes & Essays",
    trail: "North-East Trail",
    distance: "0.6 km",
  },
  "/projects": {
    x: "100vw",
    y: "-100dvh",
    label: "Selected Works & Tools",
    trail: "South-West Trail",
    distance: "1.2 km",
  },
  "/contact": {
    x: "-100vw",
    y: "-100dvh",
    label: "Campfire & Contact",
    trail: "South-East Trail",
    distance: "1.8 km",
  },
};

function normalizeRoute(pathname: string): SignpostRoute {
  if (pathname.startsWith("/about")) return "/about";
  if (pathname.startsWith("/blog")) return "/blog";
  if (pathname.startsWith("/projects")) return "/projects";
  if (pathname.startsWith("/contact")) return "/contact";
  return "/";
}

export default function SpatialCanvas({
  initialRoute = "/",
}: SpatialCanvasProps) {
  const [activeRoute, setActiveRoute] = useState<SignpostRoute>(initialRoute);
  const prefersReducedMotion = useReducedMotion();

  // Navigate to a spatial node and push history state so Browser Back reverses smoothly
  const navigateTo = useCallback((target: SignpostRoute) => {
    setActiveRoute((current) => {
      if (current === target) return current;
      if (typeof window !== "undefined") {
        window.history.pushState({ spatialRoute: target }, "", target);
      }
      return target;
    });
  }, []);

  // Listen to browser Back / Forward buttons (popstate) to reverse the spatial camera
  useEffect(() => {
    if (typeof window === "undefined") return;

    const synced = normalizeRoute(window.location.pathname);
    setActiveRoute(synced);

    const handlePopState = () => {
      const nextRoute = normalizeRoute(window.location.pathname);
      setActiveRoute(nextRoute);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Support Escape key to pan back to the Crossroads signpost
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeRoute !== "/") {
        navigateTo("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeRoute, navigateTo]);

  const cameraTarget = SPATIAL_COORDS[activeRoute];

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-[#f4ecdc] text-[#3a2014] select-none">
      {/* Subtle Spatial Canvas Grid / Parchment Texture Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(#b45309 0.75px, transparent 0.75px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating Spatial Minimap / Quick Return Pill when away from Crossroads */}
      {activeRoute !== "/" && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateTo("/")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#b45309]/40 bg-[#fdfbf7]/95 px-4 py-2 text-xs font-semibold text-[#3a2014] shadow-md backdrop-blur-md transition-all hover:border-[#b45309] hover:bg-[#f7f0e2] active:scale-95"
          >
            <Compass className="h-4 w-4 text-[#d97706]" aria-hidden="true" />
            <span>Crossroads (Esc)</span>
          </button>
        </div>
      )}

      {/* Continuous 2D Presentation Canvas World */}
      <motion.div
        animate={{
          x: cameraTarget.x,
          y: cameraTarget.y,
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 150,
                damping: 24,
                mass: 0.9,
              }
        }
        className="relative h-dvh w-screen will-change-transform"
      >
        {/* ============================================================
            NODE (0, 0): CROSSROADS HOME (Banner on Desktop + 3D Signpost)
           ============================================================ */}
        <main
          aria-label="Crossroads Home Canvas"
          className="absolute top-0 left-0 flex h-dvh w-screen flex-col overflow-hidden bg-[#f4ecdc]"
        >
          {/* Top Horizontal S3 Banner Carousel (Hidden on mobile -> signpost only) */}
          <BannerCarousel onNavigate={navigateTo} />

          {/* 3D Wooden Signpost Navigation Area (Full 100dvh on mobile, remaining flex-1 on desktop) */}
          <section
            aria-label="3D Crossroads Signpost Navigation"
            className="relative min-h-0 w-full flex-1"
          >
            <SignpostNav
              onNavigate={navigateTo}
              isActiveView={activeRoute === "/"}
            />
          </section>
        </main>

        {/* ============================================================
            NODE (-100vw, -100dvh): ABOUT (/about) — North-West Trail
           ============================================================ */}
        <section
          aria-label="About the Journey"
          className="absolute -top-[100dvh] -left-[100vw] flex h-dvh w-screen flex-col overflow-y-auto bg-[#fdfbf7] px-6 py-12 select-text sm:px-12 md:py-16"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigateTo("/")}
                className="mb-8 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#dccbb1] bg-[#f7f2e7] px-3.5 py-2 font-mono text-xs font-semibold tracking-wider text-[#5c3d2e] uppercase shadow-xs transition-all hover:border-[#b45309] hover:text-[#3a2014]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Crossroads
              </button>

              <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-[#d97706] uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                <span>North-West Trail · Waypoint 0.2 km</span>
              </div>

              <h1 className="mb-4 font-serif text-3xl font-bold text-[#3a2014] sm:text-5xl">
                About the Journey
              </h1>

              <p className="mb-8 text-base leading-relaxed text-[#634b3c] sm:text-lg">
                Welcome to the trailhead. Here lies the craft, background, and
                path of building thoughtful digital experiences, tactile UI
                physics, and grounded full-stack systems.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e7ddc8] bg-[#f7f2e7] p-5">
                  <h2 className="mb-2 font-serif text-lg font-bold text-[#3a2014]">
                    Interactive Craft
                  </h2>
                  <p className="text-sm leading-relaxed text-[#634b3c]">
                    Blending Three.js / WebGL spatial environments with
                    accessible, responsive DOM interfaces that feel physical and
                    immediate.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e7ddc8] bg-[#f7f2e7] p-5">
                  <h2 className="mb-2 font-serif text-lg font-bold text-[#3a2014]">
                    Systems Architecture
                  </h2>
                  <p className="text-sm leading-relaxed text-[#634b3c]">
                    Engineering resilient TypeScript, Next.js, and cloud-backed
                    applications with clean modular boundaries.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Spatial Jump Footer */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7ddc8] pt-5 text-xs text-[#785a4a]">
              <span>Canvas Node: (-100vw, -100dvh) · Browser Back reverses camera</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo("/projects")}
                  className="cursor-pointer rounded-lg border border-[#dccbb1] px-2.5 py-1 font-medium text-[#3a2014] hover:bg-[#f4ecdc]"
                >
                  Pan to Projects →
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/blog")}
                  className="cursor-pointer rounded-lg border border-[#dccbb1] px-2.5 py-1 font-medium text-[#3a2014] hover:bg-[#f4ecdc]"
                >
                  Pan to Blog →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            NODE (+100vw, -100dvh): BLOG (/blog) — North-East Trail
           ============================================================ */}
        <section
          aria-label="Field Notes and Essays"
          className="absolute -top-[100dvh] left-[100vw] flex h-dvh w-screen flex-col overflow-y-auto bg-[#fdfbf7] px-6 py-12 select-text sm:px-12 md:py-16"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigateTo("/")}
                className="mb-8 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#dccbb1] bg-[#f7f2e7] px-3.5 py-2 font-mono text-xs font-semibold tracking-wider text-[#5c3d2e] uppercase shadow-xs transition-all hover:border-[#b45309] hover:text-[#3a2014]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Crossroads
              </button>

              <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-[#d97706] uppercase">
                <BookOpen className="h-3.5 w-3.5" />
                <span>North-East Trail · Waypoint 0.6 km</span>
              </div>

              <h1 className="mb-4 font-serif text-3xl font-bold text-[#3a2014] sm:text-5xl">
                Field Notes &amp; Essays
              </h1>

              <p className="mb-8 text-base leading-relaxed text-[#634b3c] sm:text-lg">
                Writings on web architecture, interactive 3D rendering, creative
                engineering, and thoughts gathered along the autumn path.
              </p>

              <div className="space-y-4">
                <article className="rounded-2xl border border-[#e7ddc8] bg-[#f7f2e7] p-5 transition-colors hover:border-[#b45309]/50">
                  <div className="mb-1 font-mono text-xs text-[#b45309]">
                    ESSAY · INTERACTIVE GRAPHICS
                  </div>
                  <h2 className="mb-1 font-serif text-xl font-bold text-[#3a2014]">
                    Designing Post-Mounted Spring Physics in React Three Fiber
                  </h2>
                  <p className="text-sm text-[#634b3c]">
                    How shifting pivot origins and solving angular velocity in
                    useFrame transforms static meshes into tactile wooden
                    signage.
                  </p>
                </article>

                <article className="rounded-2xl border border-[#e7ddc8] bg-[#f7f2e7] p-5 transition-colors hover:border-[#b45309]/50">
                  <div className="mb-1 font-mono text-xs text-[#b45309]">
                    ARCHITECTURE · SPATIAL WEB
                  </div>
                  <h2 className="mb-1 font-serif text-xl font-bold text-[#3a2014]">
                    Continuous 2D Presentation Canvases vs. Hard Page Reloads
                  </h2>
                  <p className="text-sm text-[#634b3c]">
                    Synchronizing browser popstate history with spring-driven
                    camera coordinates for zero-flash navigation.
                  </p>
                </article>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7ddc8] pt-5 text-xs text-[#785a4a]">
              <span>Canvas Node: (+100vw, -100dvh) · Browser Back reverses camera</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo("/about")}
                  className="cursor-pointer rounded-lg border border-[#dccbb1] px-2.5 py-1 font-medium text-[#3a2014] hover:bg-[#f4ecdc]"
                >
                  ← Pan to About
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/contact")}
                  className="cursor-pointer rounded-lg border border-[#dccbb1] px-2.5 py-1 font-medium text-[#3a2014] hover:bg-[#f4ecdc]"
                >
                  Pan to Contact →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            NODE (-100vw, +100dvh): PROJECTS (/projects) — South-West Trail
           ============================================================ */}
        <section
          aria-label="Selected Works and Tools"
          className="absolute top-[100dvh] -left-[100vw] flex h-dvh w-screen flex-col overflow-y-auto bg-[#fdfbf7] px-6 py-12 select-text sm:px-12 md:py-16"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigateTo("/")}
                className="mb-8 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#dccbb1] bg-[#f7f2e7] px-3.5 py-2 font-mono text-xs font-semibold tracking-wider text-[#5c3d2e] uppercase shadow-xs transition-all hover:border-[#b45309] hover:text-[#3a2014]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Crossroads
              </button>

              <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-[#d97706] uppercase">
                <Layers className="h-3.5 w-3.5" />
                <span>South-West Trail · Waypoint 1.2 km</span>
              </div>

              <h1 className="mb-4 font-serif text-3xl font-bold text-[#3a2014] sm:text-5xl">
                Selected Works &amp; Tools
              </h1>

              <p className="mb-8 text-base leading-relaxed text-[#634b3c] sm:text-lg">
                A showcase of interactive web applications, 3D graphics
                experiments, and open-source creations built along the trail.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e7ddc8] bg-[#f7f2e7] p-5">
                  <span className="mb-2 inline-block rounded-md bg-[#d97706]/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#b45309]">
                    3D &amp; SPATIAL UI
                  </span>
                  <h2 className="mb-1 font-serif text-xl font-bold text-[#3a2014]">
                    Autumn Crossroads Signpost
                  </h2>
                  <p className="text-sm text-[#634b3c]">
                    Interactive Three.js directional signpost with post-hinge
                    spring physics and 2D spatial presentation transitions.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e7ddc8] bg-[#f7f2e7] p-5">
                  <span className="mb-2 inline-block rounded-md bg-[#d97706]/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#b45309]">
                    CLOUD &amp; MOTION
                  </span>
                  <h2 className="mb-1 font-serif text-xl font-bold text-[#3a2014]">
                    S3 Dispatch Carousel
                  </h2>
                  <p className="text-sm text-[#634b3c]">
                    Decoupled AWS S3 banner feed with velocity-projected
                    magnetic card snapping and tactile bounce feedback.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7ddc8] pt-5 text-xs text-[#785a4a]">
              <span>Canvas Node: (-100vw, +100dvh) · Browser Back reverses camera</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo("/about")}
                  className="cursor-pointer rounded-lg border border-[#dccbb1] px-2.5 py-1 font-medium text-[#3a2014] hover:bg-[#f4ecdc]"
                >
                  ↑ Pan to About
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/contact")}
                  className="cursor-pointer rounded-lg border border-[#dccbb1] px-2.5 py-1 font-medium text-[#3a2014] hover:bg-[#f4ecdc]"
                >
                  Pan to Contact →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            NODE (+100vw, +100dvh): CONTACT (/contact) — South-East Trail
           ============================================================ */}
        <section
          aria-label="Campfire and Contact"
          className="absolute top-[100dvh] left-[100vw] flex h-dvh w-screen flex-col overflow-y-auto bg-[#fdfbf7] px-6 py-12 select-text sm:px-12 md:py-16"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigateTo("/")}
                className="mb-8 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#dccbb1] bg-[#f7f2e7] px-3.5 py-2 font-mono text-xs font-semibold tracking-wider text-[#5c3d2e] uppercase shadow-xs transition-all hover:border-[#b45309] hover:text-[#3a2014]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Crossroads
              </button>

              <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-[#d97706] uppercase">
                <Mail className="h-3.5 w-3.5" />
                <span>South-East Trail · Waypoint 1.8 km</span>
              </div>

              <h1 className="mb-4 font-serif text-3xl font-bold text-[#3a2014] sm:text-5xl">
                Campfire &amp; Contact
              </h1>

              <p className="mb-8 text-base leading-relaxed text-[#634b3c] sm:text-lg">
                Pull up a log by the fire. Whether you have a project idea,
                collaboration inquiry, or just want to say hello, feel free to
                send a dispatch.
              </p>

              <div className="rounded-2xl border border-[#e7ddc8] bg-[#f7f2e7] p-6">
                <h2 className="mb-2 font-serif text-xl font-bold text-[#3a2014]">
                  Direct Dispatch
                </h2>
                <p className="mb-4 text-sm text-[#634b3c]">
                  Reach out anytime — responses are sent from the autumn
                  crossroads.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:hello@example.com"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#b45309] px-4 py-2.5 text-xs font-semibold text-[#fdfbf7] shadow-xs transition-colors hover:bg-[#9a3412]"
                  >
                    <Mail className="h-4 w-4" />
                    Send Email Dispatch
                  </a>
                  <button
                    type="button"
                    onClick={() => navigateTo("/")}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#dccbb1] bg-[#fdfbf7] px-4 py-2.5 text-xs font-semibold text-[#3a2014] transition-colors hover:bg-[#f4ecdc]"
                  >
                    Back to Signpost Center
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7ddc8] pt-5 text-xs text-[#785a4a]">
              <span>Canvas Node: (+100vw, +100dvh) · Browser Back reverses camera</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo("/projects")}
                  className="cursor-pointer rounded-lg border border-[#dccbb1] px-2.5 py-1 font-medium text-[#3a2014] hover:bg-[#f4ecdc]"
                >
                  ← Pan to Projects
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/blog")}
                  className="cursor-pointer rounded-lg border border-[#dccbb1] px-2.5 py-1 font-medium text-[#3a2014] hover:bg-[#f4ecdc]"
                >
                  ↑ Pan to Blog
                </button>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
