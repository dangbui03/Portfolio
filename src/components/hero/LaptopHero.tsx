'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  FolderKanban,
  Laptop,
  Mail,
  Palette,
  Power,
  RotateCw,
  User,
  X,
} from 'lucide-react';
import {
  DEFAULT_WALLPAPER_URL,
  LAPTOP_BRANDS,
  getLaptopColorway,
  type LaptopBrandId,
} from '@/components/3D/Laptop3D';
import { MANGA_NAV_OPTIONS, type PortfolioRoute } from '@/lib/routes';

const Laptop3D = dynamic(() => import('@/components/3D/Laptop3D'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[#f8fafc] font-mono text-xs tracking-widest text-[#475569] uppercase">
      Initializing 3D Laptop Workstation...
    </div>
  ),
});

const OPTION_ICONS: Record<Exclude<PortfolioRoute, '/'>, React.ReactNode> = {
  '/about': <User className="h-4 w-4 shrink-0" aria-hidden="true" />,
  '/projects': <FolderKanban className="h-4 w-4 shrink-0" aria-hidden="true" />,
  '/blog': <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />,
  '/contact': <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />,
};

export interface LaptopHeroProps {
  onNavigate: (route: PortfolioRoute) => void;
  wallpaperUrl?: string;
}

export default function LaptopHero({
  onNavigate,
  wallpaperUrl = DEFAULT_WALLPAPER_URL,
}: LaptopHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  const [brand, setBrand] = useState<LaptopBrandId>('apple');
  const [colorwayId, setColorwayId] = useState<string>(
    LAPTOP_BRANDS.apple.colorways[0].id,
  );
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Lid starts closed on initial page load
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [isScreenOn, setIsScreenOn] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleToggleLid = () => {
    setIsLidOpen((prev) => {
      const next = !prev;
      if (!next) {
        // Closing the lid turns off the screen & dismisses the manga dialog
        setIsScreenOn(false);
        setIsDialogOpen(false);
      }
      return next;
    });
  };

  const handleTogglePower = () => {
    if (!isLidOpen) return;
    setIsScreenOn((prev) => {
      const next = !prev;
      if (!next) {
        setIsDialogOpen(false);
      }
      return next;
    });
  };

  const handleWallpaperClick = () => {
    if (!isLidOpen || !isScreenOn) return;
    setIsDialogOpen((prev) => !prev);
  };

  // Allow Escape to close the Manga Dialog when open
  useEffect(() => {
    if (!isDialogOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsDialogOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDialogOpen]);

  const activeBrand = LAPTOP_BRANDS[brand];
  const activeColorway = getLaptopColorway(brand, colorwayId);

  const statusText = !isLidOpen
    ? 'Lid Closed · Click laptop or Open Lid'
    : !isScreenOn
      ? 'Lid Open · Press glass bubble on left to power on'
      : !isDialogOpen
        ? 'Screen On · Click wallpaper to open menu'
        : 'Menu Ready · Choose a destination';

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-[#cbd5e1] bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#f1f5f9_58%,#e2e8f0_100%)] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      {/* Subtle Architectural Swiss Dot Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Bar: Status Hint + Brand Customizer + Open/Close Lid Control */}
      <div className="pointer-events-none absolute top-3 right-3 left-3 z-20 flex flex-wrap items-center justify-between gap-2 sm:top-5 sm:right-5 sm:left-5">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#cbd5e1] bg-white/90 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#334155] shadow-xs backdrop-blur-md">
          <RotateCw className="h-3.5 w-3.5 text-[#ea580c]" aria-hidden="true" />
          <span>360° Orbit · Scroll Zoom</span>
          <span className="hidden text-[#94a3b8] sm:inline">|</span>
          <span className="hidden text-[#64748b] sm:inline">{statusText}</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCustomizerOpen((v) => !v)}
            aria-expanded={isCustomizerOpen}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#cbd5e1] bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0f172a] shadow-xs backdrop-blur-md transition-colors hover:border-[#64748b] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:outline-none"
          >
            <Palette className="h-3.5 w-3.5 text-[#ea580c]" aria-hidden="true" />
            <span>{activeBrand.name}</span>
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full border border-[#94a3b8]"
              style={{ background: activeColorway.swatch }}
            />
          </button>

          <button
            type="button"
            onClick={handleToggleLid}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#0f172a] bg-[#0f172a] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1e293b] focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:outline-none"
          >
            <Laptop className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isLidOpen ? 'Close Lid' : 'Open Lid'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Brand & Shell Customizer Popover */}
      <AnimatePresence>
        {isCustomizerOpen && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-14 right-3 z-30 w-72 rounded-2xl border border-[#cbd5e1] bg-white p-3.5 shadow-xl sm:top-16 sm:right-5"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold tracking-wider text-[#475569] uppercase">
                Custom Laptop Model
              </span>
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(false)}
                aria-label="Close customizer"
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:outline-none"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(LAPTOP_BRANDS) as LaptopBrandId[]).map((id) => {
                const item = LAPTOP_BRANDS[id];
                const selected = brand === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setBrand(id);
                      setColorwayId(item.colorways[0].id);
                    }}
                    className={`cursor-pointer rounded-xl border px-2.5 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:outline-none ${
                      selected
                        ? 'border-[#0f172a] bg-[#0f172a] text-white'
                        : 'border-[#e2e8f0] bg-[#f8fafc] text-[#334155] hover:border-[#94a3b8]'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.name}</div>
                    <div
                      className={`text-[10px] ${
                        selected ? 'text-[#cbd5e1]' : 'text-[#64748b]'
                      }`}
                    >
                      {item.tagline}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 border-t border-[#e2e8f0] pt-2.5">
              <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] font-semibold tracking-wider text-[#64748b] uppercase">
                <span>Factory Colorway</span>
                <span className="text-[#0f172a] normal-case">{activeColorway.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {activeBrand.colorways.map((cw) => {
                  const isActive = activeColorway.id === cw.id;
                  return (
                    <button
                      key={cw.id}
                      type="button"
                      title={cw.name}
                      aria-label={`${activeBrand.name} colorway ${cw.name}`}
                      aria-pressed={isActive}
                      onClick={() => setColorwayId(cw.id)}
                      className={`h-7 w-7 cursor-pointer rounded-full border transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:outline-none ${
                        isActive
                          ? 'scale-110 border-[#0f172a] ring-2 ring-[#ea580c]/60'
                          : 'border-[#cbd5e1]'
                      }`}
                      style={{ background: cw.swatch }}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center 3D Laptop Canvas */}
      <div className="h-full w-full">
        <Laptop3D
          brand={brand}
          colorwayId={colorwayId}
          wallpaperUrl={wallpaperUrl}
          isLidOpen={isLidOpen}
          isScreenOn={isScreenOn}
          isDialogOpen={isDialogOpen}
          onToggleLid={handleToggleLid}
          onScreenWallpaperClick={handleWallpaperClick}
        />
      </div>

      {/* ============================================================
          LEFT FLOATING TRANSPARENT BUBBLE POWER BUTTON (visible when lid open)
         ============================================================ */}
      <AnimatePresence>
        {isLidOpen && (
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.6, x: -20 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: [0, -6, 0],
                  }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.6, x: -20 }
            }
            transition={{
              opacity: { duration: 0.22 },
              scale: { type: 'spring', stiffness: 320, damping: 22 },
              x: { type: 'spring', stiffness: 320, damping: 22 },
              y: prefersReducedMotion
                ? undefined
                : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute top-1/2 left-4 z-20 -translate-y-1/2 sm:left-8 md:left-14 lg:left-20"
          >
            <button
              type="button"
              onClick={handleTogglePower}
              aria-pressed={isScreenOn}
              aria-label={isScreenOn ? 'Turn off laptop screen' : 'Turn on laptop screen'}
              title={isScreenOn ? 'Power Off Screen' : 'Power On Screen'}
              className={`group relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:outline-none active:scale-95 sm:h-16 sm:w-16 ${
                isScreenOn
                  ? 'border-[#38bdf8]/80 bg-white/25 shadow-[0_0_28px_rgba(56,189,248,0.45),inset_0_2px_10px_rgba(255,255,255,0.85)]'
                  : 'border-white/70 bg-white/18 shadow-[0_12px_30px_rgba(15,23,42,0.16),inset_0_2px_10px_rgba(255,255,255,0.85)] hover:bg-white/30'
              }`}
            >
              {/* Glass bubble specular highlight */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1.5 left-2.5 h-3.5 w-6 -rotate-25 rounded-full bg-white/65 blur-[1px]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 bottom-1.5 h-2 w-2 rounded-full bg-white/50"
              />

              <Power
                className={`h-6 w-6 transition-colors duration-200 ${
                  isScreenOn
                    ? 'text-[#0284c7] drop-shadow-[0_0_8px_rgba(56,189,248,0.65)]'
                    : 'text-[#334155] group-hover:text-[#0f172a]'
                }`}
                aria-hidden="true"
              />
            </button>

            <div className="mt-2 text-center font-mono text-[10px] font-bold tracking-wider text-[#475569] uppercase">
              {isScreenOn ? 'ON' : 'POWER'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          RIGHT MANGA-STYLE NAVIGATION DIALOG (Opaque, crisp ink panel)
         ============================================================ */}
      <AnimatePresence>
        {isLidOpen && isScreenOn && isDialogOpen && (
          <motion.aside
            role="dialog"
            aria-label="Portfolio Manga Navigation Menu"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: 24, scale: 0.96 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, x: 0, scale: 1 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: 24, scale: 0.96 }
            }
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="absolute right-3 bottom-12 left-3 z-30 sm:top-1/2 sm:right-6 sm:bottom-auto sm:left-auto sm:w-[300px] sm:-translate-y-1/2 md:right-12 md:w-[320px] lg:right-16"
          >
            <div className="relative border-[3px] border-[#111111] bg-[#ffffff] text-[#111111] shadow-[7px_7px_0px_#111111]">
              {/* Manga speech-bubble pointer pointing left toward the laptop screen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 -left-[18px] hidden -translate-y-1/2 sm:block"
              >
                <div className="h-0 w-0 border-y-[12px] border-r-[18px] border-y-transparent border-r-[#111111]" />
                <div className="absolute top-1/2 left-[4px] h-0 w-0 -translate-y-1/2 border-y-[9px] border-r-[14px] border-y-transparent border-r-[#ffffff]" />
              </div>

              {/* Manga Panel Header Strip with subtle halftone dots */}
              <div
                className="relative flex items-center justify-between border-b-[3px] border-[#111111] bg-[#111111] px-3.5 py-2.5 text-[#ffffff]"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)',
                  backgroundSize: '8px 8px',
                }}
              >
                <div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#fb923c] uppercase">
                    SYS // DIALOG
                  </div>
                  <h2 className="text-sm font-black tracking-wide uppercase">
                    Select Destination
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex h-7 w-7 cursor-pointer items-center justify-center border-2 border-[#ffffff] bg-[#111111] text-[#ffffff] transition-colors hover:bg-[#ea580c] hover:text-[#111111] focus-visible:ring-2 focus-visible:ring-[#fb923c] focus-visible:outline-none"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Manga Chapter Route Options */}
              <nav aria-label="Portfolio routes" className="divide-y-2 divide-[#111111] bg-[#ffffff]">
                {MANGA_NAV_OPTIONS.map((option) => (
                  <button
                    key={option.href}
                    type="button"
                    onClick={() => onNavigate(option.href)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-3 bg-[#ffffff] px-3.5 py-3 text-left transition-colors duration-150 hover:bg-[#111111] hover:text-[#ffffff] focus-visible:bg-[#111111] focus-visible:text-[#ffffff] focus-visible:outline-none"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[#111111] bg-[#f8fafc] text-[#111111] transition-colors group-hover:border-[#ea580c] group-hover:bg-[#ea580c] group-hover:text-[#ffffff]">
                        {OPTION_ICONS[option.href]}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold tracking-widest text-[#ea580c]">
                            {option.chapter}
                          </span>
                          <span className="text-sm font-black tracking-wider uppercase">
                            {option.label}
                          </span>
                        </div>
                        <p className="truncate text-xs text-[#475569] group-hover:text-[#cbd5e1] group-focus-visible:text-[#cbd5e1]">
                          {option.subtitle}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-[#111111] transition-transform duration-150 group-hover:translate-x-1 group-hover:text-[#ea580c] group-focus-visible:text-[#ea580c]"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </nav>

              {/* Manga Bottom Narration Bar */}
              <div className="flex items-center justify-between border-t-[3px] border-[#111111] bg-[#f8fafc] px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-wider text-[#334155] uppercase">
                <span>PORTFOLIO VER 2.4</span>
                <span>ESC TO CLOSE</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Bottom Subtle Interaction Prompt */}
      <div className="pointer-events-none absolute right-4 bottom-3 left-4 z-10 flex items-center justify-center sm:bottom-4">
        <div className="rounded-full border border-[#cbd5e1]/80 bg-white/80 px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#475569] uppercase backdrop-blur-xs sm:hidden">
          {statusText}
        </div>
      </div>
    </div>
  );
}
